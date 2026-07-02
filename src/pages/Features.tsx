import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
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
      { title: "Tiered daily caps", value: "Per-workspace daily limits scale with your plan; agencies use pooled sending governance across client workspaces." },
      { title: "Risky-record limits", value: "Risky records are limited within each batch and reviewed before activation." },
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
      { title: "Pooled credits & governance", value: "Credits and sending governance are pooled across the account." },
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
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">AI-powered workspace, pillar by pillar</h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Every feature exists to take you from messy data to live pipeline. AI drafts and reviews; you approve, activate and send.
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

      {/* AI where it helps. Governance where it matters. */}
      <section className="section-padding bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">AI, safely applied</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              AI where it helps. Governance where it matters.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Velocity Vision uses AI to turn messy contact data into ready-to-review outreach — email sequences, social packs, press releases, video scripts, follow-up drafts and summaries. Every AI output is a draft you review, edit and control. Activation, sending and pipeline movement stay in your hands, with sender verification and daily caps enforced by the platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "AI-assisted outreach assets", value: "Email sequences, social posts, press releases and video packs drafted from one brief — fully editable before you use them." },
              { title: "AI quality review", value: "Duplicates, risky records and missing fields surfaced automatically. You decide what stays in the segment." },
              { title: "AI-generated templates", value: "Start from AI-drafted templates for launch, nurture, promo and re-engagement workflows — adapt to your tone and offer." },
              { title: "AI-supported follow-up", value: "Suggested next-step drafts for replies and stuck conversations. You approve every send." },
              { title: "Governed AI activation", value: "Sender verification, tiered daily caps and risky-record limits gate every activation — no autonomous sending." },
              { title: "Human-controlled by design", value: "AI drafts; you review, edit, approve, activate. Velocity Vision does not guarantee replies, sales, deliverability or legal compliance." },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial control & agency scale strip */}
      <section className="section-padding bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Billing & Credits</p>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">Scale without billing surprises</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Plan credits, instant top-ups, multi-currency checkout and tax handled locally. Pay for what you activate, not for data sitting in the vault.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Agency Workspaces</p>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">One account, every client</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Isolated client workspaces, pooled credits and pooled governance, with cross-client visibility across the whole book.
              </p>
            </motion.div>
          </div>
          <div className="mt-10 text-center">
            <Button variant="cta" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <Footer />
  </>
);

export default Features;
