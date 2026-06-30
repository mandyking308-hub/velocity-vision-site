import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const groups = [
  {
    label: "Campaign builder",
    features: [
      { title: "Guided brief intake", value: "Stops the blank-page problem. Captures what's needed to generate a usable campaign first time." },
      { title: "Goal-based templates", value: "Pre-shaped flows for lead gen, launch, nurture, promo and re-engagement so you don't reinvent structure." },
      { title: "In-workspace editor", value: "Refine any output without leaving the platform — what you ship is what you saw." },
    ],
  },
  {
    label: "AI-generated campaign packs",
    features: [
      { title: "Strategy summary", value: "A short, actionable plan — not a 40-page deck nobody reads." },
      { title: "Copy across channels", value: "Landing page, offer, ads, email — written for conversion, not for word count." },
      { title: "Brand-aware generation", value: "Your tone, voice and constraints carry across every asset in the pack." },
    ],
  },
  {
    label: "Social, press and video outputs",
    features: [
      { title: "Social media pack", value: "Launch posts, follow-ups, hooks and CTAs — variants per platform, ready to schedule." },
      { title: "Press release", value: "Distribution-ready announcement so launches get amplified, not buried." },
      { title: "Video pack", value: "Scripts, hooks, shot list, storyboard outline and captions — no separate creative brief needed." },
    ],
  },
  {
    label: "Lead forms and pipeline",
    features: [
      { title: "Hosted lead forms", value: "Every campaign captures interest — no third-party form builder, no copy-paste embed dance." },
      { title: "Simple pipeline", value: "See leads move from new to qualified to closed without buying a separate CRM." },
      { title: "Follow-up sequences", value: "Drafted automatically so leads never go silent after the first touch." },
    ],
  },
  {
    label: "Reporting",
    features: [
      { title: "Monthly performance review", value: "Auto-generated. Tells you what worked, what to repeat, what to drop." },
      { title: "Pipeline value tracking", value: "Revenue-focused metrics, not vanity engagement numbers." },
      { title: "Exportable reports", value: "Share with stakeholders or clients — branded for agencies." },
    ],
  },
  {
    label: "Templates and agency workspaces",
    features: [
      { title: "Campaign template library", value: "Save winning campaigns and re-deploy them — your next launch is faster than your last." },
      { title: "Reusable assets", value: "Shared copy, offers and sequences across campaigns and clients." },
      { title: "Multi-client workspaces", value: "Run every client from one login, with clean isolation and branded exports." },
    ],
  },
];

const Features = () => (
  <>
    <SEO
      title="Features — Self-serve marketing campaign platform | Velocity Vision"
      description="Campaign builder, AI-generated packs, social, press and video outputs, lead forms, pipeline, reporting, templates and agency workspaces."
      path="/features"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Features</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">Everything inside the platform</h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Every feature exists to compress time-to-launch and increase the chance the campaign actually drives revenue.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          {groups.map((g, i) => (
            <motion.div key={g.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">{g.label}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {g.features.map((f) => (
                  <div key={f.title} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                    <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Features;
