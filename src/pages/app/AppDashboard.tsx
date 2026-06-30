import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, FolderOpen, Users, BarChart3, LayoutTemplate, Settings, Briefcase, ArrowRight,
  Database, ShieldCheck, Send, Megaphone, Mail, Newspaper, Video, FileText, MessageSquare,
  TrendingUp, AlertTriangle, Upload, Sparkles, Wand2, Zap, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import CreditMeter from "@/components/app/CreditMeter";
import FollowUpReminders from "@/components/app/FollowUpReminders";

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
  const [firstName, setFirstName] = useState("");
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [latestCampaignId, setLatestCampaignId] = useState<string | null>(null);
  const [campaignRows, setCampaignRows] = useState<CadenceRow[]>([]);

  const [vault, setVault] = useState<VaultStats>({
    total_contacts: 0, total_companies: 0, imports: 0, clean: 0,
    needs_review: 0, risky: 0, blocked: 0, duplicates: 0, safe_to_activate: 0,
  });
  const [pipeline, setPipeline] = useState<PipelineStats>({
    leads: 0, opportunities: 0, pipeline_value: 0, won: 0, lost: 0, by_stage: {},
  });
  const [inter, setInter] = useState<InteractionStats>({
    replies_due: 0, followups_today: 0, dormant: 0, warm: 0, bounces: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [
        { data: profile },
        { data: campaigns },
        { data: leads },
        { count: contactsTotal },
        { count: contactsClean },
        { count: contactsReview },
        { count: contactsRisky },
        { count: contactsBlocked },
        { count: companiesTotal },
        { count: importsCount },
        { data: opps },
        { data: sends },
      ] = await Promise.all([
        supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("campaigns").select("id, name, status, created_at, cadence_type, start_at, cadence_end_at, next_run_at, timezone, runs_completed").order("created_at", { ascending: false }),
        supabase.from("leads").select("id, status, follow_up_at, last_contacted_at"),
        supabase.from("contacts").select("*", { count: "exact", head: true }).not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "valid").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "needs_review").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "risky").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "blocked").not("source_upload_id", "is", null),
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("data_uploads").select("*", { count: "exact", head: true }),
        supabase.from("opportunities").select("id, stage, estimated_value"),
        supabase.from("email_sends").select("status, sent_at"),
      ]);

      setFirstName(profile?.first_name || "");
      const active = (campaigns || []).filter((c: any) => c.status === "active" || c.status === "planning").length;
      setActiveCampaigns(active);
      setLatestCampaignId(campaigns?.[0]?.id || null);
      setCampaignRows((campaigns || []) as CadenceRow[]);


      const clean = contactsClean ?? 0;
      const review = contactsReview ?? 0;
      const risky = contactsRisky ?? 0;
      const blocked = contactsBlocked ?? 0;
      setVault({
        total_contacts: contactsTotal ?? 0,
        total_companies: companiesTotal ?? 0,
        imports: importsCount ?? 0,
        clean, needs_review: review, risky, blocked,
        duplicates: 0,
        safe_to_activate: clean,
      });

      const ls = leads || [];
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const followups_today = ls.filter((l: any) => l.follow_up_at && new Date(l.follow_up_at).getTime() <= now).length;
      const warm = ls.filter((l: any) => ["contacted", "demo_scheduled", "proposal_sent"].includes(l.status)).length;
      const dormant = ls.filter((l: any) => l.last_contacted_at && (now - new Date(l.last_contacted_at).getTime()) > 30 * dayMs).length;
      const bounces = (sends || []).filter((s: any) => s.status === "failed" || s.status === "bounced").length;
      setInter({ replies_due: 0, followups_today, dormant, warm, bounces });

      const opp = opps || [];
      const by_stage: Record<string, number> = {};
      let pipeline_value = 0;
      opp.forEach((o: any) => {
        by_stage[o.stage] = (by_stage[o.stage] || 0) + 1;
        if (o.stage !== "closed_lost" && o.stage !== "closed_won") {
          pipeline_value += Number(o.estimated_value || 0);
        }
      });
      setPipeline({
        leads: ls.length,
        opportunities: opp.length,
        pipeline_value,
        won: opp.filter((o: any) => o.stage === "closed_won").length,
        lost: opp.filter((o: any) => o.stage === "closed_lost").length,
        by_stage,
      });
    })();
  }, [user]);

  const safeSendToday = Math.min(80, vault.safe_to_activate);
  const recommendedSend = Math.min(50, vault.safe_to_activate);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* A. Top summary bar */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your commercial workspace. Activate your data, create outreach assets, and move deals forward.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4 min-w-[320px]">
            <PillStat label="Credits" value={remaining} hint={planConfig.name} />
            <PillStat label="Safe send today" value={safeSendToday} hint="warm contacts" />
            <PillStat label="Active campaigns" value={activeCampaigns} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Button size="lg" onClick={() => navigate("/app/leads")}>
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

      {/* B. Database Health */}
      <SectionHeader
        icon={Database}
        title="Database Health"
        desc="What data you have, what is usable, and what needs attention."
        cta={{ label: "Review data", to: "/app/data-vault" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <BigStat label="Contacts" value={vault.total_contacts} icon={Users} tone="default" />
        <BigStat label="Companies" value={vault.total_companies} icon={Briefcase} tone="default" />
        <BigStat label="Imports" value={vault.imports} icon={Upload} tone="default" />
        <BigStat label="Clean" value={vault.clean} icon={CheckCircle2} tone="good" />
        <BigStat label="Safe to activate" value={vault.safe_to_activate} icon={ShieldCheck} tone="good" />
        <BigStat label="Needs review" value={vault.needs_review} icon={AlertTriangle} tone="warn" />
        <BigStat label="Risky" value={vault.risky} icon={AlertTriangle} tone="warn" />
        <BigStat label="Blocked / suppressed" value={vault.blocked} icon={AlertTriangle} tone="danger" />
        <BigStat label="Duplicates" value={vault.duplicates} icon={AlertTriangle} tone="warn" />
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Card className="h-full bg-primary/5 border-primary/30">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="text-xs font-medium text-primary">Recommended</div>
              <div className="text-sm mt-1">Activate <b>{vault.safe_to_activate}</b> safe contacts now.</div>
              <Button size="sm" className="mt-2" onClick={() => navigate("/app/leads")}>Activate <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* C. Activation Readiness */}
      <SectionHeader
        icon={ShieldCheck}
        title="Activation Readiness"
        desc="Safe outreach controls — only the right people, at the right pace."
        cta={{ label: "Open send controls", to: "/app/settings" }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat label="Send credits" value={remaining} />
              <MiniStat label="Safe send today" value={safeSendToday} />
              <MiniStat label="Risky excluded" value={vault.risky} tone="warn" />
              <MiniStat label="Blocked" value={vault.blocked} tone="danger" />
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><b>{vault.safe_to_activate}</b> contacts safe to activate</div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><b>{vault.needs_review}</b> need review</div>
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" /><b>{vault.risky}</b> risky records excluded</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Recommended send today: <b>{recommendedSend}</b> warm contacts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" />Sender status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Connected mailbox</span><Badge variant="outline">Check</Badge></div>
            <div className="flex items-center justify-between"><span>Domain authentication</span><Badge variant="outline">SPF / DKIM</Badge></div>
            <div className="flex items-center justify-between"><span>Scheduled sends today</span><b>0</b></div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/app/settings")}>Open email connections</Button>
          </CardContent>
        </Card>
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
        title="Create outreach assets"
        desc="Turn your data into ready-to-use outreach in minutes."
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
        title="Replies and follow-up"
        desc="Interaction intelligence — never miss a warm signal."
        cta={{ label: "Open interaction queue", to: "/app/leads" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <BigStat label="Replies need action" value={inter.replies_due} icon={MessageSquare} tone="warn" />
        <BigStat label="Follow-ups due today" value={inter.followups_today} icon={Mail} tone="warn" />
        <BigStat label="Warm contacts" value={inter.warm} icon={Zap} tone="good" />
        <BigStat label="Dormant" value={inter.dormant} icon={AlertTriangle} />
        <BigStat label="Bounces" value={inter.bounces} icon={AlertTriangle} tone="danger" />
      </div>
      <FollowUpReminders />

      {/* F. Pipeline and sales */}
      <SectionHeader
        icon={TrendingUp}
        title="Pipeline and sales"
        desc="From activated data to closed revenue."
        cta={{ label: "Open pipeline", to: "/app/leads" }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BigStat label="Leads" value={pipeline.leads} icon={Users} />
        <BigStat label="Opportunities" value={pipeline.opportunities} icon={Briefcase} />
        <BigStat label="Pipeline value" value={`£${pipeline.pipeline_value.toLocaleString()}`} icon={TrendingUp} tone="good" />
        <BigStat label="Closed won" value={pipeline.won} icon={CheckCircle2} tone="good" />
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
  if (v.risky > 0) acts.push({ title: `Review ${v.risky} risky contacts`, desc: "Decide what's safe to activate.", icon: AlertTriangle, to: "/app/data-vault", toneClass: "bg-amber-100 text-amber-700" });
  if (v.duplicates > 0) acts.push({ title: `Resolve ${v.duplicates} duplicates`, desc: "Merge or remove duplicate records.", icon: AlertTriangle, to: "/app/data-vault", toneClass: "bg-amber-100 text-amber-700" });
  if (v.safe_to_activate > 0) acts.push({ title: `Send to ${Math.min(50, v.safe_to_activate)} safe contacts`, desc: "Activate a warm segment today.", icon: Send, to: "/app/leads", toneClass: "bg-emerald-100 text-emerald-700" });
  if (i.followups_today > 0) acts.push({ title: `Follow up ${i.followups_today} contacts`, desc: "Follow-ups due today.", icon: Mail, to: "/app/leads", toneClass: "bg-primary/10 text-primary" });
  if (p.leads > 0 && p.opportunities === 0) acts.push({ title: `Move ${Math.min(4, p.leads)} contacts into pipeline`, desc: "Promote qualified leads to opportunities.", icon: TrendingUp, to: "/app/leads", toneClass: "bg-primary/10 text-primary" });
  if (credits < 20) acts.push({ title: "Top up credits", desc: "You're running low — keep sending without interruption.", icon: Zap, to: "/app/billing", toneClass: "bg-rose-100 text-rose-700" });
  acts.push({ title: "Authenticate sender domain", desc: "Improve deliverability with SPF / DKIM.", icon: ShieldCheck, to: "/app/settings", toneClass: "bg-primary/10 text-primary" });
  acts.push({ title: "Create a social pack for your next outreach", desc: "Launch posts, follow-ups and hooks in minutes.", icon: Megaphone, to: "/app/campaigns/new?focus=social", toneClass: "bg-accent/20 text-accent-foreground" });
  if (v.total_contacts === 0) acts.unshift({ title: "Upload your first contact list", desc: "Get data into the vault to unlock activation.", icon: Upload, to: "/app/data-vault/upload", toneClass: "bg-primary/10 text-primary" });
  return acts.slice(0, 9);
}
