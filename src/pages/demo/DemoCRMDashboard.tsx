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
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/demo/data-vault"><Sparkles className="h-4 w-4 mr-2" />Data Vault demo</a></Button>
          <Button onClick={() => setTab("builder")}><Rocket className="h-4 w-4 mr-2" />Start a campaign</Button>
        </div>
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

        <TabsContent value="dashboard" className="space-y-6 mt-4">
          {/* Top summary */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Commercial command centre</h2>
                <p className="text-muted-foreground text-sm">Activate your data, create outreach assets, and move deals forward.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 min-w-[280px]">
                <Stat label="Credits" value={18} />
                <Stat label="Safe send today" value={80} />
                <Stat label="Active" value={2} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button><Megaphone className="h-4 w-4 mr-2" />Activate safe segment</Button>
              <Button variant="outline">Upload contacts</Button>
              <Button variant="outline" onClick={() => setTab("builder")}>Create assets</Button>
            </div>
          </div>

          {/* Database Health */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Database Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <Stat label="Contacts" value={2148} />
              <Stat label="Companies" value={412} />
              <Stat label="Imports" value={6} />
              <Stat label="Clean" value={1284} />
              <Stat label="Safe to activate" value={1284} />
              <Stat label="Needs review" value={92} />
              <Stat label="Risky" value={37} />
              <Stat label="Blocked" value={14} />
              <Stat label="Duplicates" value={28} />
            </div>
          </div>

          {/* Activation Readiness + Send Safety Engine */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Activation Readiness & Send Safety</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="md:col-span-2"><CardContent className="p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Stat label="Send credits" value={420} />
                  <Stat label="Safe send today" value={40} />
                  <Stat label="Risky excluded" value={37} />
                  <Stat label="Blocked" value={14} />
                </div>
                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                  <p>✅ 1,284 contacts safe to activate · 92 need review</p>
                  <p>⚠️ Today's safe send limit reduced from 80 → 40</p>
                  <p className="text-muted-foreground text-xs">Reasons: new sender account · domain not authenticated · 12% of segment needs review.</p>
                  <p>📤 Recommended send today: <b>25</b> warm contacts</p>
                </div>
              </CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-base">Sender status</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Connected: founder@acme.com</p>
                  <p>Domain auth: <Badge variant="outline">SPF / DKIM pending</Badge></p>
                  <p>Health: <Badge className="bg-amber-100 text-amber-700 border-0">Warming up</Badge></p>
                  <p>Scheduled today: 0</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Store data generously. Activate carefully. We won't let you ruin your sender reputation.</p>
          </div>

          {/* Create assets */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Create outreach assets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { i: Megaphone, t: "Social media pack", d: "Launch posts, follow-ups, hooks, platform variants." },
                { i: Mail, t: "Email sequence", d: "Outreach + follow-up emails ready to send." },
                { i: Newspaper, t: "Press release", d: "Announcement copy for outreach and publicity." },
                { i: Video, t: "Video pack", d: "Hooks, 30s + 60s scripts, shot list." },
                { i: Sparkles, t: "Landing page copy", d: "Conversion-focused page structure." },
                { i: Copy, t: "Offer / follow-up copy", d: "Reply-ready follow-ups and offers." },
              ].map((c, i) => (
                <Card key={i} className="cursor-pointer" onClick={() => setTab("pack")}>
                  <CardHeader><c.i className="h-5 w-5 text-primary mb-1" /><CardTitle className="text-base">{c.t}</CardTitle><p className="text-xs text-muted-foreground">{c.d}</p></CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Replies & follow-up */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Replies and follow-up</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Stat label="Replies need action" value={6} />
              <Stat label="Follow-ups today" value={12} />
              <Stat label="Warm contacts" value={18} />
              <Stat label="Dormant" value={42} />
              <Stat label="Bounces" value={4} />
            </div>
          </div>

          {/* Pipeline */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Pipeline and sales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Leads" value={DEMO_LEADS.length} />
              <Stat label="Opportunities" value={3} />
              <Stat label="Pipeline value" value="£48,500" />
              <Stat label="Closed won" value={1} />
            </div>
          </div>

          {/* Next best actions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">What should I do next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                "Review 37 risky contacts",
                "Resolve 28 duplicates",
                "Send to 50 safe contacts",
                "Follow up 6 replies",
                "Move 4 leads into pipeline",
                "Authenticate sender domain",
                "Create a social pack for your next outreach",
                "Buy more credits",
              ].map((t, i) => (
                <Card key={i}><CardContent className="p-3 text-sm flex items-center justify-between"><span>{t}</span><ArrowRight className="h-4 w-4 text-muted-foreground" /></CardContent></Card>
              ))}
            </div>
          </div>

          <Card className="border-accent/40">
            <CardHeader className="pb-2"><CardTitle className="text-base">Campaign Credits — demo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">18 <span className="text-sm font-normal text-muted-foreground">/ 80 remaining</span></div>
                <div className="text-xs text-muted-foreground">Growth plan • resets 28 Jul</div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: "78%" }} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Campaign cadence — your operating rhythm</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Examples of how cadence drives recurring outreach. Pause, resume and refresh assets anytime.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  { name: "Q3 product launch", cadence: "One-off", state: "Scheduled", next: "Send sequence starts 12 Jul 09:00 BST", tone: "bg-blue-100 text-blue-700" },
                  { name: "Monthly outreach refresh", cadence: "Monthly", state: "Active", next: "Next run: 1 Aug · regenerates social pack", tone: "bg-emerald-100 text-emerald-700" },
                  { name: "Quarterly commercial check-in", cadence: "Quarterly", state: "Active", next: "Next run in 12 days · clones last cycle's emails", tone: "bg-emerald-100 text-emerald-700" },
                  { name: "Year-end re-engagement", cadence: "Yearly", state: "Paused", next: "Resume to schedule December run", tone: "bg-amber-100 text-amber-700" },
                ].map((r) => (
                  <div key={r.name} className="p-3 rounded-md border border-border">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{r.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.tone}`}>{r.state}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{r.cadence} · {r.next}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                One-off campaigns, weekly follow-up sequences, monthly newsletters, quarterly check-ins and yearly re-engagement all run from the same workspace — with safe send limits, asset reuse and follow-up reminders built in.
              </div>
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
                  <Badge className="bg-green-600">Sender connected (demo mailbox)</Badge>
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
