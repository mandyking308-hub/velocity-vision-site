import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import LeadActionPanel, { type ActionLead } from "@/components/app/LeadActionPanel";
import { bucketCounts, deriveFollowUpState, STATE_LABEL, STATE_TONE, type FollowUpState } from "@/lib/leadStates";
import { MessageSquare, Mail, AlertTriangle, Zap, Flame, Snowflake, Filter, RefreshCw, Send, Upload } from "lucide-react";
import JourneyEmptyState from "@/components/app/JourneyEmptyState";

const TAB_KEYS: { id: "action" | FollowUpState; labelKey: string; icon: any }[] = [
  { id: "action", labelKey: "needsAction", icon: AlertTriangle },
  { id: "replied", labelKey: "replied", icon: MessageSquare },
  { id: "overdue", labelKey: "overdue", icon: Mail },
  { id: "due", labelKey: "due", icon: Mail },
  { id: "warm", labelKey: "warm", icon: Flame },
  { id: "dormant", labelKey: "dormant", icon: Snowflake },
  { id: "snoozed", labelKey: "snoozed", icon: Zap },
  { id: "bounced", labelKey: "bounced", icon: AlertTriangle },
];

export default function AppFollowUp() {
  const { t } = useTranslation("app");
  const tc = useTranslation("common").t;
  const [leads, setLeads] = useState<ActionLead[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"action" | FollowUpState>("action");
  const [q, setQ] = useState("");
  const [campaign, setCampaign] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from("leads").select("id, name, email, phone, status, follow_up_at, follow_up_state, replied_at, snoozed_until, last_email_sent_at, last_email_subject, last_contacted_at, last_interaction_at, opportunity_id, owner_id, campaign_id, company_id, contact_id, last_action, created_at").order("created_at", { ascending: false }),
      supabase.from("campaigns").select("id, name"),
    ]);
    setLeads((l || []) as any);
    setCampaigns(Object.fromEntries((c || []).map((x: any) => [x.id, x.name])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => bucketCounts(leads), [leads]);
  const needsAction = useMemo(
    () => leads.filter((l) => ["overdue", "due", "replied"].includes(deriveFollowUpState(l))),
    [leads]
  );

  const filtered = useMemo(() => {
    const base = tab === "action" ? needsAction : leads.filter((l) => deriveFollowUpState(l) === tab);
    return base
      .filter((l) => (campaign === "all" ? true : l.campaign_id === campaign))
      .filter((l) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (l.name || "").toLowerCase().includes(s) || (l.email || "").toLowerCase().includes(s);
      });
  }, [tab, needsAction, leads, q, campaign]);

  if (!loading && leads.length === 0) {
    return (
      <div className="space-y-5 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("followUp.title")}</h1>
          <p className="text-muted-foreground">{t("followUp.subtitle")}</p>
        </div>
        <JourneyEmptyState
          icon={MessageSquare}
          flow="Step 4 of the journey — Activate → Reply → Pipeline"
          title={t("followUp.empty.title")}
          description={t("followUp.empty.description")}
          steps={[
            { to: "/app/activate", label: "Activate a safe segment", icon: Send },
            { to: "/app/data-vault/upload", label: "Upload contacts first", icon: Upload },
            { to: "/app/campaigns", label: "View campaigns", variant: "ghost" },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("followUp.title")}</h1>
          <p className="text-muted-foreground">{t("followUp.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> {tc("actions.refresh")}</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Stat label={t("followUp.stats.needsAction")} value={needsAction.length} tone="warn" />
        <Stat label={t("followUp.stats.replied")} value={counts.replied} tone="good" />
        <Stat label={t("followUp.stats.overdue")} value={counts.overdue} tone="danger" />
        <Stat label={t("followUp.stats.due")} value={counts.due} tone="warn" />
        <Stat label={t("followUp.stats.warm")} value={counts.warm} tone="warn" />
        <Stat label={t("followUp.stats.dormant")} value={counts.dormant} />
        <Stat label={t("followUp.stats.inPipeline")} value={counts.in_pipeline} tone="good" />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b">
        {TAB_KEYS.map((tk) => {
          const n = tk.id === "action" ? needsAction.length : counts[tk.id as FollowUpState];
          const active = tab === tk.id;
          return (
            <button
              key={tk.id}
              onClick={() => setTab(tk.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition ${
                active ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tk.icon className="h-4 w-4" /> {t(`followUp.stats.${tk.labelKey}`)}
              <Badge variant="outline" className="ml-1 h-5">{n}</Badge>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder={t("followUp.filters.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={campaign} onValueChange={setCampaign}>
          <SelectTrigger className="w-[220px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("followUp.filters.allCampaigns")}</SelectItem>
            {Object.entries(campaigns).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">{tc("actions.loading")}</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          {tab === "action" ? t("followUp.empty.caughtUp") : t("followUp.empty.tryFilter")}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((l) => (
            <LeadActionPanel
              key={l.id}
              lead={l}
              onChanged={load}
              campaignName={l.campaign_id ? campaigns[l.campaign_id] : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Replies & Follow-Up</h1>
          <p className="text-muted-foreground">
            Who replied, who's overdue, what's warm, what to chase next. Start your day here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Stat label="Needs action" value={needsAction.length} tone="warn" />
        <Stat label="Replied" value={counts.replied} tone="good" />
        <Stat label="Overdue" value={counts.overdue} tone="danger" />
        <Stat label="Due today" value={counts.due} tone="warn" />
        <Stat label="Warm" value={counts.warm} tone="warn" />
        <Stat label="Dormant" value={counts.dormant} />
        <Stat label="In pipeline" value={counts.in_pipeline} tone="good" />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b">
        {PRIMARY_TABS.map((t) => {
          const n = t.id === "action" ? needsAction.length : counts[t.id as FollowUpState];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition ${
                active ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              <Badge variant="outline" className="ml-1 h-5">{n}</Badge>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={campaign} onValueChange={setCampaign}>
          <SelectTrigger className="w-[220px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {Object.entries(campaigns).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nothing in this queue. {tab === "action" ? "You're caught up." : "Try another filter."}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((l) => (
            <LeadActionPanel
              key={l.id}
              lead={l}
              onChanged={load}
              campaignName={l.campaign_id ? campaigns[l.campaign_id] : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TONE: Record<string, string> = {
  default: "text-foreground", good: "text-emerald-600", warn: "text-amber-600", danger: "text-rose-600",
};
function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: keyof typeof TONE }) {
  return (
    <Card><CardContent className="p-3">
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${TONE[tone]}`}>{value}</div>
    </CardContent></Card>
  );
}
