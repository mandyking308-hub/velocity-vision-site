import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, BarChart3, Briefcase, CheckCircle2, Clock, Database, FolderOpen,
  Mail, MessageSquare, Rocket, Send, Settings, ShieldCheck, Sparkles, TrendingUp,
  Upload, Users, Wand2, AlertTriangle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import CreditMeter from "@/components/app/CreditMeter";
import FreePreviewStatusCard from "@/components/app/FreePreviewStatusCard";
import FirstCampaignLaunchpad from "@/components/app/FirstCampaignLaunchpad";
import OutcomeFunnelPanel from "@/components/app/OutcomeFunnelPanel";
import CampaignPreflight from "@/components/app/CampaignPreflight";
import SendSafetyPanel from "@/components/app/SendSafetyPanel";
import SenderStatusCard from "@/components/app/SenderStatusCard";
import FollowUpReminders from "@/components/app/FollowUpReminders";
import type { FunnelFilters, FunnelLead, FunnelOpportunity } from "@/lib/outcomeFunnel";
import { computeSafety, DEFAULT_SENDER_STATE, type SenderState } from "@/lib/sendSafety";
import { runPreflight } from "@/lib/campaignPreflight";
import { computeReadiness } from "@/lib/senderReadiness";
import { useLegalStatus } from "@/lib/legalCompliance";
import { deriveFollowUpState } from "@/lib/leadStates";
import type { PlanId } from "@/lib/credits";
import { CADENCE_LABELS, nextActionLabel, type CadenceType } from "@/lib/cadence";

interface VaultStats {
  contacts: number;
  companies: number;
  imports: number;
  eligible: number;
  review: number;
  risky: number;
  blocked: number;
}

interface CommercialStats {
  leads: number;
  opportunities: number;
  pipelineValue: number;
  won: number;
  stuck: number;
  overdueActions: number;
  replies: number;
  followups: number;
  warm: number;
  bounces: number;
}

type CampaignRow = {
  id: string;
  name: string;
  status: string | null;
  created_at: string;
  cadence_type: CadenceType | null;
  start_at: string | null;
  cadence_end_at: string | null;
  next_run_at: string | null;
  timezone: string | null;
  goal?: string | null;
  brief?: any;
  pack?: any;
  approved_at?: string | null;
  is_sample?: boolean | null;
};

const EMPTY_VAULT: VaultStats = { contacts: 0, companies: 0, imports: 0, eligible: 0, review: 0, risky: 0, blocked: 0 };
const EMPTY_COMMERCIAL: CommercialStats = { leads: 0, opportunities: 0, pipelineValue: 0, won: 0, stuck: 0, overdueActions: 0, replies: 0, followups: 0, warm: 0, bounces: 0 };

export default function AppDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { remaining, planConfig } = useCredits();
  const { workspaces, currentId, loading: workspaceLoading } = useWorkspace();
  const legal = useLegalStatus();

  const [firstName, setFirstName] = useState("");
  const [vault, setVault] = useState<VaultStats>(EMPTY_VAULT);
  const [commercial, setCommercial] = useState<CommercialStats>(EMPTY_COMMERCIAL);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [funnelLeads, setFunnelLeads] = useState<FunnelLead[]>([]);
  const [funnelOpps, setFunnelOpps] = useState<FunnelOpportunity[]>([]);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<FunnelFilters>({ campaignId: "all" });
  const [activatedCampaignIds, setActivatedCampaignIds] = useState<Set<string>>(new Set());

  const [sender, setSender] = useState<SenderState>(DEFAULT_SENDER_STATE);
  const [senderEmail, setSenderEmail] = useState<string | null>(null);
  const [senderConnectionId, setSenderConnectionId] = useState<string | null>(null);
  const [senderDetail, setSenderDetail] = useState<any>(null);
  const [usedToday, setUsedToday] = useState(0);
  const [scheduledToday, setScheduledToday] = useState(0);

  useEffect(() => {
    if (!user || workspaceLoading) return;
    if (!currentId) {
      setVault(EMPTY_VAULT);
      setCommercial(EMPTY_COMMERCIAL);
      setCampaigns([]);
      setFunnelLeads([]);
      setFunnelOpps([]);
      setCampaignNames({});
      setActivatedCampaignIds(new Set());
      return;
    }

    (async () => {
      const profilePromise = supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle();
      const campaignsPromise = supabase.from("campaigns")
        .select("id, name, status, created_at, cadence_type, start_at, cadence_end_at, next_run_at, timezone, goal, brief, pack, approved_at, is_sample")
        .eq("workspace_id", currentId)
        .order("created_at", { ascending: false });
      const leadsPromise = supabase.from("leads")
        .select("id, status, source, campaign_id, follow_up_at, follow_up_state, replied_at, snoozed_until, last_email_sent_at, last_contacted_at, last_interaction_at, opportunity_id, reply_category, reply_triaged_at, reply_snippet, meeting_booked_at, created_at")
        .eq("workspace_id", currentId);
      const oppsPromise = supabase.from("opportunities")
        .select("id, stage, estimated_value, stage_changed_at, next_action_at, source_campaign_id, source_lead_id, created_at")
        .eq("workspace_id", currentId);
      const sendsPromise = supabase.from("email_sends").select("status, sent_at, scheduled_at, campaign_id").eq("workspace_id", currentId);
      const connPromise = supabase.from("email_connections").select("*").eq("user_id", user.id).eq("workspace_id", currentId).order("is_default", { ascending: false });
      const importsPromise = supabase.from("data_uploads").select("id", { count: "exact", head: true }).eq("workspace_id", currentId);
      const contactCounts = Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", currentId),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", currentId).eq("quality_status", "valid"),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", currentId).eq("quality_status", "needs_review"),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", currentId).eq("quality_status", "risky"),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("workspace_id", currentId).in("quality_status", ["blocked", "suppressed"]),
        supabase.from("companies").select("*", { count: "exact", head: true }).eq("workspace_id", currentId),
      ]);

      const [profile, campRes, leadRes, oppRes, sendRes, connRes, importRes, contactRes] = await Promise.all([
        profilePromise, campaignsPromise, leadsPromise, oppsPromise, sendsPromise, connPromise, importsPromise, contactCounts,
      ]);

      setFirstName(profile.data?.first_name || "");
      const campaignRows = (campRes.data || []) as CampaignRow[];
      const leadRows = (leadRes.data || []) as any[];
      const oppRows = (oppRes.data || []) as any[];
      const sendRows = (sendRes.data || []) as any[];
      setCampaigns(campaignRows);
      setFunnelLeads(leadRows as FunnelLead[]);
      setFunnelOpps(oppRows as FunnelOpportunity[]);
      setCampaignNames(Object.fromEntries(campaignRows.map((c) => [c.id, c.name])));
      setActivatedCampaignIds(new Set([
        ...leadRows.map((l) => l.campaign_id).filter(Boolean),
        ...sendRows.map((s) => s.campaign_id).filter(Boolean),
      ] as string[]));

      setVault({
        contacts: contactRes[0].count ?? 0,
        eligible: contactRes[1].count ?? 0,
        review: contactRes[2].count ?? 0,
        risky: contactRes[3].count ?? 0,
        blocked: contactRes[4].count ?? 0,
        companies: contactRes[5].count ?? 0,
        imports: importRes.count ?? 0,
      });

      const now = Date.now();
      const states = leadRows.map((l) => deriveFollowUpState(l));
      const openOpps = oppRows.filter((o) => o.stage !== "won" && o.stage !== "lost");
      setCommercial({
        leads: leadRows.length,
        opportunities: oppRows.length,
        pipelineValue: openOpps.reduce((sum, o) => sum + Number(o.estimated_value || 0), 0),
        won: oppRows.filter((o) => o.stage === "won").length,
        stuck: openOpps.filter((o) => o.stage_changed_at && now - new Date(o.stage_changed_at).getTime() > 14 * 86400000).length,
        overdueActions: openOpps.filter((o) => o.next_action_at && new Date(o.next_action_at).getTime() < now).length,
        replies: states.filter((s) => s === "replied").length,
        followups: states.filter((s) => s === "due" || s === "overdue").length,
        warm: states.filter((s) => s === "warm" || s === "replied").length,
        bounces: sendRows.filter((s) => s.status === "failed" || s.status === "bounced").length,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setUsedToday(sendRows.filter((s) => s.sent_at && new Date(s.sent_at) >= today).length);
      setScheduledToday(sendRows.filter((s) => s.scheduled_at && new Date(s.scheduled_at) >= today && !s.sent_at).length);

      const def = connRes.data?.[0] || null;
      if (!def) {
        setSender(DEFAULT_SENDER_STATE);
        setSenderEmail(null);
        setSenderConnectionId(null);
        setSenderDetail(null);
      } else {
        setSenderEmail(def.from_email);
        setSenderConnectionId(def.id);
        setSenderDetail(def);
        const readiness = computeReadiness(def as any);
        const verified = def.verification_status === "verified" && def.sending_enabled === true;
        const sent = sendRows.filter((s) => s.status === "sent");
        const bounces = sendRows.filter((s) => s.status === "failed" || s.status === "bounced").length;
        setSender({
          connected: def.status === "connected",
          domain_authenticated: verified || readiness.canSendWarmup,
          reconnect_required: def.status === "reconnect_required" || def.verification_status === "reconnect_required",
          newly_connected: def.last_verified_at ? Date.now() - new Date(def.last_verified_at).getTime() < 7 * 86400000 : true,
          last_send_at: sent.map((s) => s.sent_at).filter(Boolean).sort().pop() || null,
          bounce_rate: bounces / Math.max(sendRows.length, 1),
          unsubscribe_rate: 0,
        });
      }
    })();
  }, [user, currentId, workspaceLoading]);

  const plan = (planConfig.id as PlanId) || "free_preview";
  const safety = useMemo(() => computeSafety({
    plan,
    vault: { valid: vault.eligible, needs_review: vault.review, risky: vault.risky, blocked: vault.blocked },
    sender,
    sendsUsedToday: usedToday,
    sendsScheduledToday: scheduledToday,
  }), [plan, vault, sender, usedToday, scheduledToday]);

  const workingCampaign = campaigns[0] || null;
  const dashboardPreflight = useMemo(() => runPreflight({
    scope: "campaign",
    campaign: workingCampaign,
    safeContacts: vault.eligible,
    reviewContacts: vault.review,
    senderState: senderDetail ? computeReadiness(senderDetail as any).state : null,
    senderEmail,
    remainingToday: safety.remainingToday,
    pauseReasons: safety.pauseReasons,
    legalAccepted: legal.isCompliant,
    unsubscribeReady: isUnsubscribeCapabilityReady({
      handlerAvailable: UNSUBSCRIBE_HANDLER_DEPLOYED,
      messageBody: (workingCampaign?.pack as any)?.emails?.[0]?.body ?? "",
    }),
  }), [workingCampaign, vault, senderDetail, senderEmail, safety, legal.isCompliant]);

  const launchpadSignals = {
    hasBrief: Boolean(workingCampaign?.goal || workingCampaign?.brief),
    approvedContacts: vault.eligible,
    hasContent: Boolean((workingCampaign?.pack as any)?.emails?.[0]?.subject),
    senderReady: sender.connected && sender.domain_authenticated,
    preflightBlockers: dashboardPreflight.blockers.length,
    approved: Boolean(workingCampaign?.approved_at),
    isSample: workingCampaign?.is_sample === true,
    activated: workingCampaignActivated,
    campaignId: workingCampaign?.id ?? null,
    repliesWaiting: commercial.replies,
    urgentReplies: commercial.replies + commercial.bounces,
    reviewContacts: vault.review,
  };

  if (!workspaceLoading && workspaces.length === 0) {
    return <div className="max-w-2xl mx-auto py-12">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-10 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Sparkles className="h-7 w-7 text-primary" /></div>
          <h1 className="text-2xl font-bold">Create your first workspace</h1>
          <p className="text-sm text-muted-foreground">Your workspace keeps contacts, campaigns, replies and early pipeline organised. Agency plans can create isolated client workspaces; plan billing remains account-level.</p>
          <Button size="lg" onClick={() => navigate("/app/workspaces")}><Briefcase className="h-4 w-4 mr-2" /> Create workspace</Button>
        </CardContent>
      </Card>
    </div>;
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "active" || c.status === "planning" || c.status === "scheduled").length;

  return (
    <div className="space-y-7 max-w-7xl">
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
            <p className="text-muted-foreground mt-1">Review authorised data, prepare editable campaign drafts, record approvals, manage replies and follow stored outcomes from one customer-controlled workspace.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[320px]">
            <PillStat label="Campaign Credits" value={remaining} hint={planConfig.name} />
            <PillStat label="Send allowance today" value={safety.remainingToday} hint={`plan max ${safety.planCeiling}`} />
            <PillStat label="Active / scheduled" value={activeCampaigns} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          <Button size="lg" onClick={() => navigate("/app/campaigns/copilot")}><Sparkles className="h-4 w-4 mr-2" /> First-Campaign Copilot</Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/app/activate")}><ShieldCheck className="h-4 w-4 mr-2" /> Prepare campaign leads</Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/app/data-vault/upload")}><Upload className="h-4 w-4 mr-2" /> Upload data</Button>
          {workingCampaign && <Button size="lg" variant="ghost" onClick={() => navigate(`/app/campaigns/${workingCampaign.id}`)}>Open latest campaign <ArrowRight className="h-4 w-4 ml-2" /></Button>}
        </div>
      </div>

      <FreePreviewStatusCard />
      <FirstCampaignLaunchpad signals={launchpadSignals} />
      <CampaignPreflight result={dashboardPreflight} title="Activation-preparation preflight" compact />

      <Section title="Data Vault" icon={Database} description="Workspace quality labels support review; they do not establish lawful basis or legal approval." link="/app/data-vault" linkLabel="Review data">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Stat label="Contacts" value={vault.contacts} icon={Users} />
          <Stat label="Companies" value={vault.companies} icon={Briefcase} />
          <Stat label="Imports" value={vault.imports} icon={Upload} />
          <Stat label="Eligible under checks" value={vault.eligible} icon={CheckCircle2} tone="good" />
          <Stat label="Needs review" value={vault.review} icon={AlertTriangle} tone="warn" />
          <Stat label="Risky" value={vault.risky} icon={AlertTriangle} tone="warn" />
          <Stat label="Blocked / suppressed" value={vault.blocked} icon={AlertTriangle} tone="danger" />
        </div>
      </Section>

      <Section title="Sending readiness" icon={Send} description="Live sending is separate from activation preparation. Paid-plan ceilings, mailbox state and safety checks govern each real send." link="/app/settings/email" linkLabel="Email settings">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><SendSafetyPanel s={safety} used={usedToday} scheduled={scheduledToday} /></div>
          <SenderStatusCard state={sender} health={safety.health} scheduledToday={scheduledToday} fromEmail={senderEmail} connectionId={senderConnectionId} detail={senderDetail} />
        </div>
      </Section>

      <Section title="Campaign cadence" icon={Clock} description="Cadence dates organise recurring work on eligible plans. Every run remains customer-controlled." link="/app/campaigns" linkLabel="Open campaigns">
        {campaigns.length === 0 ? <Empty text="No campaigns yet." action="Create campaign" onClick={() => navigate("/app/campaigns/new")} /> : (
          <div className="grid md:grid-cols-2 gap-3">
            {campaigns.slice(0, 6).map((c) => (
              <Card key={c.id} className="cursor-pointer hover:border-primary/40" onClick={() => navigate(`/app/campaigns/${c.id}`)}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground mt-1">{CADENCE_LABELS[c.cadence_type || "one_off"]} · {nextActionLabel({ next_run_at: c.next_run_at, start_at: c.start_at, cadence_type: c.cadence_type || "one_off", cadence_end_at: c.cadence_end_at, timezone: c.timezone || "UTC" } as any)}</div></div>
                  <Badge variant="outline">{c.status || "draft"}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Replies and follow-up" icon={MessageSquare} description="Reply records available to the workspace, plus customer-controlled follow-up and triage." link="/app/follow-up" linkLabel="Open follow-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Replies needing action" value={commercial.replies} icon={MessageSquare} tone="warn" />
          <Stat label="Due / overdue" value={commercial.followups} icon={Mail} tone="warn" />
          <Stat label="Warm / replied" value={commercial.warm} icon={TrendingUp} tone="good" />
          <Stat label="Bounces / failed" value={commercial.bounces} icon={AlertTriangle} tone="danger" />
        </div>
        <div className="mt-3"><FollowUpReminders /></div>
      </Section>

      <Section title="Pipeline and recorded outcomes" icon={TrendingUp} description="Stored opportunity records only — no automated attribution, benchmark or revenue guarantee." link="/app/pipeline" linkLabel="Open pipeline">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          <Stat label="Leads" value={commercial.leads} icon={Users} />
          <Stat label="Opportunities" value={commercial.opportunities} icon={Briefcase} />
          <Stat label="Open value" value={`£${commercial.pipelineValue.toLocaleString()}`} icon={TrendingUp} />
          <Stat label="Stuck 14d+" value={commercial.stuck} icon={AlertTriangle} tone="warn" />
          <Stat label="Actions overdue" value={commercial.overdueActions} icon={Clock} tone="danger" />
          <Stat label="Recorded won" value={commercial.won} icon={CheckCircle2} tone="good" />
        </div>
        <OutcomeFunnelPanel leads={funnelLeads} opportunities={funnelOpps} campaigns={campaignNames} filters={filters} onFiltersChange={setFilters} />
      </Section>

      <Section title="Next actions" icon={Wand2} description="Suggested navigation based on stored workspace state. You decide what to do next.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {buildActions(vault, commercial, remaining, safety.remainingToday, plan).map((a) => (
            <Card key={a.title} className="cursor-pointer hover:border-primary/40" onClick={() => navigate(a.to)}>
              <CardContent className="p-4 flex gap-3"><a.icon className="h-5 w-5 text-primary mt-0.5" /><div><div className="font-medium text-sm">{a.title}</div><div className="text-xs text-muted-foreground mt-1">{a.desc}</div></div><ArrowRight className="h-4 w-4 text-muted-foreground ml-auto self-center" /></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <CreditMeter />

      <Section title="Workspace" icon={FolderOpen}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Data Vault", "/app/data-vault", Database], ["Campaigns", "/app/campaigns", Rocket],
            ["Follow-Up", "/app/follow-up", MessageSquare], ["Pipeline", "/app/pipeline", TrendingUp],
            ["Performance", "/app/performance", BarChart3], ["Workspaces", "/app/workspaces", Briefcase],
            ["Billing", "/app/billing", Settings], ["Settings", "/app/settings", Settings],
          ].map(([label, to, Icon]: any[]) => <Link key={to} to={to}><Card className="h-full hover:border-primary/40"><CardContent className="p-4 flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{label}</span><ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" /></CardContent></Card></Link>)}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, description, link, linkLabel, children }: { title: string; icon: any; description?: string; link?: string; linkLabel?: string; children: React.ReactNode }) {
  return <section className="space-y-3"><div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" />{title}</h2>{description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}</div>{link && <Button variant="ghost" size="sm" asChild><Link to={link}>{linkLabel || "Open"}<ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>}</div>{children}</section>;
}

function PillStat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return <div className="rounded-lg border bg-background/70 px-3 py-2 text-center"><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div><div className="text-xl font-bold">{value}</div>{hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}</div>;
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon?: any; tone?: "good" | "warn" | "danger" }) {
  const cls = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "danger" ? "text-rose-600" : "";
  return <Card><CardContent className="p-4"><div className="flex items-center gap-1.5 text-xs text-muted-foreground">{Icon && <Icon className="h-3.5 w-3.5" />}{label}</div><div className={`text-2xl font-bold mt-1 ${cls}`}>{value}</div></CardContent></Card>;
}

function Empty({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return <Card><CardContent className="p-5 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{text}</p><Button size="sm" onClick={onClick}>{action}</Button></CardContent></Card>;
}

function buildActions(v: VaultStats, c: CommercialStats, credits: number, sendsRemaining: number, plan: PlanId) {
  const actions: Array<{ title: string; desc: string; to: string; icon: any }> = [];
  if (v.contacts === 0) actions.push({ title: "Upload authorised business data", desc: "Start the Data Vault review workflow.", to: "/app/data-vault/upload", icon: Upload });
  if (v.review > 0) actions.push({ title: `Review ${v.review} flagged record${v.review === 1 ? "" : "s"}`, desc: "Resolve incomplete or ambiguous data before activation preparation.", to: "/app/data-vault", icon: ShieldCheck });
  if (v.eligible > 0) actions.push({ title: `Prepare up to ${v.eligible} eligible record${v.eligible === 1 ? "" : "s"}`, desc: "Activation preparation creates campaign leads; it does not send email or spend Campaign Credits.", to: "/app/activate", icon: ShieldCheck });
  if (c.replies > 0) actions.push({ title: `${c.replies} repl${c.replies === 1 ? "y" : "ies"} need attention`, desc: "Review the stored reply queue and choose the next action.", to: "/app/follow-up", icon: MessageSquare });
  if (c.overdueActions > 0) actions.push({ title: `${c.overdueActions} opportunity action${c.overdueActions === 1 ? "" : "s"} overdue`, desc: "Update the recorded pipeline next action.", to: "/app/pipeline", icon: Clock });
  if (credits <= 0) actions.push({ title: "Campaign Credits unavailable", desc: plan === "free_preview" ? "Free Preview remains capped at one full pack; compare paid plans for further full-pack generation." : "Add eligible paid-workspace credits or change plan before the next full campaign-pack generation.", to: "/app/billing", icon: Sparkles });
  if (sendsRemaining <= 0 && plan !== "free_preview") actions.push({ title: "No send allowance currently available", desc: "Review mailbox and send-safety status before attempting a real send.", to: "/app/settings/email", icon: Send });
  if (actions.length === 0) actions.push({ title: "Open your latest campaign", desc: "Review content, replies, cadence and recorded outcomes.", to: "/app/campaigns", icon: Rocket });
  return actions.slice(0, 8);
}
