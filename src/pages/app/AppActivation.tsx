import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, AlertTriangle, Send, ArrowLeft, Pause } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import {
  computeSafety, DEFAULT_SENDER_STATE, maxRiskyOverride, SENDER_HEALTH_LABEL,
  SENDER_HEALTH_TONE, type SenderState,
} from "@/lib/sendSafety";
import type { PlanId } from "@/lib/credits";
import SendSafetyPanel from "@/components/app/SendSafetyPanel";
import SenderStatusCard from "@/components/app/SenderStatusCard";

interface Counts { valid: number; needs_review: number; risky: number; blocked: number; suppressed: number; }

export default function AppActivation() {
  const { user } = useAuth();
  const { remaining, planConfig } = useCredits();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const campaignId = params.get("campaign") || null;

  const [counts, setCounts] = useState<Counts>({ valid: 0, needs_review: 0, risky: 0, blocked: 0, suppressed: 0 });
  const [includeReview, setIncludeReview] = useState(false);
  const [riskyOverride, setRiskyOverride] = useState(0);
  const [riskAck, setRiskAck] = useState(false);
  const [batchSize, setBatchSize] = useState<number>(0);
  const [sender, setSender] = useState<SenderState>(DEFAULT_SENDER_STATE);
  const [fromEmail, setFromEmail] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [usedToday, setUsedToday] = useState(0);
  const [scheduledToday, setScheduledToday] = useState(0);
  const [agencyPooled, setAgencyPooled] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [v, r, k, b, s, conn, sends] = await Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "valid").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "needs_review").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "risky").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "blocked").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "suppressed").not("source_upload_id", "is", null),
        supabase.from("email_connections").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
        supabase.from("email_sends").select("status, sent_at, scheduled_at, created_at"),
      ]);
      const c: Counts = {
        valid: v.count ?? 0, needs_review: r.count ?? 0, risky: k.count ?? 0,
        blocked: b.count ?? 0, suppressed: s.count ?? 0,
      };
      setCounts(c);
      setBatchSize(c.valid);

      const def = conn.data?.[0];
      if (def) {
        setFromEmail(def.from_email);
        const last = (sends.data || []).filter((x: any) => x.status === "sent").map((x: any) => x.sent_at).filter(Boolean).sort().pop() || null;
        const newly = def.last_verified_at ? (Date.now() - new Date(def.last_verified_at).getTime()) < 7 * 86400000 : true;
        const totalSends = (sends.data || []).length || 1;
        const bounces = (sends.data || []).filter((x: any) => x.status === "bounced" || x.status === "failed").length;
        setSender({
          connected: def.status === "connected",
          domain_authenticated: false, // surface as not yet verified by default
          reconnect_required: def.status === "reconnect_required",
          newly_connected: newly,
          last_send_at: last,
          bounce_rate: bounces / totalSends,
          unsubscribe_rate: 0,
        });
      }

      const today = new Date(); today.setHours(0,0,0,0);
      const used = (sends.data || []).filter((x: any) => x.sent_at && new Date(x.sent_at) >= today).length;
      const sched = (sends.data || []).filter((x: any) => x.scheduled_at && new Date(x.scheduled_at) >= today && !x.sent_at).length;
      setUsedToday(used);
      setScheduledToday(sched);
    })();
  }, [user]);

  const plan = (planConfig.id as PlanId) || "starter";
  const safety = useMemo(() => computeSafety({
    plan,
    vault: counts,
    sender,
    sendsUsedToday: usedToday,
    sendsScheduledToday: scheduledToday,
    sendCreditsRemaining: remaining,
  }), [plan, counts, sender, usedToday, scheduledToday, remaining]);

  const safeSelected = Math.min(batchSize, counts.valid);
  const reviewSelected = includeReview ? counts.needs_review : 0;
  const riskyMax = maxRiskyOverride(safeSelected + reviewSelected);
  const riskyClamped = Math.min(riskyOverride, riskyMax, counts.risky);
  const totalSelected = safeSelected + reviewSelected + riskyClamped;
  const sendNow = Math.min(totalSelected, safety.remainingToday);
  const blocked = safety.pauseReasons.length > 0;
  const wantsRisky = riskyClamped > 0;
  const canActivate = sendNow > 0 && !blocked && (!wantsRisky || riskAck);

  async function audit(action: string, details: any) {
    try {
      await (supabase as any).from("send_audit_log").insert({
        action, details, user_id: user!.id, campaign_id: campaignId,
      });
    } catch { /* table is optional/best-effort */ }
  }

  async function handleActivate() {
    if (!canActivate) return;
    await audit("activation_started", {
      batch: sendNow, includeReview, riskyOverride: riskyClamped, plan, safeAllowance: safety.safeAllowance,
    });
    toast.success(`Activation prepared for ${sendNow} contacts. Open your campaign to schedule the send.`);
    if (campaignId) navigate(`/app/campaigns/${campaignId}`);
    else navigate("/app/campaigns");
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Pre-flight: safe activation</h1>
          <p className="text-muted-foreground mt-1">Final check before outreach goes out. We protect your sender reputation by default.</p>
        </div>
        <Badge className={`border-0 ${SENDER_HEALTH_TONE[safety.health]}`}>
          Sender: {SENDER_HEALTH_LABEL[safety.health]}
        </Badge>
      </div>

      <SendSafetyPanel s={safety} used={usedToday} scheduled={scheduledToday} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Build your activation batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Tile label="Safe to activate" value={counts.valid} tone="good" />
              <Tile label="Needs review" value={counts.needs_review} tone="warn" />
              <Tile label="Risky" value={counts.risky} tone="warn" />
              <Tile label="Blocked / suppressed" value={counts.blocked + counts.suppressed} tone="danger" />
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="batch">Safe contacts to include</Label>
                <Input id="batch" type="number" min={0} max={counts.valid}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(0, Math.min(counts.valid, Number(e.target.value) || 0)))} />
                <div className="text-xs text-muted-foreground mt-1">Max {counts.valid} based on your safe segment.</div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="rev" checked={includeReview} onCheckedChange={(v) => setIncludeReview(!!v)} disabled={counts.needs_review === 0} />
                <div>
                  <Label htmlFor="rev" className="font-medium">Include {counts.needs_review} "needs review" contacts</Label>
                  <div className="text-xs text-muted-foreground">These were not auto-classified as fully clean. Review recommended.</div>
                </div>
              </div>

              {counts.risky > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4" /> Risky override
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    Risky records (role addresses, free-mail without company, etc.) are excluded by default to protect deliverability.
                    You can include up to <b>{riskyMax}</b> of them in this batch (≤10% of selected audience).
                  </p>
                  <Input type="number" min={0} max={riskyMax}
                    value={riskyOverride}
                    onChange={(e) => setRiskyOverride(Math.max(0, Math.min(riskyMax, Number(e.target.value) || 0)))}
                  />
                  {riskyClamped > 0 && (
                    <div className="flex items-start gap-2">
                      <Checkbox id="ack" checked={riskAck} onCheckedChange={(v) => setRiskAck(!!v)} />
                      <Label htmlFor="ack" className="text-xs">
                        I understand including risky contacts can hurt sender reputation and accept the deliverability risk.
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {(counts.blocked + counts.suppressed) > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{counts.blocked + counts.suppressed} records permanently excluded</AlertTitle>
                  <AlertDescription>Blocked and suppressed records can never be included — this protects you legally and operationally.</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
              <div className="text-sm font-medium">Pre-flight summary</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <Tile label="Audience selected" value={totalSelected} />
                <Tile label="Will send now" value={sendNow} tone="good" />
                <Tile label="Send credits used" value={sendNow} />
                <Tile label="Today's safe cap" value={safety.safeAllowance} />
              </div>
              {sendNow < totalSelected && (
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  {totalSelected - sendNow} contact(s) will be queued for upcoming days — today's safe cap reached.
                </div>
              )}
              {blocked && (
                <div className="text-xs text-rose-600 flex items-center gap-1"><Pause className="h-3.5 w-3.5" /> Sending is paused — resolve the reasons in the panel above.</div>
              )}
              <Button className="w-full mt-1" size="lg" disabled={!canActivate} onClick={handleActivate}>
                <Send className="h-4 w-4 mr-2" /> Confirm safe activation
              </Button>
              <p className="text-xs text-muted-foreground text-center">Storing contacts is free. Activating outreach consumes send credits.</p>
            </div>
          </CardContent>
        </Card>

        <SenderStatusCard state={sender} health={safety.health} scheduledToday={scheduledToday} fromEmail={fromEmail} />
      </div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" | "danger" }) {
  const t = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "danger" ? "text-rose-600" : "";
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${t}`}>{value}</div>
    </div>
  );
}
