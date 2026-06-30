import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const useCases = [
  {
    tag: "Category launch",
    title: "Launching into a new category from a cold start",
    objective: "Stand up outreach and PR around a new product narrative without hiring an agency.",
    workflow: "Upload prospect and press list → review quality → activate safe segments → ship press release, social pack, and email sequence → work replies into pipeline.",
    outcome: "Structured launch cadence the team can run again next quarter.",
  },
  {
    tag: "Founder-led outreach",
    title: "Founder-led outreach without losing the day to it",
    objective: "Let a founder run high-trust outreach in 30 minutes a day.",
    workflow: "Connect sender → verify domain → activate a small safe-to-send segment → daily follow-up queue → snooze, reply, or move to pipeline in one click.",
    outcome: "Pipeline movement without a full-time SDR or agency retainer.",
  },
  {
    tag: "Market entry",
    title: "Entering a new geography or vertical",
    objective: "Test demand in a new region with localized assets and billing.",
    workflow: "Workspace per region → multilingual asset generation (EN/ES) → local currency billing → tracked replies and pipeline by market.",
    outcome: "Clean read on which markets are worth doubling down on.",
  },
  {
    tag: "Pipeline generation",
    title: "Turning a static list into live pipeline",
    objective: "Convert a long-neglected database into qualified conversations.",
    workflow: "Import CSV → quality and duplicate review → activate safe records under plan limits → cadence with follow-ups → opportunities by stage and value.",
    outcome: "Revenue-attributable activity from data that was sitting idle.",
  },
  {
    tag: "Reactivation",
    title: "Reactivating dormant contacts safely",
    objective: "Re-engage old customers without burning the sender reputation.",
    workflow: "Mark dormant segments → governed safe-send caps → reply queue surfaces who came back warm → move warm leads into pipeline.",
    outcome: "Recovered revenue without compliance or deliverability risk.",
  },
  {
    tag: "Agency delivery",
    title: "Running multiple clients from one operating workspace",
    objective: "Deliver outreach for several clients with isolated data, pooled governance, and clean reporting.",
    workflow: "Parent agency → child workspaces per client → per-workspace cadences and pipelines → pooled daily send ceiling enforced at agency level.",
    outcome: "Scalable client delivery without spreadsheets or shared inboxes.",
  },
];

const Work = () => (
  <>
    <SEO title="Use Cases & Example Plays | Velocity Vision" description="How founders, lean teams, and agencies use Velocity Vision to organise data, activate safely, work replies, and move opportunities into pipeline." path="/work" />
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Use cases</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">How teams use the workspace</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Example plays you can run inside Velocity Vision — from cold launch to pipeline reactivation to multi-client agency delivery.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-card border border-border/50 rounded-xl p-8 hover:shadow-elevated transition-all"
            >
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">{c.tag}</span>
              <h3 className="font-display font-semibold text-lg text-foreground mt-3 mb-3">{c.title}</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-foreground">Objective. </span><span className="text-muted-foreground">{c.objective}</span></p>
                <p><span className="font-semibold text-foreground">Workflow in the platform. </span><span className="text-muted-foreground">{c.workflow}</span></p>
                <p><span className="font-semibold text-accent">Outcome. </span><span className="text-muted-foreground">{c.outcome}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Work;
