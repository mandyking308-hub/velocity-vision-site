import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Rocket, Database, Mail, Newspaper, Video, Share2, CalendarCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FirstCampaignLaunchpad from "@/components/app/FirstCampaignLaunchpad";
import CampaignPreflight from "@/components/app/CampaignPreflight";
import ReplyCommandCentre from "@/components/app/ReplyCommandCentre";
import OutcomeFunnelPanel from "@/components/app/OutcomeFunnelPanel";
import { runPreflight } from "@/lib/campaignPreflight";
import { isUnsubscribeCapabilityReady, UNSUBSCRIBE_HANDLER_DEPLOYED } from "@/lib/systemCapabilities";
import type { LaunchpadSignals } from "@/lib/launchpad";
import type { FunnelLead, FunnelOpportunity } from "@/lib/outcomeFunnel";

const HOURS_AGO = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const DEMO_LAUNCHPAD: LaunchpadSignals = {
  hasBrief: true,
  approvedContacts: 25,
  hasContent: true,
  senderReady: true,
  preflightBlockers: 1,
  approved: true,
  isSample: true,
  activated: false,
  campaignId: "demo-campaign-1",
};

const DEMO_PREFLIGHT = runPreflight({
  scope: "campaign",
  campaign: {
    id: "demo-campaign-1",
    name: "Spring Lead Sprint",
    goal: "Introduce the product to selected B2B prospects",
    status: "draft",
    pack: { emails: [{ subject: "A clearer way to organise outreach", body: "Illustrative draft copy for the demo." }] },
    brief: { cta: "Reply if a short walkthrough would be useful", audience: "B2B founders and commercial leads", offer: "Velocity Vision workspace" },
    approved_at: HOURS_AGO(2),
    is_sample: true,
    cadence_type: "one_off",
  },
  safeContacts: 25,
  reviewContacts: 4,
  senderState: "ready_warmup",
  senderEmail: "founder@example.com",
  remainingToday: 20,
  pauseReasons: [],
  legalAccepted: true,
  unsubscribeReady: isUnsubscribeCapabilityReady({
    handlerAvailable: UNSUBSCRIBE_HANDLER_DEPLOYED,
    messageBody: "Illustrative draft copy for the demo. You can unsubscribe at any time.",
  }),
});

const DEMO_REPLIES = [
  { id: "d1", name: "Hannah Wright", reply_category: "interested", reply_snippet: "Happy to look at this — can you send a time?", reply_triaged_at: null, replied_at: HOURS_AGO(8) },
  { id: "d2", name: "Marco Lopez", reply_category: "question", reply_snippet: "How does it handle multiple client workspaces?", reply_triaged_at: null, replied_at: HOURS_AGO(18) },
  { id: "d3", name: "Priya Shah", reply_category: "not_now", reply_snippet: "Bad timing — circle back next quarter.", reply_triaged_at: null, replied_at: HOURS_AGO(30) },
  { id: "d4", name: "Tom Clarke", reply_category: "unsubscribe", reply_snippet: "Please remove me from this list.", reply_triaged_at: null, replied_at: HOURS_AGO(4) },
  { id: "d5", name: "Aisha Khan", reply_category: "bounce", reply_snippet: "Delivery failed: mailbox unavailable.", reply_triaged_at: null, replied_at: HOURS_AGO(3) },
  { id: "d6", name: "Owen Baker", reply_category: "auto_reply", reply_snippet: "Out of office, returning on 18 August 2026.", reply_triaged_at: null, replied_at: HOURS_AGO(6) },
  { id: "d7", name: "Nina Petrov", reply_category: "referral", reply_snippet: "The right person is Dana Fox, dana.fox@example.com.", reply_triaged_at: null, replied_at: HOURS_AGO(40) },
  { id: "d8", name: "Callum Reid", reply_category: "interested", reply_snippet: "Interested — can you send a booking link?", reply_triaged_at: null, replied_at: HOURS_AGO(52) },
  { id: "d9", name: "Sofia Marino", reply_category: "interested", reply_snippet: "Booked a slot — speak soon.", reply_triaged_at: HOURS_AGO(20), replied_at: HOURS_AGO(30), meeting_booked_at: HOURS_AGO(18) },
];

const DEMO_FUNNEL_LEADS: FunnelLead[] = [
  ...DEMO_REPLIES.map((r, i) => ({
    id: r.id,
    campaign_id: "demo-campaign-1",
    source: i % 2 === 0 ? "Launch email" : "Customer-recorded follow-up",
    last_email_sent_at: HOURS_AGO(96),
    replied_at: r.replied_at ?? null,
    meeting_booked_at: r.meeting_booked_at ?? null,
    reply_category: r.reply_category,
    reply_snippet: r.reply_snippet,
    opportunity_id: r.id === "d9" ? "demo-opp-1" : null,
    status: r.id === "d9" ? "closed_won" : "contacted",
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `demo-contacted-${i}`,
    campaign_id: "demo-campaign-1",
    source: "Launch email",
    last_email_sent_at: HOURS_AGO(96),
    replied_at: null,
    meeting_booked_at: null,
    reply_category: null,
    reply_snippet: null,
    opportunity_id: null,
    status: "contacted",
  })),
];

const DEMO_FUNNEL_OPPS: FunnelOpportunity[] = [
  { id: "demo-opp-1", source_lead_id: "d9", source_campaign_id: "demo-campaign-1", stage: "won", created_at: HOURS_AGO(12) },
];

const packCards = [
  { icon: Mail, title: "Email sequence", body: "Subject: A clearer way to organise outreach\n\nIllustrative first-touch and follow-up drafts, ready for customer review." },
  { icon: Share2, title: "Social drafts", body: "Illustrative LinkedIn hooks and post variants. Draft only — nothing is published automatically." },
  { icon: Newspaper, title: "Press draft", body: "Illustrative announcement structure and press-release copy for customer editing." },
  { icon: Video, title: "Video script", body: "Illustrative short-form hook, 30-second script and shot-list starting point." },
];

export default function DemoCRMDashboard() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="mb-2"><Sparkles className="h-3 w-3 mr-1" />Illustrative sample data</Badge>
          <h1 className="text-3xl font-bold">Velocity Vision demo</h1>
          <p className="text-muted-foreground text-sm">A read-only walkthrough of the current self-serve workflow. No data, sends or payments are created here.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/demo/data-vault"><Database className="h-4 w-4 mr-2" />Data Vault demo</Link></Button>
          <Button asChild><Link to="/auth"><Rocket className="h-4 w-4 mr-2" />Start workspace</Link></Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad & preflight</TabsTrigger>
          <TabsTrigger value="replies">Reply intent</TabsTrigger>
          <TabsTrigger value="pack">Campaign pack</TabsTrigger>
          <TabsTrigger value="reporting">Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5">
            <h2 className="text-2xl font-bold">Commercial workspace overview</h2>
            <p className="text-muted-foreground text-sm mt-1">Illustrative Growth-plan state showing the product rules users actually operate under.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <Stat label="Campaign Credits" value="18" />
              <Stat label="Plan send ceiling" value="50/day" />
              <Stat label="Current warm-up allowance" value="20/day" />
              <Stat label="Eligible contacts" value="25" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" />Data review</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">25 contacts are eligible under illustrative workspace checks; 4 remain held for manual review. These checks are operational aids, not legal approval.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Sending controls</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Growth has a normal 50/day plan ceiling. A warming sender can reduce today's allowance; it can never increase the plan ceiling.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarCheck className="h-4 w-4" />Customer control</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Cadence dates organise recurring work. Every draft, activation and send remains customer-controlled; Velocity does not auto-publish or auto-send.</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">What the demo covers</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-muted-foreground">
              <div>Data Vault quality review</div><div>First-Campaign Copilot & Launchpad</div><div>Preflight and governed activation</div><div>Reply Intent Command Centre</div>
              <div>Referral review</div><div>Out-of-office return dates</div><div>Meeting handoff</div><div>Pipeline & Outcome Funnel</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launchpad" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Sample state only. The sample-data blocker is deliberate: demo records can never become a real activation.</p>
          <FirstCampaignLaunchpad signals={DEMO_LAUNCHPAD} />
          <CampaignPreflight result={DEMO_PREFLIGHT} title="Campaign preparation preflight — sample" />
          <p className="text-xs text-muted-foreground">Mailbox readiness, unsubscribe handling and the current daily allowance are checked again at send time. Campaign Credits are not consumed per email or contact sent.</p>
        </TabsContent>

        <TabsContent value="replies" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">Illustrative replies demonstrate intent triage, deterministic unsubscribe/bounce precedence, referrals, out-of-office dates, 24h+ waiting replies and a manually recorded booked meeting.</p>
          <ReplyCommandCentre leads={DEMO_REPLIES} readOnly />
        </TabsContent>

        <TabsContent value="pack" className="space-y-4 mt-4">
          <div>
            <h2 className="text-xl font-semibold">Illustrative full campaign pack</h2>
            <p className="text-sm text-muted-foreground">Campaign Credits currently fund full campaign-pack generation. Outputs remain editable drafts until the customer reviews them.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {packCards.map((item) => (
              <Card key={item.title}>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><item.icon className="h-4 w-4" />{item.title}<Badge variant="outline" className="ml-auto">Draft</Badge></CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground whitespace-pre-line">{item.body}</CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">No automated publishing, attribution, A/B testing or “winning campaign” cloning is represented in this demo.</p>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4 mt-4">
          <div>
            <h2 className="text-xl font-semibold">Outcome Funnel — illustrative records</h2>
            <p className="text-sm text-muted-foreground">The same stored-record reporting model used by the workspace, filled here with sample data only.</p>
          </div>
          <OutcomeFunnelPanel leads={DEMO_FUNNEL_LEADS} opportunities={DEMO_FUNNEL_OPPS} campaigns={{ "demo-campaign-1": "Spring Lead Sprint" }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
