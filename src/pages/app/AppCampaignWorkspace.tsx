import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CampaignBrief, CampaignPack, generatePack } from "@/lib/campaignPack";
import { toast } from "sonner";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { useCredits } from "@/contexts/CreditsContext";
import { CREDIT_COSTS } from "@/lib/credits";

import EmailSequenceSender from "@/components/app/EmailSequenceSender";
import LeadFormConfig from "@/components/app/LeadFormConfig";
import {
  CADENCE_LABELS, CadenceType, LIFECYCLE_TONE, REFRESH_LABELS, RefreshStrategy,
  computeNextRun, deriveLifecycle, nextActionLabel, plainEnglish,
} from "@/lib/cadence";
import { Pause, Play, Clock, Repeat } from "lucide-react";
import { buildCampaignMarkdown, slugify } from "@/lib/campaignPackExport";
import { checkPackQuality } from "@/lib/campaignQuality";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Campaign {
  id: string;
  name: string;
  status: string;
  goal: string | null;
  campaign_kind: string | null;
  brief: CampaignBrief | null;
  pack: CampaignPack | null;
  slug: string | null;
  lead_form_config: any;
  lead_form_published: boolean;
  cadence_type: CadenceType | null;
  cadence_interval: number | null;
  cadence_unit: string | null;
  start_at: string | null;
  timezone: string | null;
  cadence_end_at: string | null;
  cadence_max_runs: number | null;
  next_run_at: string | null;
  last_run_at: string | null;
  runs_completed: number | null;
  refresh_strategy: RefreshStrategy | null;
}


const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(i18n.t("common:toasts.copied"));
};

export default function AppCampaignWorkspace() {
  const { t } = useTranslation("app");
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: camp }, { data: ld }] = await Promise.all([
        supabase.from("campaigns").select("id, name, status, goal, campaign_kind, brief, pack, slug, lead_form_config, lead_form_published, cadence_type, cadence_interval, cadence_unit, start_at, timezone, cadence_end_at, cadence_max_runs, next_run_at, last_run_at, runs_completed, refresh_strategy").eq("id", id).maybeSingle(),
        supabase.from("leads").select("id, name, email, status, created_at, last_action").eq("campaign_id", id).order("created_at", { ascending: false }),
      ]);
      setC(camp as any);
      setLeads(ld || []);
    })();
  }, [id]);

  const { consume } = useCredits();

  const regenerate = async () => {
    if (!c?.brief) return;
    const ok = await consume("full_campaign_pack", c.id, c.name);
    if (!ok) return;
    const pack = generatePack(c.brief);
    await supabase.from("campaigns").update({ pack: pack as any }).eq("id", c.id);
    setC({ ...c, pack });
    toast.success(t("campaigns.toasts.packRegenerated"));
  };

  const withQualityCheck = (action: () => void) => {
    if (!c?.pack || !c?.brief) return;
    const q = checkPackQuality(c.pack as any, c.brief as any);
    if (!q.ok) {
      toast.error("Pack quality check failed. Regenerate before exporting.", {
        description: q.issues.slice(0, 2).map((i) => i.message).join(" • "),
      });
      return;
    }
    action();
  };

  const buildMd = () => {
    if (!c?.pack) return "";
    return buildCampaignMarkdown({
      name: c.name,
      brief: c.brief,
      pack: c.pack,
      cadenceSummary: c.start_at ? plainEnglish(cadenceFull as any) : undefined,
    });
  };

  const exportMarkdown = () => withQualityCheck(() => {
    const md = buildMd();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-pack-${slugify(c!.slug || c!.name)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Campaign pack downloaded");
  });

  const copyFullPack = () => withQualityCheck(async () => {
    await navigator.clipboard.writeText(buildMd());
    toast.success("Full campaign pack copied");
  });

  const exportJsonDebug = () => {
    if (!c?.pack) return;
    const blob = new Blob([JSON.stringify(c.pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-pack-${slugify(c.slug || c.name)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showJsonExport = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");


  if (!c) return <p className="text-muted-foreground">Loading…</p>;
  const pack = c.pack;
  const brief = c.brief;
  const lifecycleCfg = {
    cadence_type: (c.cadence_type || "one_off") as CadenceType,
    start_at: c.start_at, cadence_end_at: c.cadence_end_at,
    cadence_max_runs: c.cadence_max_runs ?? null,
  };
  const lifecycle = deriveLifecycle(c.status, lifecycleCfg, c.runs_completed || 0);
  const lifecycleTone = LIFECYCLE_TONE[lifecycle];

  const toggleStatus = async (newStatus: "paused" | "active") => {
    await (supabase.from("campaigns") as any).update({ status: newStatus }).eq("id", c.id);
    setC({ ...c, status: newStatus });
    toast.success(t(newStatus === "paused" ? "campaigns.toasts.paused" : "campaigns.toasts.resumed"));
  };

  const advanceRun = async () => {
    const cfg = {
      cadence_type: (c.cadence_type || "one_off") as CadenceType,
      cadence_interval: c.cadence_interval || 1,
      cadence_unit: (c.cadence_unit || "week") as any,
      start_at: c.start_at, timezone: c.timezone || "UTC",
      cadence_end_at: c.cadence_end_at, cadence_max_runs: c.cadence_max_runs ?? null,
      refresh_strategy: (c.refresh_strategy || "reuse") as RefreshStrategy,
    };
    const next = computeNextRun(cfg, new Date());
    await (supabase.from("campaigns") as any).update({
      last_run_at: new Date().toISOString(),
      runs_completed: (c.runs_completed || 0) + 1,
      next_run_at: next ? next.toISOString() : null,
      status: next ? "active" : "completed",
    }).eq("id", c.id);
    toast.success(t(next ? "campaigns.toasts.runLogged" : "campaigns.toasts.finalRunLogged"));
    setC({
      ...c, last_run_at: new Date().toISOString(),
      runs_completed: (c.runs_completed || 0) + 1,
      next_run_at: next ? next.toISOString() : null,
      status: next ? "active" : "completed",
    });
  };

  const cadenceFull = {
    cadence_type: (c.cadence_type || "one_off") as CadenceType,
    cadence_interval: c.cadence_interval || 1,
    cadence_unit: (c.cadence_unit || "week") as any,
    start_at: c.start_at, timezone: c.timezone || "UTC",
    cadence_end_at: c.cadence_end_at, cadence_max_runs: c.cadence_max_runs ?? null,
    refresh_strategy: (c.refresh_strategy || "reuse") as RefreshStrategy,
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <button onClick={() => navigate("/app/campaigns")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> All campaigns
      </button>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{c.name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={lifecycleTone.cls}>{lifecycleTone.label}</Badge>
            <Badge variant="outline" className="gap-1"><Repeat className="h-3 w-3" />{CADENCE_LABELS[cadenceFull.cadence_type]}</Badge>
            {c.goal && <Badge variant="outline">{c.goal}</Badge>}
            {c.campaign_kind && <Badge variant="outline">{c.campaign_kind.replace("_", " ")}</Badge>}
          </div>
          <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {nextActionLabel({
              next_run_at: c.next_run_at, start_at: c.start_at,
              cadence_type: cadenceFull.cadence_type, cadence_end_at: c.cadence_end_at,
              timezone: c.timezone || "UTC",
            } as any)}
          </div>
          {c.start_at && <div className="text-xs text-muted-foreground mt-1">{plainEnglish(cadenceFull as any)}</div>}
          {(c.runs_completed ?? 0) > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {c.runs_completed} run{(c.runs_completed || 0) > 1 ? "s" : ""} completed · Asset strategy: {REFRESH_LABELS[cadenceFull.refresh_strategy]}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {lifecycle === "active" || lifecycle === "scheduled" ? (
            <Button variant="outline" size="sm" onClick={() => toggleStatus("paused")}><Pause className="h-4 w-4 mr-1" />Pause</Button>
          ) : lifecycle === "paused" ? (
            <Button variant="outline" size="sm" onClick={() => toggleStatus("active")}><Play className="h-4 w-4 mr-1" />Resume</Button>
          ) : null}
          {(lifecycle === "active" || lifecycle === "scheduled") && cadenceFull.cadence_type !== "one_off" && (
            <Button variant="outline" size="sm" onClick={advanceRun}><Repeat className="h-4 w-4 mr-1" />Mark run complete</Button>
          )}
          <Button variant="outline" size="sm" onClick={regenerate}><Sparkles className="h-4 w-4 mr-1" />Regenerate ({CREDIT_COSTS.full_campaign_pack} credits)</Button>
          <Button variant="outline" size="sm" onClick={exportMd}><Download className="h-4 w-4 mr-1" />Export</Button>
          
        </div>
      </div>

      {!pack ? (

        <Card><CardContent className="p-8 text-center">No pack generated yet.</CardContent></Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="landing">Landing</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="press">Press</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="capture">Lead capture</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Section title="Campaign summary">
              <p><strong>Offer:</strong> {brief?.offer}</p>
              <p><strong>Audience:</strong> {brief?.audience}</p>
              <p><strong>Goal:</strong> {brief?.goal}</p>
              <p><strong>Deadline:</strong> {brief?.deadline || "—"}</p>
              <p><strong>Channels:</strong> {brief?.channels.join(", ")}</p>
            </Section>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4 mt-4">
            <Section title="Positioning"><p>{pack.strategy.positioning}</p></Section>
            <Section title="Big idea"><p>{pack.strategy.bigIdea}</p></Section>
            <Section title="Messaging pillars"><ul className="list-disc pl-5">{pack.strategy.messagingPillars.map((p, i) => <li key={i}>{p}</li>)}</ul></Section>
            <Section title="Success metric"><p>{pack.strategy.successMetric}</p></Section>
          </TabsContent>

          <TabsContent value="landing" className="space-y-4 mt-4">
            <Section title="Headline" copyText={pack.landing.headline}><p className="text-xl font-semibold">{pack.landing.headline}</p></Section>
            <Section title="Subheadline" copyText={pack.landing.subheadline}><p>{pack.landing.subheadline}</p></Section>
            {pack.landing.sections.map((s, i) => (
              <Section key={i} title={s.title} copyText={s.body}><p>{s.body}</p></Section>
            ))}
            <Section title="CTA"><Badge>{pack.landing.cta}</Badge></Section>
          </TabsContent>

          <TabsContent value="offer" className="space-y-4 mt-4">
            <Section title="Framing" copyText={pack.offer.framing}><p>{pack.offer.framing}</p></Section>
            <Section title="Benefits"><ul className="list-disc pl-5">{pack.offer.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></Section>
            <Section title="Objection handling"><div className="space-y-2">{pack.offer.objections.map((o, i) => (
              <div key={i} className="border-l-2 border-primary pl-3"><p className="font-medium">{o.objection}</p><p className="text-muted-foreground">{o.response}</p></div>
            ))}</div></Section>
          </TabsContent>

          <TabsContent value="emails" className="space-y-3 mt-4">
            <EmailSequenceSender emails={pack.emails} campaignId={c.id} leads={leads} />
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <Section title="Launch posts">
              <div className="grid md:grid-cols-2 gap-3">
                {pack.social.launchPosts.map((p, i) => <PostCard key={i} p={p} />)}
              </div>
            </Section>
            <Section title="Follow-up posts">
              <div className="grid md:grid-cols-2 gap-3">
                {pack.social.followUps.map((p, i) => <PostCard key={i} p={p} />)}
              </div>
            </Section>
            <Section title="Hook variations"><ul className="list-disc pl-5">{pack.social.hooks.map((h, i) => <li key={i}>{h}</li>)}</ul></Section>
            <Section title="CTA variations"><ul className="list-disc pl-5">{pack.social.ctas.map((c, i) => <li key={i}>{c}</li>)}</ul></Section>
            <Section title="Launch week sequence">
              <div className="space-y-2">{pack.social.launchWeek.map((d, i) => (
                <div key={i} className="flex gap-3 p-2 border border-border rounded-md">
                  <Badge variant="outline" className="h-6">{d.day}</Badge>
                  <div><p className="font-medium text-sm">{d.theme}</p><p className="text-sm text-muted-foreground">{d.post}</p></div>
                </div>
              ))}</div>
            </Section>
            <Section title="Repost / remix ideas"><ul className="list-disc pl-5">{pack.social.repostIdeas.map((r, i) => <li key={i}>{r}</li>)}</ul></Section>
          </TabsContent>

          <TabsContent value="press" className="space-y-4 mt-4">
            <Section title="Headline" copyText={pack.press.headline}><p className="text-xl font-semibold">{pack.press.headline}</p></Section>
            <Section title="Subheadline"><p>{pack.press.subheadline}</p></Section>
            <Section title="Opening paragraph" copyText={pack.press.opening}><p>{pack.press.opening}</p></Section>
            <Section title="Body" copyText={pack.press.body.join("\n\n")}>{pack.press.body.map((b, i) => <p key={i} className="mb-2">{b}</p>)}</Section>
            <Section title="Quote" copyText={pack.press.quote}><p className="italic">{pack.press.quote}</p></Section>
            <Section title="Boilerplate" copyText={pack.press.boilerplate}><p>{pack.press.boilerplate}</p></Section>
            <Section title="Contact"><p>{pack.press.contactLine}</p></Section>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <Section title="3 video hooks"><ol className="list-decimal pl-5 space-y-1">{pack.video.hooks.map((h, i) => <li key={i}>{h}</li>)}</ol></Section>
            <Section title="30-second script" copyText={pack.video.script30}><pre className="whitespace-pre-wrap font-sans text-sm">{pack.video.script30}</pre></Section>
            <Section title="60-second script" copyText={pack.video.script60}><pre className="whitespace-pre-wrap font-sans text-sm">{pack.video.script60}</pre></Section>
            <Section title="Talking-head version"><p>{pack.video.talkingHead}</p></Section>
            <Section title="B-roll version"><p>{pack.video.bRoll}</p></Section>
            <Section title="Shot list"><ul className="list-disc pl-5">{pack.video.shotList.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
            <Section title="Storyboard outline"><ul className="list-disc pl-5">{pack.video.storyboard.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
            <Section title="On-screen text"><ul className="list-disc pl-5">{pack.video.onScreenText.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
            <Section title="Caption / subtitle" copyText={pack.video.captionText}><p>{pack.video.captionText}</p></Section>
            <Section title="CTA endings"><ul className="list-disc pl-5">{pack.video.ctaEndings.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
          </TabsContent>

          <TabsContent value="capture" className="space-y-4 mt-4">
            <LeadFormConfig
              campaignId={c.id}
              slug={c.slug}
              published={c.lead_form_published ?? true}
              initial={c.lead_form_config || {}}
              packDefaults={{
                headline: pack.landing?.headline,
                subheadline: pack.landing?.subheadline,
                formTitle: pack.leadCapture?.formTitle,
                ctaLabel: pack.leadCapture?.ctaLabel,
                thankYou: pack.leadCapture?.thankYou,
                fields: pack.leadCapture?.fields as any,
              }}
            />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-4">
            <Section title={`Leads from this campaign (${leads.length})`}>
              {leads.length === 0 ? (
                <p className="text-muted-foreground text-sm">No leads yet. Share your capture URL or launch the social pack.</p>
              ) : (
                <div className="space-y-2">{leads.map((l) => (
                  <div key={l.id} className="flex justify-between items-center p-2 border border-border rounded-md text-sm">
                    <div><div className="font-medium">{l.name || l.email || "Anonymous"}</div><div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</div></div>
                    <Badge>{l.status}</Badge>
                  </div>
                ))}</div>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Leads" value={leads.length} />
              <Stat label="Qualified" value={leads.filter((l) => l.status === "qualified").length} />
              <Stat label="Won" value={leads.filter((l) => l.status === "won").length} />
              <Stat label="Conversion" value={leads.length ? `${Math.round((leads.filter((l) => l.status === "won").length / leads.length) * 100)}%` : "—"} />
            </div>
            <Section title="What's working">
              <p className="text-sm">{leads.length === 0 ? "Launch the campaign first — we'll surface insights here as soon as leads come in." : "Your top-converting channel and post will appear here once attribution kicks in."}</p>
            </Section>
            <Section title="Next step">
              <p className="text-sm mb-3">{leads.length > 0 ? "Clone this campaign and tweak the offer for a new audience." : "Share your social pack to start filling the pipeline."}</p>
              <Button size="sm" onClick={() => navigate(`/app/campaigns/new?goal=${c.goal}&kind=${c.campaign_kind}`)}>Clone this campaign</Button>
            </Section>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function Section({ title, children, copyText }: { title: string; children: React.ReactNode; copyText?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {copyText && <Button variant="ghost" size="sm" onClick={() => copy(copyText)}><Copy className="h-3 w-3" /></Button>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function PostCard({ p }: { p: any }) {
  return (
    <div className="p-3 border border-border rounded-md space-y-2">
      <div className="flex justify-between items-center">
        <Badge variant="outline">{p.platform}</Badge>
        <Button variant="ghost" size="sm" onClick={() => copy(p.long)}><Copy className="h-3 w-3" /></Button>
      </div>
      <p className="text-sm font-medium">{p.hook}</p>
      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{p.short}</p>
      <p className="text-xs"><span className="font-semibold">CTA:</span> {p.cta}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent></Card>
  );
}
