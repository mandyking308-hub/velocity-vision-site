import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, FolderOpen, Users, BarChart3, LayoutTemplate, Settings, Briefcase, ArrowRight,
  Database, ShieldCheck, Send, Megaphone, Mail, Newspaper, Video, FileText, MessageSquare,
  TrendingUp, AlertTriangle, Upload, Sparkles, Wand2, Zap, CheckCircle2, Clock, Repeat, Pause, RefreshCw,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import CreditMeter from "@/components/app/CreditMeter";
import FollowUpReminders from "@/components/app/FollowUpReminders";
import SendSafetyPanel from "@/components/app/SendSafetyPanel";
import SenderStatusCard from "@/components/app/SenderStatusCard";
import OnboardingChecklist from "@/components/app/OnboardingChecklist";
import PriorityStrip from "@/components/app/PriorityStrip";
import { computeSafety, DEFAULT_SENDER_STATE, type SenderState } from "@/lib/sendSafety";
import type { PlanId } from "@/lib/credits";
import { deriveFollowUpState } from "@/lib/leadStates";
import { Card as UICard, CardContent as UICardContent } from "@/components/ui/card";

interface VaultStats {
  total_contacts: number;
  total_companies: number;
  imports: number;
  clean: number;
  needs_review: number;
  risky: number;
  blocked: number;
  duplicates: number;
  safe_to_activate: number;
}

interface PipelineStats {
  leads: number;
  opportunities: number;
  pipeline_value: number;
  won: number;
  lost: number;
  by_stage: Record<string, number>;
  stuck: number;
  next_action_due: number;
}

interface InteractionStats {
  replies_due: number;
  followups_today: number;
  dormant: number;
  warm: number;
  bounces: number;
}

import { CADENCE_LABELS, CadenceType, LIFECYCLE_TONE, deriveLifecycle, nextActionLabel } from "@/lib/cadence";

interface CadenceRow {
  id: string; name: string; status: string;
  cadence_type: CadenceType | null;
  start_at: string | null; cadence_end_at: string | null;
  next_run_at: string | null; timezone: string | null;
  runs_completed: number | null;
}

export default function AppDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { remaining, planConfig } = useCredits();
  const { workspaces, currentId, loading: wsLoading } = useWorkspace();
  const [firstName, setFirstName] = useState("");
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [latestCampaignId, setLatestCampaignId] = useState<string | null>(null);
  const [campaignRows, setCampaignRows] = useState<CadenceRow[]>([]);
  const [sender, setSender] = useState<SenderState>(DEFAULT_SENDER_STATE);
  const [senderEmail, setSenderEmail] = useState<string | null>(null);
  const [sendsUsedToday, setSendsUsedToday] = useState(0);
  const [sendsScheduledToday, setSendsScheduledToday] = useState(0);

  const [vault, setVault] = useState<VaultStats>({
    total_contacts: 0, total_companies: 0, imports: 0, clean: 0,
    needs_review: 0, risky: 0, blocked: 0, duplicates: 0, safe_to_activate: 0,
  });
  const [pipeline, setPipeline] = useState<PipelineStats>({
    leads: 0, opportunities: 0, pipeline_value: 0, won: 0, lost: 0, by_stage: {}, stuck: 0, next_action_due: 0,
  });
  const [inter, setInter] = useState<InteractionStats>({
    replies_due: 0, followups_today: 0, dormant: 0, warm: 0, bounces: 0,
  });

  // Workspace-scoped dashboard queries. We wait for the workspace context to hydrate
  // and for an active workspace id before pulling any workspace-sensitive metrics, so
  // the dashboard never blends numbers across workspaces.
  useEffect(() => {
    if (!user) return;
    if (wsLoading) return;
    // No workspace yet → the empty-state gate below renders. Skip metric fetch.
    if (!currentId) {
      setActiveCampaigns(0); setLatestCampaignId(null); setCampaignRows([]);
      setVault({ total_contacts: 0, total_companies: 0, imports: 0, clean: 0, needs_review: 0, risky: 0, blocked: 0, duplicates: 0, safe_to_activate: 0 });
      setPipeline({ leads: 0, opportunities: 0, pipeline_value: 0, won: 0, lost: 0, by_stage: {}, stuck: 0, next_action_due: 0 });
      setInter({ replies_due: 0, followups_today: 0, dormant: 0, warm: 0, bounces: 0 });
      return;
    }

    (async () => {
      // 1. Profile (user-level, not workspace scoped).
      const { data: profile } = await supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle();
      setFirstName(profile?.first_name || "");

      // 2. Workspace-scoped primary tables.
      const [
        { data: campaigns },
        { data: leads },
        { data: opps },
        { data: sends },
        { data: uploads, count: importsCount },
      ] = await Promise.all([
        supabase.from("campaigns")
          .select("id, name, status, created_at, cadence_type, start_at, cadence_end_at, next_run_at, timezone, runs_completed")
          .eq("workspace_id", currentId)
          .order("created_at", { ascending: false }),
        supabase.from("leads")
          .select("id, status, follow_up_at, follow_up_state, replied_at, snoozed_until, last_email_sent_at, last_contacted_at, last_interaction_at, opportunity_id, blocked, suppressed")
          .eq("workspace_id", currentId),
        supabase.from("opportunities")
          .select("id, stage, estimated_value, stage_changed_at, next_action_at")
          .eq("workspace_id", currentId),
        supabase.from("email_sends")
          .select("status, sent_at")
          .eq("workspace_id", currentId),
        supabase.from("data_uploads")
          .select("id", { count: "exact" })
          .eq("workspace_id", currentId),
      ]);

      const active = (campaigns || []).filter((c: any) => c.status === "active" || c.status === "planning").length;
      setActiveCampaigns(active);
      setLatestCampaignId(campaigns?.[0]?.id || null);
      setCampaignRows((campaigns || []) as CadenceRow[]);

      // 3. Contacts / companies — no workspace_id column. We derive a workspace-scoped
      //    view by linking through data_uploads.source_upload_id for THIS workspace.
      //    Schema gap: contacts/companies are otherwise account/company-scoped only.
      const uploadIds = (uploads || []).map((u: any) => u.id);
      let contactsTotal = 0, contactsClean = 0, contactsReview = 0, contactsRisky = 0, contactsBlocked = 0, companiesTotal = 0;
      if (uploadIds.length > 0) {
        const base = supabase.from("contacts").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds);
        const [t, c1, c2, c3, c4, co] = await Promise.all([
          base,
          supabase.from("contacts").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds).eq("quality_status", "valid"),
          supabase.from("contacts").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds).eq("quality_status", "needs_review"),
          supabase.from("contacts").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds).eq("quality_status", "risky"),
          supabase.from("contacts").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds).eq("quality_status", "blocked"),
          supabase.from("companies").select("*", { count: "exact", head: true }).in("source_upload_id", uploadIds),
        ]);
        contactsTotal = t.count ?? 0;
        contactsClean = c1.count ?? 0;
        contactsReview = c2.count ?? 0;
        contactsRisky = c3.count ?? 0;
        contactsBlocked = c4.count ?? 0;
        companiesTotal = co.count ?? 0;
      }
      setVault({
        total_contacts: contactsTotal,
        total_companies: companiesTotal,
        imports: importsCount ?? 0,
        clean: contactsClean,
        needs_review: contactsReview,
        risky: contactsRisky,
        blocked: contactsBlocked,
        duplicates: 0,
        safe_to_activate: contactsClean,
      });

      const ls = leads || [];
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const states = ls.map((l: any) => deriveFollowUpState(l));
      const replies_due = states.filter((s) => s === "replied").length;
      const followups_today = states.filter((s) => s === "due" || s === "overdue").length;
      const warm = states.filter((s) => s === "warm" || s === "replied").length;
      const dormant = states.filter((s) => s === "dormant").length;
      const bounces = (sends || []).filter((s: any) => s.status === "failed" || s.status === "bounced").length;
      setInter({ replies_due, followups_today, dormant, warm, bounces });

      const opp = opps || [];
      const by_stage: Record<string, number> = {};
      let pipeline_value = 0;
      let stuck = 0;
      let nextActionDue = 0;
      opp.forEach((o: any) => {
        by_stage[o.stage] = (by_stage[o.stage] || 0) + 1;
        const isOpen = o.stage !== "lost" && o.stage !== "won";
        if (isOpen) {
          pipeline_value += Number(o.estimated_value || 0);
          if (o.stage_changed_at && (now - new Date(o.stage_changed_at).getTime()) > 14 * dayMs) stuck++;
          if (o.next_action_at && new Date(o.next_action_at).getTime() < now) nextActionDue++;
        }
      });
      setPipeline({
        leads: ls.length,
        opportunities: opp.length,
        pipeline_value,
        won: opp.filter((o: any) => o.stage === "won").length,
        lost: opp.filter((o: any) => o.stage === "lost").length,
        by_stage,
        stuck,
        next_action_due: nextActionDue,
      });
    })();
  }, [user, currentId, wsLoading]);

  // Sender/email — connections are user-level (account-level) but scoped to the active
  // workspace when they carry a workspace_id. Sends are workspace-scoped.
  useEffect(() => {
    if (!user) return;
    if (wsLoading || !currentId) {
      setSenderEmail(null);
      setSender(DEFAULT_SENDER_STATE);
      setSendsUsedToday(0);
      setSendsScheduledToday(0);
      return;
    }
    (async () => {
      const [{ data: conns }, { data: sends }] = await Promise.all([
        supabase.from("email_connections").select("*").eq("user_id", user.id).eq("workspace_id", currentId).order("is_default", { ascending: false }),
        supabase.from("email_sends").select("status, sent_at, scheduled_at").eq("workspace_id", currentId),
      ]);
      const def = (conns || [])[0];
      const today = new Date(); today.setHours(0,0,0,0);
      const used = (sends || []).filter((x: any) => x.sent_at && new Date(x.sent_at) >= today).length;
      const sched = (sends || []).filter((x: any) => x.scheduled_at && new Date(x.scheduled_at) >= today && !x.sent_at).length;
      setSendsUsedToday(used);
      setSendsScheduledToday(sched);
      if (def) {
        setSenderEmail(def.from_email);
        const lastSend = (sends || []).filter((x: any) => x.status === "sent").map((x: any) => x.sent_at).filter(Boolean).sort().pop() || null;
        const totalSends = (sends || []).length || 1;
        const bounces = (sends || []).filter((x: any) => x.status === "bounced" || x.status === "failed").length;
        const newly = def.last_verified_at ? (Date.now() - new Date(def.last_verified_at).getTime()) < 7 * 86400000 : true;
        setSender({
          connected: def.status === "connected",
          domain_authenticated: false,
          reconnect_required: def.status === "reconnect_required",
          newly_connected: newly,
          last_send_at: lastSend,
          bounce_rate: bounces / totalSends,
          unsubscribe_rate: 0,
        });
      } else {
        setSenderEmail(null);
        setSender(DEFAULT_SENDER_STATE);
      }
    })();
  }, [user, currentId, wsLoading]);


  const plan = (planConfig.id as PlanId) || "starter";
  const safety = computeSafety({
    plan,
    vault: { valid: vault.clean, needs_review: vault.needs_review, risky: vault.risky, blocked: vault.blocked, duplicates: vault.duplicates },
    sender,
    sendsUsedToday,
    sendsScheduledToday,
    sendCreditsRemaining: remaining,
  });
  const safeSendToday = safety.safeAllowance;
  const recommendedSend = safety.recommendedToday;

  // Gate: no workspace → send to a clean create-first-workspace prompt.
  if (!wsLoading && workspaces.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <UICard className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <UICardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Create your first workspace</h1>
            <p className="text-sm text-muted-foreground">
              Your workspace keeps contacts, campaigns, assets, replies, billing and pipeline
              organised. Create one for your business, or one per client if you run agency work.
            </p>
            <Button size="lg" onClick={() => navigate("/app/workspaces")}>
              <Briefcase className="h-4 w-4 mr-2" /> Create workspace
            </Button>
          </UICardContent>
        </UICard>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* A0. Priority strip — most urgent commercial actions, always on top */}
      <PriorityStrip
        repliesDue={inter.replies_due}
        overdue={inter.followups_today}
        stuck={pipeline.stuck}
        senderConnected={sender.connected}
        senderVerified={sender.domain_authenticated}
        creditsRemaining={remaining}
      />

      {/* A. Top summary bar */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your AI-powered commercial workspace. AI drafts outreach and reviews quality — you approve, activate and move deals forward.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4 min-w-[320px]">
            <PillStat label="Credits" value={remaining} hint={planConfig.name} />
            <PillStat label="Safe send today" value={safeSendToday} hint="warm contacts" />
            <PillStat label="Active campaigns" value={activeCampaigns} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
        <Button size="lg" onClick={() => navigate("/app/activate")}>
            <Send className="h-4 w-4 mr-2" /> Activate a safe segment
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/app/data-vault/upload")}>
            <Upload className="h-4 w-4 mr-2" /> Upload contacts
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/app/campaigns/new")}>
            <Wand2 className="h-4 w-4 mr-2" /> Create assets
          </Button>
          {latestCampaignId && (
            <Button size="lg" variant="ghost" onClick={() => navigate(`/app/campaigns/${latestCampaignId}`)}>
              Open latest campaign <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>



      {/* A2. First-time onboarding checklist (auto-hides once complete) */}
      <OnboardingChecklist
        signals={{
          hasContacts: vault.total_contacts > 0,
          hasReviewed: vault.clean + vault.needs_review + vault.risky + vault.blocked > 0,
          hasSafeSegment: vault.safe_to_activate > 0,
          hasSender: sender.connected,
          hasAssets: campaignRows.length > 0,
          hasCadence: campaignRows.some((c) => !!c.start_at || (c.cadence_type && c.cadence_type !== "one_off")),
          hasActivated: sendsUsedToday + sendsScheduledToday > 0 || sender.last_send_at !== null,
          hasWorkedReplies: inter.replies_due + pipeline.opportunities > 0,
        }}
      />


      {/* B. Database Health */}
      <SectionHeader
        icon={Database}
        title="Database Health (AI quality review)"
        desc="AI flags what's clean, risky, duplicated or blocked. You decide what's safe to activate."
        cta={{ label: "Review data", to: "/app/data-vault" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <BigStat label="Contacts" value={vault.total_contacts} icon={Users} tone="default" />
        <BigStat label="Companies" value={vault.total_companies} icon={Briefcase} tone="default" />
        <BigStat label="Imports" value={vault.imports} icon={Upload} tone="default" />
        <BigStat label="Clean" value={vault.clean} icon={CheckCircle2} tone="good" />
        <BigStat label="AI-ready segment" value={vault.safe_to_activate} icon={ShieldCheck} tone="good" />
        <BigStat label="Needs review" value={vault.needs_review} icon={AlertTriangle} tone="warn" />
        <BigStat label="Risky" value={vault.risky} icon={AlertTriangle} tone="warn" />
        <BigStat label="Blocked / suppressed" value={vault.blocked} icon={AlertTriangle} tone="danger" />
        <BigStat label="Duplicates" value={vault.duplicates} icon={AlertTriangle} tone="warn" />
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Card className="h-full bg-primary/5 border-primary/30">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="text-xs font-medium text-primary">Recommended</div>
              <div className="text-sm mt-1">Activate <b>{vault.safe_to_activate}</b> safe contacts now.</div>
              <Button size="sm" className="mt-2" onClick={() => navigate("/app/activate")}>Activate <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* C. Activation Readiness + Send Safety Engine */}
      <SectionHeader
        icon={ShieldCheck}
        title="Activation Readiness & Send Safety (governed AI activation)"
        desc="Store generously. Activate carefully. Sender verification and daily caps gate every send — you approve activation."
        cta={{ label: "Open pre-flight", to: "/app/activate" }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SendSafetyPanel s={safety} used={sendsUsedToday} scheduled={sendsScheduledToday} />
        </div>
        <SenderStatusCard state={sender} health={safety.health} scheduledToday={sendsScheduledToday} fromEmail={senderEmail} />
      </div>

      {/* C2. Campaign cadence / upcoming activity */}
      <SectionHeader
        icon={Clock}
        title="Campaign cadence & upcoming activity"
        desc="Your outreach rhythm — what's running, what's next, what needs attention."
        cta={{ label: "Open campaigns", to: "/app/campaigns" }}
      />
      <CadenceSection rows={campaignRows} navigate={navigate} />



      {/* D. Create outreach assets */}
      <SectionHeader
        icon={Sparkles}
        title="Create AI-assisted outreach assets"
        desc="AI drafts your outreach from your data and brief. You review, edit and approve before anything is sent."
        cta={{ label: "Create assets from my data", to: "/app/campaigns/new" }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AssetCard icon={Megaphone} title="Social media pack" desc="Launch posts, follow-ups, hooks, CTAs and platform variants." onClick={() => navigate("/app/campaigns/new?focus=social")} />
        <AssetCard icon={Mail} title="Email sequence" desc="Structured outreach and follow-up emails ready for activation." onClick={() => navigate("/app/campaigns/new?focus=email")} />
        <AssetCard icon={Newspaper} title="Press release" desc="Announcement copy ready for outreach and publicity." onClick={() => navigate("/app/campaigns/new?focus=press")} />
        <AssetCard icon={Video} title="Video pack" desc="Scripts, hooks, shot list and CTA endings." onClick={() => navigate("/app/campaigns/new?focus=video")} />
        <AssetCard icon={FileText} title="Landing page copy" desc="Conversion-focused page structure for this audience." onClick={() => navigate("/app/campaigns/new?focus=landing")} />
        <AssetCard icon={MessageSquare} title="Offer / follow-up copy" desc="Reply-ready follow-ups and offer messaging." onClick={() => navigate("/app/campaigns/new?focus=followup")} />
      </div>

      {/* E. Replies and follow-up */}
      <SectionHeader
        icon={MessageSquare}
        title="Replies and follow-up (AI follow-up suggestions)"
        desc="Who replied, who's overdue, what's warm. AI drafts next-step follow-ups — you approve every send."
        cta={{ label: "Open follow-up queue", to: "/app/follow-up" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link to="/app/follow-up?tab=replied"><BigStat label="Replies need action" value={inter.replies_due} icon={MessageSquare} tone="warn" /></Link>
        <Link to="/app/follow-up?tab=overdue"><BigStat label="Follow-ups due / overdue" value={inter.followups_today} icon={Mail} tone="warn" /></Link>
        <Link to="/app/follow-up?tab=warm"><BigStat label="Warm contacts" value={inter.warm} icon={Zap} tone="good" /></Link>
        <Link to="/app/follow-up?tab=dormant"><BigStat label="Dormant" value={inter.dormant} icon={AlertTriangle} /></Link>
        <Link to="/app/follow-up?tab=bounced"><BigStat label="Bounces" value={inter.bounces} icon={AlertTriangle} tone="danger" /></Link>
      </div>
      <FollowUpReminders />

      {/* F. Leads & early pipeline */}
      <SectionHeader
        icon={TrendingUp}
        title="Leads & early pipeline"
        desc="Track replies, warm contacts and early opportunities before sales handoff. Pipeline visibility, not CRM bloat."
        cta={{ label: "Open pipeline", to: "/app/pipeline" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <BigStat label="Leads" value={pipeline.leads} icon={Users} />
        <BigStat label="Opportunities" value={pipeline.opportunities} icon={Briefcase} />
        <BigStat label="Pipeline value" value={`£${pipeline.pipeline_value.toLocaleString()}`} icon={TrendingUp} tone="good" />
        <BigStat label="Stuck 14d+" value={pipeline.stuck} icon={AlertTriangle} tone="warn" />
        <BigStat label="Actions overdue" value={pipeline.next_action_due} icon={Clock} tone="danger" />
        <BigStat label="Won" value={pipeline.won} icon={CheckCircle2} tone="good" />
      </div>
      {Object.keys(pipeline.by_stage).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {Object.entries(pipeline.by_stage).map(([k, v]) => (
                <div key={k} className="rounded-md border border-border p-2">
                  <div className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</div>
                  <div className="text-lg font-bold">{v}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* G. Next best actions */}
      <SectionHeader icon={Wand2} title="What should I do next?" desc="Smart recommendations based on your data and pipeline." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {buildNextActions(vault, inter, pipeline, remaining).map((a, i) => (
          <Card key={i} className="hover:shadow-md transition cursor-pointer" onClick={() => navigate(a.to)}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`h-9 w-9 rounded-md flex items-center justify-center ${a.toneClass}`}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
            </CardContent>
          </Card>
        ))}
      </div>

      <CreditMeter />

      {/* Foundations / nav */}
      <SectionHeader icon={LayoutTemplate} title="Workspace" desc="Everything else, one click away." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { title: "Data Vault", icon: Database, to: "/app/data-vault" },
          { title: "Campaigns", icon: FolderOpen, to: "/app/campaigns" },
          { title: "Leads & pipeline", icon: Users, to: "/app/leads" },
          { title: "Performance", icon: BarChart3, to: "/app/performance" },
          { title: "Templates", icon: LayoutTemplate, to: "/app/templates" },
          { title: "Workspaces", icon: Briefcase, to: "/app/workspaces" },
          { title: "Billing", icon: Settings, to: "/app/billing" },
          { title: "Settings", icon: Settings, to: "/app/settings" },
        ].map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="h-full hover:shadow-md transition">
              <CardContent className="p-4 flex items-center gap-3">
                <c.icon className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{c.title}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function SectionHeader({ icon: Icon, title, desc, cta }: { icon: any; title: string; desc?: string; cta?: { label: string; to: string } }) {
  return (
    <div className="flex items-end justify-between gap-3 mt-2">
      <div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </h2>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {cta && (
        <Button variant="ghost" size="sm" asChild>
          <Link to={cta.to}>{cta.label} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
        </Button>
      )}
    </div>
  );
}

function PillStat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

const TONE: Record<string, string> = {
  default: "text-foreground",
  good: "text-emerald-600",
  warn: "text-amber-600",
  danger: "text-rose-600",
};

function BigStat({ label, value, icon: Icon, tone = "default" }: { label: string; value: number | string; icon?: any; tone?: keyof typeof TONE }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5" />}{label}
        </div>
        <div className={`text-2xl font-bold mt-1 ${TONE[tone]}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: number | string; tone?: keyof typeof TONE }) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${TONE[tone]}`}>{value}</div>
    </div>
  );
}

function AssetCard({ icon: Icon, title, desc, onClick }: { icon: any; title: string; desc: string; onClick: () => void }) {
  return (
    <Card className="hover:shadow-md transition cursor-pointer h-full" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-base mt-2">{title}</CardTitle>
        <CardDescription className="text-xs">{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function buildNextActions(v: VaultStats, i: InteractionStats, p: PipelineStats, credits: number) {
  const acts: Array<{ title: string; desc: string; icon: any; to: string; toneClass: string }> = [];
  // Credit truthfulness: differentiate no-plan / exhausted / low.
  if (credits <= 0) acts.push({ title: "No campaign credits available", desc: "Choose a plan or buy a top-up to keep generating.", icon: Zap, to: "/app/billing", toneClass: "bg-rose-100 text-rose-700" });
  else if (credits < 20) acts.push({ title: "Credits running low", desc: "Top up so activation isn't interrupted.", icon: Zap, to: "/app/billing", toneClass: "bg-amber-100 text-amber-700" });
  if (v.total_contacts === 0) acts.push({ title: "Upload your first contact list", desc: "Get data into the vault to unlock activation.", icon: Upload, to: "/app/data-vault/upload", toneClass: "bg-primary/10 text-primary" });
  if (v.total_contacts > 0 && v.clean + v.needs_review + v.risky + v.blocked === 0) acts.push({ title: "Review data quality", desc: "AI flags what's safe to activate.", icon: ShieldCheck, to: "/app/data-vault", toneClass: "bg-primary/10 text-primary" });
  if (i.replies_due > 0) acts.push({ title: `${i.replies_due} replies need action`, desc: "Respond to warm replies before they cool.", icon: MessageSquare, to: "/app/follow-up?tab=replied", toneClass: "bg-emerald-100 text-emerald-700" });
  if (i.followups_today > 0) acts.push({ title: `${i.followups_today} follow-ups due / overdue`, desc: "Catch up your outreach queue.", icon: Mail, to: "/app/follow-up?tab=overdue", toneClass: "bg-amber-100 text-amber-700" });
  if (i.warm > 0) acts.push({ title: `${i.warm} warm contacts ready for pipeline`, desc: "Move qualified leads into opportunities.", icon: TrendingUp, to: "/app/follow-up?tab=warm", toneClass: "bg-primary/10 text-primary" });
  if (p.stuck > 0) acts.push({ title: `${p.stuck} deals stuck 14+ days`, desc: "Unblock or update next-action dates.", icon: AlertTriangle, to: "/app/pipeline", toneClass: "bg-amber-100 text-amber-700" });
  if (p.next_action_due > 0) acts.push({ title: `${p.next_action_due} opportunity actions overdue`, desc: "Chase proposals and negotiations.", icon: Clock, to: "/app/pipeline", toneClass: "bg-rose-100 text-rose-700" });
  if (v.risky > 0) acts.push({ title: `Review ${v.risky} risky contacts`, desc: "Decide what's safe to activate.", icon: AlertTriangle, to: "/app/data-vault", toneClass: "bg-amber-100 text-amber-700" });
  if (v.safe_to_activate > 0) acts.push({ title: `Send to ${Math.min(50, v.safe_to_activate)} safe contacts`, desc: "Activate a warm segment today.", icon: Send, to: "/app/activate", toneClass: "bg-emerald-100 text-emerald-700" });
  if (acts.length === 0) acts.push({ title: "Authenticate sender domain", desc: "Improve deliverability with SPF / DKIM.", icon: ShieldCheck, to: "/app/settings/email", toneClass: "bg-primary/10 text-primary" });
  return acts.slice(0, 9);
}

function CadenceSection({ rows, navigate }: { rows: CadenceRow[]; navigate: (to: string) => void }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground flex items-center justify-between gap-3">
          <span>No campaigns scheduled yet. Set a cadence to make this workspace run on rhythm.</span>
          <Button size="sm" onClick={() => navigate("/app/campaigns/new")}>
            <Rocket className="h-4 w-4 mr-2" /> Start a campaign
          </Button>
        </CardContent>
      </Card>
    );
  }

  const now = Date.now();
  const dayMs = 86_400_000;
  const enriched = rows.map((r) => {
    const lc = deriveLifecycle(r.status, {
      cadence_type: (r.cadence_type || "one_off") as CadenceType,
      start_at: r.start_at, cadence_end_at: r.cadence_end_at,
    }, r.runs_completed || 0);
    const nextMs = r.next_run_at ? new Date(r.next_run_at).getTime() : r.start_at ? new Date(r.start_at).getTime() : Infinity;
    const endMs = r.cadence_end_at ? new Date(r.cadence_end_at).getTime() : Infinity;
    return { r, lc, nextMs, endMs };
  });

  const startingSoon = enriched.filter((x) => x.lc === "scheduled" && x.nextMs - now <= 14 * dayMs).sort((a, b) => a.nextMs - b.nextMs).slice(0, 5);
  const dueNext = enriched.filter((x) => x.lc === "active" && isFinite(x.nextMs) && x.nextMs - now <= 14 * dayMs).sort((a, b) => a.nextMs - b.nextMs).slice(0, 5);
  const endingSoon = enriched.filter((x) => x.lc !== "completed" && x.lc !== "expired" && isFinite(x.endMs) && x.endMs - now <= 14 * dayMs && x.endMs >= now).sort((a, b) => a.endMs - b.endMs).slice(0, 5);
  const paused = enriched.filter((x) => x.lc === "paused").slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CadenceList icon={Rocket} title="Starting soon" empty="Nothing scheduled in the next 14 days." items={startingSoon} action="Review" navigate={navigate} />
      <CadenceList icon={Repeat} title="Due for next run" empty="No recurring runs due in the next 14 days." items={dueNext} action="Open" navigate={navigate} />
      <CadenceList icon={RefreshCw} title="Ending soon" empty="No campaigns expiring in the next 14 days." items={endingSoon} action="Extend" navigate={navigate} />
      <CadenceList icon={Pause} title="Paused" empty="No paused campaigns." items={paused} action="Resume" navigate={navigate} />
    </div>
  );
}

function CadenceList({
  icon: Icon, title, empty, items, action, navigate,
}: {
  icon: any; title: string; empty: string;
  items: { r: CadenceRow; lc: keyof typeof LIFECYCLE_TONE }[];
  action: string; navigate: (to: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : items.map(({ r, lc }) => {
          const tone = LIFECYCLE_TONE[lc];
          return (
            <div key={r.id} className="flex items-start justify-between gap-3 p-2 rounded-md border border-border">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {CADENCE_LABELS[(r.cadence_type || "one_off") as CadenceType]} · {nextActionLabel({
                    next_run_at: r.next_run_at, start_at: r.start_at,
                    cadence_type: (r.cadence_type || "one_off") as CadenceType,
                    cadence_end_at: r.cadence_end_at, timezone: r.timezone || "UTC",
                  } as any)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={tone.cls}>{tone.label}</Badge>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => navigate(`/app/campaigns/${r.id}`)}>{action} <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

