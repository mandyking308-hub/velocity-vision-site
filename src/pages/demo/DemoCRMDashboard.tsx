import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, FolderOpen, Users, BarChart3, LayoutTemplate, Briefcase, Sparkles, Copy, ArrowRight, Mail, Megaphone, Video, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePack, CampaignBrief } from "@/lib/campaignPack";

const DEMO_BRIEF: CampaignBrief = {
  name: "Spring Lead Sprint",
  goal: "leads",
  kind: "lead_gen",
  offer: "AI campaign launchpad for SMBs",
  audience: "SMB founders and marketing leads",
  industry: "B2B SaaS",
  geography: "UK & EU",
  pricePoint: "£249/month",
  tone: "Confident, friendly, founder-led",
  cta: "Book a 15-min walkthrough",
  channels: ["LinkedIn", "Email", "PR"],
  deadline: "End of quarter",
  notes: "Lean into time-to-launch.",
  outputs: ["full"],
};

const DEMO_LEADS = [
  { name: "Hannah Wright", source: "Spring Lead Sprint", stage: "new", action: "Submitted form" },
  { name: "Marco Lopez", source: "Spring Lead Sprint", stage: "contacted", action: "Replied to email 1" },
  { name: "Priya Shah", source: "Spring Lead Sprint", stage: "qualified", action: "Booked call" },
  { name: "Tom Clarke", source: "Q1 PR Push", stage: "won", action: "Signed" },
  { name: "Aisha Khan", source: "Q1 PR Push", stage: "lost", action: "Not a fit" },
];

const STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;

export default function DemoCRMDashboard() {
  const pack = useMemo(() => generatePack(DEMO_BRIEF), []);
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Badge variant="outline" className="mb-2"><Sparkles className="h-3 w-3 mr-1" />Demo mode</Badge>
          <h1 className="text-3xl font-bold">Launch dashboard</h1>
          <p className="text-muted-foreground text-sm">A live walk-through of the self-serve campaign launchpad. No changes are saved.</p>
        </div>
        <Button onClick={() => setTab("builder")}><Rocket className="h-4 w-4 mr-2" />Start a campaign</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="builder">Guided builder</TabsTrigger>
          <TabsTrigger value="pack">Campaign pack</TabsTrigger>
          <TabsTrigger value="social">Social pack</TabsTrigger>
          <TabsTrigger value="press">Press release</TabsTrigger>
          <TabsTrigger value="video">Video pack</TabsTrigger>
          <TabsTrigger value="capture">Lead capture</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Active campaigns" value={2} />
            <Stat label="Leads captured" value={DEMO_LEADS.length} />
            <Stat label="Follow-ups due" value={2} />
            <Stat label="Last conversion" value="18%" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { i: Rocket, t: "Start a campaign", d: "Begin a new guided brief" },
              { i: FolderOpen, t: "My current campaigns", d: "2 active, 1 draft" },
              { i: Users, t: "Lead pipeline", d: "5 leads in flight" },
              { i: BarChart3, t: "Performance", d: "Best: Spring Lead Sprint" },
              { i: LayoutTemplate, t: "Templates", d: "6 starters + your past wins" },
              { i: Briefcase, t: "Client workspaces", d: "3 client workspaces" },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card><CardHeader>
                  <c.i className="h-5 w-5 text-primary mb-2" />
                  <CardTitle className="text-base">{c.t}</CardTitle>
                  <p className="text-sm text-muted-foreground">{c.d}</p>
                </CardHeader></Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-accent/40">
            <CardHeader className="pb-2"><CardTitle className="text-base">Campaign Credits — demo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">18 <span className="text-sm font-normal text-muted-foreground">/ 80 remaining</span></div>
                <div className="text-xs text-muted-foreground">Growth plan • resets 28 Jul</div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: "78%" }} /></div>
              <div className="text-xs rounded-md border border-accent/40 bg-accent/10 px-3 py-2">You've used 78% of your credits this cycle. Buy a top-up or upgrade to keep generating.</div>
              <div className="flex gap-2 pt-1">
                <span className="text-xs px-2 py-1 rounded-md border border-border">Small +25 · £49</span>
                <span className="text-xs px-2 py-1 rounded-md border border-border">Medium +75 · £119</span>
                <span className="text-xs px-2 py-1 rounded-md border border-border">Large +200 · £279</span>
                <span className="text-xs px-2 py-1 rounded-md border border-accent/40 bg-accent/5 ml-auto">+ Premium Human Review · £199</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle>Step 5 of 5 — Review</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              {Object.entries({ Name: DEMO_BRIEF.name, Goal: DEMO_BRIEF.goal, Type: DEMO_BRIEF.kind, Offer: DEMO_BRIEF.offer, Audience: DEMO_BRIEF.audience, Channels: DEMO_BRIEF.channels.join(", ") }).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-border last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
              <Button className="mt-4" onClick={() => setTab("pack")}><Sparkles className="h-4 w-4 mr-2" />Generate campaign pack</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pack" className="space-y-3 mt-4">
          <Section title="Headline">{pack.landing.headline}</Section>
          <Section title="Subheadline">{pack.landing.subheadline}</Section>
          <Section title="Big idea">{pack.strategy.bigIdea}</Section>
          <div className="grid md:grid-cols-2 gap-3">
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4" />Social pack</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{pack.social.launchPosts.length} launch posts, {pack.social.followUps.length} follow-ups, 7-day plan.</CardContent></Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" />Email sequence</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{pack.emails.length} emails, ready to send.</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">Connected: demo@velocity-outreach.com</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled onClick={() => {}}>Send (demo)</Button>
                  <Button size="sm" variant="outline" disabled>Schedule (demo)</Button>
                  <Button size="sm" variant="ghost">Export</Button>
                </div>
                <p className="text-xs">Reminder: 3 leads need follow-up · 2 sequences ready to send</p>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Newspaper className="h-4 w-4" />Press release</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Headline, body, quote, boilerplate.</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4" />Video pack</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">3 hooks, 30s + 60s scripts, shot list.</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-3 mt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {pack.social.launchPosts.slice(0, 4).map((p, i) => (
              <Card key={i}><CardContent className="p-3 space-y-2">
                <Badge variant="outline">{p.platform}</Badge>
                <p className="text-sm font-medium">{p.hook}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{p.short}</p>
              </CardContent></Card>
            ))}
          </div>
          <Card><CardHeader><CardTitle className="text-base">Launch week</CardTitle></CardHeader><CardContent className="space-y-1">
            {pack.social.launchWeek.map((d, i) => (<div key={i} className="flex gap-3 text-sm"><Badge variant="outline" className="w-12 justify-center">{d.day}</Badge><span className="text-muted-foreground">{d.theme}:</span><span>{d.post}</span></div>))}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="press" className="space-y-3 mt-4">
          <Section title="Headline">{pack.press.headline}</Section>
          <Section title="Opening">{pack.press.opening}</Section>
          {pack.press.body.map((b, i) => <Section key={i} title={`Body ${i + 1}`}>{b}</Section>)}
          <Section title="Quote">{pack.press.quote}</Section>
          <Section title="Boilerplate">{pack.press.boilerplate}</Section>
        </TabsContent>

        <TabsContent value="video" className="space-y-3 mt-4">
          <Section title="3 hooks"><ol className="list-decimal pl-5">{pack.video.hooks.map((h, i) => <li key={i}>{h}</li>)}</ol></Section>
          <Section title="30-second script"><pre className="whitespace-pre-wrap font-sans text-sm">{pack.video.script30}</pre></Section>
          <Section title="Shot list"><ul className="list-disc pl-5">{pack.video.shotList.map((s, i) => <li key={i}>{s}</li>)}</ul></Section>
        </TabsContent>

        <TabsContent value="capture" className="space-y-3 mt-4">
          <Card><CardHeader><CardTitle className="text-base">{pack.leadCapture.formTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {pack.leadCapture.fields.map((f, i) => (
                <div key={i} className="text-sm flex justify-between p-2 border border-border rounded-md"><span>{f.label}{f.required && " *"}</span><span className="text-muted-foreground">{f.type}</span></div>
              ))}
              <Button>{pack.leadCapture.ctaLabel}</Button>
              <p className="text-xs text-muted-foreground">Thanks: {pack.leadCapture.thankYou}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STAGES.map((s) => {
              const items = DEMO_LEADS.filter((l) => l.stage === s);
              return (
                <div key={s} className="bg-muted/40 rounded-md p-3 min-h-[200px]">
                  <div className="flex items-center justify-between mb-2"><h4 className="capitalize text-sm font-semibold">{s}</h4><Badge variant="outline">{items.length}</Badge></div>
                  <div className="space-y-2">
                    {items.map((l, i) => (
                      <Card key={i}><CardContent className="p-2 text-xs space-y-1">
                        <div className="font-medium">{l.name}</div>
                        <div className="text-muted-foreground">{l.source}</div>
                        <div>{l.action}</div>
                      </CardContent></Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Leads" value={DEMO_LEADS.length} />
            <Stat label="Qualified" value={DEMO_LEADS.filter((l) => l.stage === "qualified").length} />
            <Stat label="Won" value={DEMO_LEADS.filter((l) => l.stage === "won").length} />
            <Stat label="Conversion" value="20%" />
          </div>
          <Card><CardHeader><CardTitle className="text-base">What worked best</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>LinkedIn launch post drove 62% of qualified leads.</p>
              <p>Email #3 (story) had the highest reply rate.</p>
              <Button variant="outline" size="sm" className="mt-2"><Copy className="h-3 w-3 mr-1" />Clone winning campaign <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader><CardContent className="text-sm">{children}</CardContent></Card>;
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
