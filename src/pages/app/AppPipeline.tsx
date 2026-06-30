import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, AlertTriangle, TrendingUp, Clock, CheckCircle2, XCircle, MessageSquare, Send } from "lucide-react";
import JourneyEmptyState from "@/components/app/JourneyEmptyState";

const STAGES = ["discovery", "demo", "proposal", "negotiation", "won", "lost"] as const;
type Stage = typeof STAGES[number];

interface Opp {
  id: string; stage: Stage; service: string | null; estimated_value: number | null;
  expected_close_date: string | null; owner_id: string | null;
  source_campaign_id: string | null; source_lead_id: string | null;
  last_interaction_at: string | null; next_action_at: string | null;
  stage_changed_at: string | null; reason_lost: string | null; notes: string | null;
  created_at: string; updated_at: string;
}

const STAGE_TONE: Record<Stage, string> = {
  discovery: "bg-slate-100 text-slate-700",
  demo: "bg-primary/10 text-primary",
  proposal: "bg-amber-100 text-amber-700",
  negotiation: "bg-indigo-100 text-indigo-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
};

export default function AppPipeline() {
  const { t } = useTranslation("app");
  const tc = useTranslation("common").t;
  const [opps, setOpps] = useState<Opp[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [edit, setEdit] = useState<Opp | null>(null);

  const load = async () => {
    const [{ data: o }, { data: c }] = await Promise.all([
      supabase.from("opportunities").select("*").order("updated_at", { ascending: false }),
      supabase.from("campaigns").select("id, name"),
    ]);
    setOpps((o || []) as any);
    setCampaigns(Object.fromEntries((c || []).map((x: any) => [x.id, x.name])));
  };
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    const active = opps.filter((o) => o.stage !== "won" && o.stage !== "lost");
    const stuck = active.filter((o) => o.stage_changed_at && (now - new Date(o.stage_changed_at).getTime()) > 14 * dayMs);
    const overdue = active.filter((o) => o.next_action_at && new Date(o.next_action_at).getTime() < now);
    const value = active.reduce((s, o) => s + Number(o.estimated_value || 0), 0);
    return {
      total: opps.length,
      active: active.length,
      value,
      stuck: stuck.length,
      overdue: overdue.length,
      won: opps.filter((o) => o.stage === "won").length,
      lost: opps.filter((o) => o.stage === "lost").length,
    };
  }, [opps]);

  const moveStage = async (o: Opp, stage: Stage) => {
    await supabase.from("opportunities").update({
      stage: stage as any,
      stage_changed_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
    } as any).eq("id", o.id);
    if (o.source_lead_id) {
      await supabase.from("leads").update({
        follow_up_state: stage === "won" ? "won" : stage === "lost" ? "lost" : "in_pipeline",
        status: stage === "won" ? "closed_won" : stage === "lost" ? "closed_lost" : "demo_scheduled",
      } as any).eq("id", o.source_lead_id);
    }
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("lead_audit_log").insert({
        lead_id: o.source_lead_id, opportunity_id: o.id, user_id: u.user.id,
        action: stage === "won" ? "marked_won" : stage === "lost" ? "marked_lost" : "stage_changed",
        details: { stage },
      });
    }
    toast.success(tc("toasts.moved", { stage: t(`pipeline.stages.${stage}`, { defaultValue: stage }) }));
    load();
  };

  if (opps.length === 0) {
    return (
      <div className="space-y-5 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pipeline.title")}</h1>
          <p className="text-muted-foreground">{t("pipeline.subtitle")}</p>
        </div>
        <JourneyEmptyState
          icon={TrendingUp}
          flow="Step 5 of the journey — Reply → Opportunity → Revenue"
          title={t("pipeline.empty.title")}
          description={t("pipeline.empty.description")}
          steps={[
            { to: "/app/follow-up?tab=replied", label: "Work replies", icon: MessageSquare },
            { to: "/app/activate", label: "Activate a segment", icon: Send },
            { to: "/app/performance", label: "View performance", variant: "ghost" },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("pipeline.title")}</h1>
        <p className="text-muted-foreground">{t("pipeline.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        <Stat label={t("pipeline.stats.opportunities")} value={stats.total} />
        <Stat label={t("pipeline.stats.active")} value={stats.active} />
        <Stat label={t("pipeline.stats.value")} value={`£${stats.value.toLocaleString()}`} tone="good" />
        <Stat label={t("pipeline.stats.stuck")} value={stats.stuck} tone="warn" />
        <Stat label={t("pipeline.stats.overdue")} value={stats.overdue} tone="danger" />
        <Stat label={t("pipeline.stats.won")} value={stats.won} tone="good" />
        <Stat label={t("pipeline.stats.lost")} value={stats.lost} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAGES.map((s) => {
          const items = opps.filter((o) => o.stage === s);
          return (
            <div key={s} className="bg-muted/40 rounded-md p-3 min-h-[260px]">
              <div className="flex items-center justify-between mb-3">
                <Badge className={STAGE_TONE[s]}>{s}</Badge>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((o) => {
                  const now = Date.now();
                  const stuck = o.stage !== "won" && o.stage !== "lost" && o.stage_changed_at &&
                    (now - new Date(o.stage_changed_at).getTime()) > 14 * 86400000;
                  const overdue = o.next_action_at && new Date(o.next_action_at).getTime() < now;
                  return (
                    <Card key={o.id} className="cursor-pointer hover:shadow-md" onClick={() => setEdit(o)}>
                      <CardContent className="p-3 space-y-1">
                        <div className="text-sm font-medium truncate">{o.service || "Opportunity"}</div>
                        {o.estimated_value != null && (
                          <div className="text-xs text-emerald-700">£{Number(o.estimated_value).toLocaleString()}</div>
                        )}
                        {o.source_campaign_id && (
                          <div className="text-[11px] text-muted-foreground truncate">via {campaigns[o.source_campaign_id] || "campaign"}</div>
                        )}
                        {o.expected_close_date && (
                          <div className="text-[11px] text-muted-foreground">Close: {new Date(o.expected_close_date).toLocaleDateString()}</div>
                        )}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {stuck && <Badge variant="outline" className="bg-amber-100 text-amber-700 text-[10px]"><AlertTriangle className="h-3 w-3 mr-0.5" />Stuck</Badge>}
                          {overdue && <Badge variant="outline" className="bg-rose-100 text-rose-700 text-[10px]"><Clock className="h-3 w-3 mr-0.5" />Overdue</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {items.length === 0 && <div className="text-xs text-muted-foreground">—</div>}
              </div>
            </div>
          );
        })}
      </div>

      <OppEditor opp={edit} onClose={() => setEdit(null)} onMove={moveStage} onSaved={load} />
    </div>
  );
}

function OppEditor({ opp, onClose, onMove, onSaved }: {
  opp: Opp | null; onClose: () => void;
  onMove: (o: Opp, s: Stage) => void; onSaved: () => void;
}) {
  const tc = useTranslation("common").t;
  const [value, setValue] = useState("");
  const [close, setClose] = useState("");
  const [next, setNext] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    if (!opp) return;
    setValue(opp.estimated_value?.toString() || "");
    setClose(opp.expected_close_date || "");
    setNext(opp.next_action_at ? opp.next_action_at.slice(0, 10) : "");
    setNotes(opp.notes || "");
    setReason(opp.reason_lost || "");
  }, [opp]);

  if (!opp) return null;
  const save = async () => {
    await supabase.from("opportunities").update({
      estimated_value: value ? Number(value) : null,
      expected_close_date: close || null,
      next_action_at: next ? new Date(next).toISOString() : null,
      notes: notes || null,
      reason_lost: reason || null,
      last_interaction_at: new Date().toISOString(),
    } as any).eq("id", opp.id);
    toast.success(tc("toasts.saved"));
    onSaved(); onClose();
  };

  return (
    <Dialog open={!!opp} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{opp.service || "Opportunity"} — <Badge className={STAGE_TONE[opp.stage]}>{opp.stage}</Badge></DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated value (£)"><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
            <Field label="Expected close"><Input type="date" value={close} onChange={(e) => setClose(e.target.value)} /></Field>
            <Field label="Next action by"><Input type="date" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
            <Field label="Move to stage">
              <Select value={opp.stage} onValueChange={(v) => onMove(opp, v as Stage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Notes"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          {opp.stage === "lost" && (
            <Field label="Reason lost"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Price, timing, no decision…" /></Field>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: any) { return <div><div className="text-xs font-medium mb-1">{label}</div>{children}</div>; }
const TONE: Record<string, string> = { default: "text-foreground", good: "text-emerald-600", warn: "text-amber-600", danger: "text-rose-600" };
function Stat({ label, value, tone = "default" }: { label: string; value: number | string; tone?: keyof typeof TONE }) {
  return <Card><CardContent className="p-3">
    <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
    <div className={`text-xl font-bold ${TONE[tone]}`}>{value}</div>
  </CardContent></Card>;
}
