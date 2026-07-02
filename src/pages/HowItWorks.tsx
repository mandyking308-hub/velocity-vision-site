import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const steps = [
  { n: "01", title: "Upload your messy data", desc: "Import CSVs or paste rows. Map your fields once. Companies and contacts land in the Data Vault." },
  { n: "02", title: "AI reviews quality & readiness", desc: "AI quality review flags what's complete, duplicated or risky — before you act on any of it. You stay in control." },
  { n: "03", title: "Build a safe segment", desc: "Filter to the records that are usable and safe to outreach to. Save the segment for reuse." },
  { n: "04", title: "Connect & verify sender", desc: "Connect your sending domain or mailbox. Verification gates activation — no surprises live." },
  { n: "05", title: "Generate AI-assisted outreach assets", desc: "Email sequence, social pack, press release and video pack drafted by AI from your brief. Every output is editable before it goes anywhere." },
  { n: "06", title: "Set timing & cadence", desc: "One-off or recurring (weekly/monthly). Decide how assets refresh between runs." },
  { n: "07", title: "Activate safely (governed AI)", desc: "Tiered daily caps, risky-record limits and pooled governance for agencies — enforced automatically. You approve activation." },
  { n: "08", title: "Work follow-up with AI support", desc: "Action queue for follow-up actions with AI-supported suggestions. Snooze, mark stuck, follow up — you send." },
  { n: "09", title: "Move warm contacts into pipeline", desc: "Promote warm contacts into opportunities. Track value, stage and progress in the same workspace." },
  { n: "10", title: "Review & repeat what works", desc: "Reply rates, pipeline value and activation health summarised every cycle. Rerun the winners." },
];

const outputs = [
  "Data Vault",
  "Quality flags & segments",
  "Sender verification",
  "Email sequence",
  "Social pack",
  "Press release",
  "Video pack",
  "Cadence scheduler",
  "Follow-up & reply states",
  "Pipeline",
  "Performance review",
];

const HowItWorks = () => (
  <>
    <SEO
      title="How it works — Velocity Vision commercial workspace"
      description="The end-to-end flow: upload data, review quality, activate safely, create outreach, set cadence, work follow-up and move opportunities into pipeline."
      path="/how-it-works"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">How it works</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">AI-powered outreach. Human-controlled activation.</h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              One continuous flow inside one workspace. AI drafts the assets and quality-reviews your data; activation is governed and only happens when you approve it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {steps.map((s) => (
              <div
                key={s.n}
                className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
              >
                <p className="text-accent font-display font-bold text-2xl mb-3">{s.n}</p>
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">What's in the workspace</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">The same login covers the whole loop — from data review through to opportunity movement.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outputs.map((o) => (
              <div key={o} className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-4 py-3">
                <Check className="text-accent shrink-0" size={16} />
                <span className="text-sm text-foreground">{o}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-8 max-w-2xl">
            From email sequences and social media content to press releases and follow-up, every practical output is generated inside the same workspace.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Self-serve, end to end</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Everything runs from your own workspace — upload, generate, activate, follow up and report. No call required to get started.
          </p>
          <Button variant="cta" asChild>
            <Link to="/auth">Start your workspace <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <Footer />
  </>
);

export default HowItWorks;
