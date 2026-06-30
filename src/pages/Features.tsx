import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const groups = [
  {
    label: "Data Vault",
    features: [
      { title: "Upload & field mapping", value: "CSV import or paste rows. Map once, reuse the mapping for next time." },
      { title: "Companies & contacts", value: "Structured records with the relationships intact — not a flat dump in a spreadsheet." },
      { title: "Saved segments", value: "Filter to the records that matter, save the segment, reuse it across campaigns." },
    ],
  },
  {
    label: "Quality Review",
    features: [
      { title: "Duplicate detection", value: "Surfaces duplicated and conflicting records before they get sent to." },
      { title: "Risk & completeness flags", value: "Missing fields, invalid emails and risky records are flagged for review." },
      { title: "Safe-to-activate view", value: "Filter directly to records that meet the safety bar — no guessing." },
    ],
  },
  {
    label: "Safe Activation",
    features: [
      { title: "Sender verification", value: "DNS-based SPF/DKIM verification before any activation can proceed." },
      { title: "Tiered daily caps", value: "Per-workspace daily limits scale with your plan; agencies pool to a single 1,000/day ceiling." },
      { title: "Risky-record limits", value: "Risky records are capped at 10% of any batch, max 25 per batch — enforced automatically." },
    ],
  },
  {
    label: "Outreach Assets",
    features: [
      { title: "Email sequence", value: "Multi-step outbound and follow-up generated from your brief, editable in the workspace." },
      { title: "Social pack", value: "Launch posts, hooks and platform variants ready to schedule alongside outreach." },
      { title: "Press & video pack", value: "Distribution-ready press release plus video scripts, shot lists and captions for short-form video." },
    ],
  },
  {
    label: "Cadence & Scheduling",
    features: [
      { title: "One-off & recurring runs", value: "Weekly, monthly or custom cadence with clear next-run visibility." },
      { title: "Asset refresh strategies", value: "Choose whether assets are reused, regenerated or refreshed each cycle." },
      { title: "Lifecycle states", value: "Draft, Scheduled, Active, Paused, Expired — clearly visible per campaign." },
    ],
  },
  {
    label: "Replies & Follow-Up",
    features: [
      { title: "Action queue inbox", value: "Inbound replies surface in one queue with clear owner and next action." },
      { title: "Follow-up states & snooze", value: "Mark replied, snooze (3d/7d/custom), flag stuck after 14 days." },
      { title: "Lead Action Panel", value: "Per-contact view of history, last touch, follow-up state and next step." },
    ],
  },
  {
    label: "Pipeline Movement",
    features: [
      { title: "Promote to opportunity", value: "Move warm contacts into pipeline with one click — value, stage, owner." },
      { title: "Stuck-deal alerts", value: "Opportunities idle for 14+ days surface in the dashboard for action." },
      { title: "Warm & dormant intelligence", value: "Re-surface warm contacts that went quiet so nothing dies in an inbox." },
    ],
  },
  {
    label: "Billing, Credits & Scaling",
    features: [
      { title: "Generous data storage", value: "Storage is included on every plan — credits only apply to heavy-value AI generations." },
      { title: "Credit top-ups", value: "Add Small / Medium / Large packs instantly; top-ups never expire while your plan is active." },
      { title: "Multi-currency & tax", value: "GBP, USD, EUR and more, with localised tax handled at checkout." },
    ],
  },
  {
    label: "Agency Workspaces",
    features: [
      { title: "Isolated client workspaces", value: "Run every client from one account with clean data and pipeline isolation." },
      { title: "Pooled credits & governance", value: "Credits and the 1,000/day sending ceiling are pooled across the account." },
      { title: "Cross-client visibility", value: "See activation health, replies and pipeline across the whole book in one view." },
    ],
  },
];

const Features = () => (
  <>
    <SEO
      title="Features — Commercial operating workspace | Velocity Vision"
      description="Data Vault, quality review, safe activation, outreach assets, cadence, replies, pipeline, credits and agency workspaces — connected end to end."
      path="/features"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Features</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">The full commercial workspace, pillar by pillar</h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Every feature exists to take you from messy data to live pipeline — safely, repeatably and without bolting on another tool.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
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
