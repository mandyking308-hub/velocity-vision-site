import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, AlertTriangle, Send, ArrowLeft, Pause, Upload, Mail, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  computeSafety,
  DEFAULT_SENDER_STATE,
  maxRiskyOverride,
  SENDER_HEALTH_LABEL,
  SENDER_HEALTH_TONE,
  type SenderState,
} from "@/lib/sendSafety";
import type { PlanId } from "@/lib/credits";
import SendSafetyPanel from "@/components/app/SendSafetyPanel";
import CampaignPreflight from "@/components/app/CampaignPreflight";
import { runPreflight, activationGate, canExecuteActivation } from "@/lib/campaignPreflight";
import SenderStatusCard from "@/components/app/SenderStatusCard";
import JourneyEmptyState from "@/components/app/JourneyEmptyState";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import { useLegalStatus } from "@/lib/legalCompliance";
import { computeReadiness, warmupCap } from "@/lib/senderReadiness";

interface Counts {
  valid: number;
  needs_review: number;
  risky: number;
  blocked: number;
  suppressed: number;
}

type CampaignRow = {
  id: string;
  name: string;
  status: string | null;
  goal?: string | null;
  pack?: any;
  brief?: any;
  approved_at?: string | null;
  is_sample?: boolean | null;
};

export default function AppActivation() {
  const { user } = useAuth();
  const { planConfig } = useCredits();
  const { currentId } = useWorkspace();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const campaignId = params.get("campaign") || null;
  const legal = useLegalStatus();

  const [counts, setCounts] = useState<Counts>({ valid: 0, needs_review: 0, risky: 0, blocked: 0, suppressed: 0 });
  const [includeReview, setIncludeReview] = useState(false);
  const [riskyOverride, setRiskyOverride] = useState(0);
  const [riskAck, setRiskAck] = useState(false);
  const [batchSize, setBatchSize] = useState(0);
  const [sender, setSender] = useState<SenderState>(DEFAULT_SENDER_STATE);
  const [fromEmail, setFromEmail] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [defaultConn, setDefaultConn] = useState<any>(null);
  const [senderDetail, setSenderDetail] = useState<any>(null);
  const [usedToday, setUsedToday] = useState(0);
  const [scheduledToday, setScheduledToday] = useState(0);
  const [agencyPooled, setAgencyPooled] = useState(0);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "");
  const [activating, setActivating] = useState(false);
  const [legalGateOpen, setLegalGateOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const connQ = supabase.from("email_connections").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      const sendsQ = supabase.from("email_sends").select("status, sent_at, scheduled_at, created_at");
      const countByQuality = (status: string) => {
        let q = supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", status);
        if (currentId) q = q.eq("workspace_id", currentId);
        return q;
      };

      const [valid, review, risky, blocked, suppressed, conn, sends] = await Promise.all([
        countByQuality("valid"),
        countByQuality("needs_review"),
        countByQuality("risky"),
        countByQuality("blocked"),
        countByQuality("suppressed"),
        currentId ? connQ.eq("workspace_id", currentId) : connQ,
        currentId ? sendsQ.eq("workspace_id", currentId) : sendsQ,
      ]);

      const nextCounts: Counts = {
        valid: valid.count ?? 0,
        needs_review: review.count ?? 0,
        risky: risky.count ?? 0,
        blocked: blocked.count ?? 0,
        suppressed: suppressed.count ?? 0,
      };
      setCounts(nextCounts);
      setBatchSize(nextCounts.valid);

      const def = conn.data?.[0] || null;
      setDefaultConn(def);
      if (def) {
        setConnectionId(def.id);
        setFromEmail(def.from_email);
        setSenderDetail({
          verification_status: def.verification_status,
          mx_status: def.mx_status,
          spf_status: def.spf_status,
          dkim_status: def.dkim_status,
          dmarc_status: def.dmarc_status,
          sending_enabled: def.sending_enabled,
          dns_checked_at: def.dns_checked_at,
        });
        const readiness = computeReadiness(def as any);
        const dnsVerified = def.verification_status === "verified" && def.sending_enabled === true;
        const readyWarmup = readiness.canSendWarmup;
        const warmCap = readyWarmup && !dnsVerified ? warmupCap((planConfig.id as PlanId) || "starter") : null;
        const sentRows = (sends.data || []).filter((x: any) => x.status === "sent");
        const last = sentRows.map((x: any) => x.sent_at).filter(Boolean).sort().pop() || null;
        const newlyConnected = def.last_verified_at ? Date.now() - new Date(def.last_verified_at).getTime() < 7 * 86400000 : true;
        const totalSends = (sends.data || []).length || 1;
        const bounces = (sends.data || []).filter((x: any) => x.status === "bounced" || x.status === "failed").length;
        setSender({
          connected: def.status === "connected",
          domain_authenticated: dnsVerified || readyWarmup,
          reconnect_required: def.status === "reconnect_required" || def.verification_status === "reconnect_required",
          newly_connected: newlyConnected,
          last_send_at: last,
          bounce_rate: bounces / totalSends,
          unsubscribe_rate: 0,
          warmup_daily_cap: warmCap,
        });
      } else {
        setConnectionId(null);
        setFromEmail(null);
        setSenderDetail(null);
        setSender(DEFAULT_SENDER_STATE);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setUsedToday((sends.data || []).filter((x: any) => x.sent_at && new Date(x.sent_at) >= today).length);
      setScheduledToday((sends.data || []).filter((x: any) => x.scheduled_at && new Date(x.scheduled_at) >= today && !x.sent_at).length);

      if ((planConfig.id as PlanId) === "agency") {
        const { data: pooled } = await (supabase as any).rpc("agency_pooled_sends_today");
        setAgencyPooled(typeof pooled === "number" ? pooled : 0);
      } else {
        setAgencyPooled(0);
      }

      let campQ = supabase
        .from("campaigns")
        .select("id, name, status, goal, pack, brief, approved_at, is_sample")
        .order("created_at", { ascending: false })
        .limit(50);
      if (currentId) campQ = campQ.eq("workspace_id", currentId);
      const { data: campData } = await campQ;
      const list = (campData || []) as CampaignRow[];
      setCampaigns(list);
      setSelectedCampaign((current) => {
        if (current && list.some((c) => c.id === current)) return current;
        const requested = campaignId ? list.find((c) => c.id === campaignId) : null;
        const draft = list.find((c) => c.status === "draft" || c.status === "scheduled");
        return (requested || draft || list[0])?.id || "";
      });
    })();
  }, [user, currentId, planConfig.id, campaignId]);

  const plan = (planConfig.id as PlanId) || "starter";
  const safety = useMemo(() => computeSafety({
    plan,
    vault: counts,
    sender,
    sendsUsedToday: usedToday,
    sendsScheduledToday: scheduledToday,
    agencyPooledSendsToday: agencyPooled,
  }), [plan, counts, sender, usedToday, scheduledToday, agencyPooled]);

  const eligibleSelected = Math.min(batchSize, counts.valid);
  const reviewSelected = includeReview ? counts.needs_review : 0;
  const riskyMax = maxRiskyOverride(eligibleSelected + reviewSelected);
  const riskyClamped = Math.min(riskyOverride, riskyMax, counts.risky);
  const totalSelected = eligibleSelected + reviewSelected + riskyClamped;
  const sendTodayPreview = Math.min(totalSelected, safety.remainingToday);
  const wantsRisky = riskyClamped > 0;
  const targetCampaignId = selectedCampaign || campaignId || null;
  const selectedCampaignRow = campaigns.find((c) => c.id === targetCampaignId) || null;
  const senderReadinessState = computeReadiness(defaultConn as any).state;

  const buildPreflightInput = (campaignRow: CampaignRow | null, legalAccepted = legal.isCompliant) => ({
    scope: "campaign" as const,
    campaign: campaignRow,
    safeContacts: counts.valid,
    reviewContacts: counts.needs_review,
    senderState: defaultConn ? senderReadinessState : null,
    senderEmail: fromEmail,
    remainingToday: safety.remainingToday,
    pauseReasons: safety.pauseReasons,
    legalAccepted,
    unsubscribeReady: false,
  });

  const preflight = useMemo(
    () => runPreflight(buildPreflightInput(selectedCampaignRow)),
    [selectedCampaignRow, counts, defaultConn, senderReadinessState, fromEmail, safety, legal.isCompliant],
  );
  const gate = useMemo(() => activationGate(preflight), [preflight]);
  const execVerdict = useMemo(() => canExecuteActivation(preflight, selectedCampaignRow), [preflight, selectedCampaignRow]);
  const canActivate = totalSelected > 0 && execVerdict.ok && gate.ok && (!wantsRisky || riskAck) && !!targetCampaignId && !activating;

  async function audit(action: string, details: any) {
    if (!user) return;
    try {
      await (supabase as any).from("send_audit_log").insert({ action, details, user_id: user.id, campaign_id: targetCampaignId });
    } catch { /* best-effort only */ }
  }

  async function fetchContactsByQuality(status: "valid" | "needs_review" | "risky", limit: number) {
    if (limit <= 0) return [] as any[];
    let q = supabase
      .from("contacts")
      .select("id, email, first_name, last_name, company_id, quality_status, duplicate_flag, blocked, suppressed")
      .eq("quality_status", status)
      .eq("blocked", false)
      .eq("suppressed", false)
      .eq("duplicate_flag", false)
      .not("email", "is", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (currentId) q = q.eq("workspace_id", currentId);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function runActivation(acceptedNow = false) {
    if (!user || !targetCampaignId) return;
    const uiResult = runPreflight(buildPreflightInput(selectedCampaignRow, acceptedNow || legal.isCompliant));
    const uiVerdict = canExecuteActivation(uiResult, selectedCampaignRow);
    if (!uiVerdict.ok) {
      toast.error("Activation preparation blocked", { description: uiVerdict.reason });
      return;
    }
    if (wantsRisky && !riskAck) {
      toast.error("Confirm the risky-record acknowledgement first.");
      return;
    }

    setActivating(true);
    try {
      const { data: freshRow, error: freshError } = await supabase
        .from("campaigns")
        .select("id, name, status, goal, pack, brief, approved_at, is_sample")
        .eq("id", targetCampaignId)
        .maybeSingle();
      if (freshError) throw freshError;

      const liveResult = runPreflight(buildPreflightInput((freshRow as CampaignRow | null) ?? null, acceptedNow || legal.isCompliant));
      const liveVerdict = canExecuteActivation(liveResult, freshRow as CampaignRow | null);
      if (!liveVerdict.ok) {
        await audit("activation_blocked_preflight", { campaign_id: targetCampaignId, blocker_ids: liveVerdict.blockerIds });
        toast.error("Activation preparation blocked", { description: liveVerdict.reason });
        return;
      }

      await audit("activation_started", {
        campaign_id: targetCampaignId,
        batch: totalSelected,
        includeReview,
        riskyOverride: riskyClamped,
        plan,
      });

      const validContacts = await fetchContactsByQuality("valid", eligibleSelected);
      const reviewContacts = includeReview ? await fetchContactsByQuality("needs_review", reviewSelected) : [];
      const riskyContacts = riskyClamped > 0 ? await fetchContactsByQuality("risky", riskyClamped) : [];
      const chosen = [...validContacts, ...reviewContacts, ...riskyContacts];
      const contactIds = chosen.map((c) => c.id);

      let existingContactIds = new Set<string>();
      if (contactIds.length) {
        const { data: existing } = await supabase.from("leads").select("contact_id").eq("campaign_id", targetCampaignId).in("contact_id", contactIds);
        existingContactIds = new Set((existing || []).map((l: any) => l.contact_id).filter(Boolean));
      }

      const rows = chosen.filter((c) => !existingContactIds.has(c.id)).map((c) => ({
        source: "activation",
        contact_id: c.id,
        company_id: c.company_id,
        campaign_id: targetCampaignId,
        workspace_id: currentId,
        email: c.email,
        name: [c.first_name, c.last_name].filter(Boolean).join(" ") || null,
        status: "new" as const,
        created_by: user.id,
        owner_id: user.id,
      }));

      let created = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const slice = rows.slice(i, i + 100);
        const { error, count } = await supabase.from("leads").insert(slice as any, { count: "exact" });
        if (error) throw error;
        created += count ?? slice.length;
      }

      await audit("activation_completed", {
        campaign_id: targetCampaignId,
        requested: chosen.length,
        already_linked: existingContactIds.size,
        leads_created: created,
        includeReview,
        riskyIncluded: riskyClamped,
      });
      toast.success(`${created} lead${created === 1 ? "" : "s"} prepared in the campaign`);
      navigate(`/app/campaigns/${targetCampaignId}`);
    } catch (e: any) {
      await audit("activation_failed", { error: String(e?.message || "activation_failed").slice(0, 180) });
      toast.error("Activation preparation failed", { description: e?.message });
    } finally {
      setActivating(false);
    }
  }

  async function handleActivate() {
    if (!targetCampaignId || totalSelected <= 0 || activating) return;
    if (!legal.isCompliant) {
      setLegalGateOpen(true);
      return;
    }
    if (!canActivate) {
      toast.error("Resolve the activation-preparation checks first.", { description: execVerdict.reason || gate.firstBlocker?.detail });
      return;
    }
    await runActivation();
  }

  const totalContacts = counts.valid + counts.needs_review + counts.risky + counts.blocked + counts.suppressed;
  const noData = totalContacts === 0;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Activate: prepare eligible contacts as campaign leads</h1>
          <p className="text-muted-foreground mt-1">This screen prepares selected records inside the campaign. It does not send email and does not consume Campaign Credits.</p>
        </div>
        <Badge className={`border-0 ${SENDER_HEALTH_TONE[safety.health]}`}>Send preview: {SENDER_HEALTH_LABEL[safety.health]}</Badge>
      </div>

      {noData ? (
        <JourneyEmptyState
          icon={Upload}
          flow="Step 1 — Upload → Review → Prepare"
          title="You haven't uploaded any contacts yet"
          description="Upload authorized business data, review the workspace flags, then return here to prepare eligible records inside a campaign."
          why="Data review and activation preparation do not spend Campaign Credits. Credits currently fund credit-priced AI generation such as a full campaign pack."
          steps={[{ to: "/app/data-vault/upload", label: "Upload contacts", icon: Upload }, { to: "/app/data-vault", label: "View Data Vault" }]}
        />
      ) : counts.valid === 0 && counts.needs_review === 0 && counts.risky === 0 ? (
        <JourneyEmptyState
          icon={ShieldCheck}
          flow={`Step 2 — ${totalContacts} records uploaded but none currently eligible`}
          title="No records available for activation preparation"
          description="Every uploaded record is currently blocked or suppressed. Review the records or import a different authorized dataset."
          steps={[{ to: "/app/data-vault", label: "Open Data Vault", icon: ShieldCheck }, { to: "/app/data-vault/upload", label: "Upload another list", icon: Upload }]}
        />
      ) : (
        <>
          {!legal.loading && !legal.isCompliant && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Current legal terms must be accepted before activation preparation</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{legal.missing.length} document{legal.missing.length === 1 ? "" : "s"} changed since your last acceptance.</p>
                <Button size="sm" variant="secondary" onClick={() => setLegalGateOpen(true)}>Review and accept terms</Button>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertTitle>Sending remains a separate step</AlertTitle>
            <AlertDescription>
              The sender status and daily allowance below are a preview only. They do not block lead preparation here. Before a real send, the send path rechecks the paid plan, mailbox state, unsubscribe handling and current safety allowance.
            </AlertDescription>
          </Alert>

          <SendSafetyPanel s={safety} used={usedToday} scheduled={scheduledToday} />
          <CampaignPreflight result={preflight} title="Activation-preparation preflight" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Build the preparation batch</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <Tile label="Eligible under current checks" value={counts.valid} tone="good" />
                  <Tile label="Needs review" value={counts.needs_review} tone="warn" />
                  <Tile label="Risky" value={counts.risky} tone="warn" />
                  <Tile label="Blocked / suppressed" value={counts.blocked + counts.suppressed} tone="danger" />
                </div>

                <div>
                  <Label htmlFor="batch">Eligible contacts to include</Label>
                  <Input id="batch" type="number" min={0} max={counts.valid} value={batchSize} onChange={(e) => setBatchSize(Math.max(0, Math.min(counts.valid, Number(e.target.value) || 0)))} />
                  <p className="text-xs text-muted-foreground mt-1">Maximum {counts.valid} records currently marked valid by workspace checks.</p>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="rev" checked={includeReview} onCheckedChange={(v) => setIncludeReview(!!v)} disabled={counts.needs_review === 0} />
                  <div>
                    <Label htmlFor="rev" className="font-medium">I have reviewed and want to include {counts.needs_review} “needs review” record{counts.needs_review === 1 ? "" : "s"}</Label>
                    <p className="text-xs text-muted-foreground">Selecting this is a customer decision. The workspace label is not legal approval.</p>
                  </div>
                </div>

                {counts.risky > 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium"><AlertTriangle className="h-4 w-4" /> Risky-record override</div>
                    <p className="text-xs text-amber-900 dark:text-amber-200">Risky records are excluded by default. You may explicitly include up to <strong>{riskyMax}</strong> in this batch under the current override cap. This does not establish lawful basis or guarantee deliverability.</p>
                    <Input type="number" min={0} max={riskyMax} value={riskyOverride} onChange={(e) => setRiskyOverride(Math.max(0, Math.min(riskyMax, Number(e.target.value) || 0)))} />
                    {riskyClamped > 0 && <div className="flex items-start gap-2"><Checkbox id="ack" checked={riskAck} onCheckedChange={(v) => setRiskAck(!!v)} /><Label htmlFor="ack" className="text-xs">I reviewed this override and accept the additional operational and deliverability risk.</Label></div>}
                  </div>
                )}

                {counts.blocked + counts.suppressed > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{counts.blocked + counts.suppressed} blocked or suppressed record{counts.blocked + counts.suppressed === 1 ? "" : "s"} excluded</AlertTitle>
                    <AlertDescription>These records are excluded by current platform suppression and blocking rules. Review the underlying reason in the Data Vault; platform exclusion is not legal advice.</AlertDescription>
                  </Alert>
                )}

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="text-sm font-medium">Preparation summary</div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target campaign</Label>
                    {campaigns.length === 0 ? (
                      <div className="flex items-center justify-between gap-2 rounded border border-dashed border-border p-3">
                        <p className="text-xs text-muted-foreground">Create a campaign before preparing leads.</p>
                        <Button size="sm" variant="outline" onClick={() => navigate("/app/campaigns/new")}><Plus className="h-3.5 w-3.5 mr-1" /> New campaign</Button>
                      </div>
                    ) : (
                      <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                        <SelectTrigger><SelectValue placeholder="Choose a campaign" /></SelectTrigger>
                        <SelectContent>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.status ? ` · ${c.status}` : ""}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    <p className="text-[11px] text-muted-foreground">Selected records are added as campaign leads. No email is sent from this screen.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Tile label="Records selected" value={totalSelected} />
                    <Tile label="Leads to prepare" value={totalSelected} tone="good" />
                    <Tile label="Send preview today" value={sendTodayPreview} />
                    <Tile label="Current send allowance" value={safety.safeAllowance} />
                  </div>
                  {sendTodayPreview < totalSelected && <p className="text-xs text-amber-700 dark:text-amber-400">All selected records can still be prepared as leads if the activation checks pass. A later real send may be limited by the then-current sender and plan allowance.</p>}
                  {safety.pauseReasons.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1"><Pause className="h-3.5 w-3.5 mt-0.5 shrink-0" /> Current sending is unavailable or reduced for the reasons above. Lead preparation remains separate.</p>}

                  <Button className="w-full mt-1" size="lg" disabled={totalSelected <= 0 || !targetCampaignId || activating || (wantsRisky && !riskAck)} onClick={handleActivate}>
                    <Send className="h-4 w-4 mr-2" /> {activating ? "Preparing…" : "Confirm activation preparation"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Campaign Credits are not charged here. The current live credit-priced action is full campaign-pack generation.</p>
                </div>
              </CardContent>
            </Card>

            <SenderStatusCard
              connection={defaultConn}
              usedToday={usedToday}
              warmupCap={warmupCap((planConfig.id as PlanId) || "starter")}
              state={sender}
              health={safety.health}
              scheduledToday={scheduledToday}
              fromEmail={fromEmail}
              connectionId={connectionId}
              detail={senderDetail}
              onVerified={(r) => {
                setSenderDetail((d: any) => ({ ...(d || {}), verification_status: r?.verification_status, mx_status: r?.mx_status, spf_status: r?.spf_status, dkim_status: r?.dkim_status, dmarc_status: r?.dmarc_status, sending_enabled: !!r?.sending_enabled, dns_checked_at: new Date().toISOString() }));
                setSender((s) => ({ ...s, domain_authenticated: !!r?.verified }));
              }}
            />
          </div>
        </>
      )}

      <LegalComplianceGate
        open={legalGateOpen}
        onOpenChange={setLegalGateOpen}
        source="activation"
        workspaceId={currentId}
        title="Accept current terms before activation preparation"
        description="Preparing campaign leads requires current acceptance of the platform legal stack. Live sending remains a separate customer-controlled action with its own send-time checks."
        confirmLabel="Accept and prepare leads"
        onConfirm={async () => { await legal.refresh(); await runActivation(true); }}
      />
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" | "danger" }) {
  const cls = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "danger" ? "text-rose-600" : "";
  return <div className="rounded-md border border-border p-2"><div className="text-[11px] text-muted-foreground">{label}</div><div className={`text-lg font-bold ${cls}`}>{value}</div></div>;
}
