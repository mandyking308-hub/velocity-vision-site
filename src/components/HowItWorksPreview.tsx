import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, ShieldCheck, GitBranch } from "lucide-react";

const steps = [
  {
    n: "step-one",
    number: "01",
    icon: Upload,
    title: "Bring your data together in one beautiful workspace",
    desc: "Everything starts in one place. Upload CSVs or paste rows, map your fields once, and let Velocity Vision organise companies, contacts and segments inside the Data Vault.",
    details: ["Data Vault", "Field mapping", "Duplicate checks", "Safe-to-contact view"],
  },
  {
    n: "step-two",
    number: "02",
    icon: ShieldCheck,
    title: "Turn outreach into a controlled daily practice",
    desc: "Generate email sequences, social posts, press releases and video assets from one brief — then review, edit, verify the sender and activate only when the governance checks are satisfied.",
    details: ["AI-assisted assets", "Sender verification", "Cadence controls", "Legal and sending gates"],
  },
  {
    n: "step-three",
    number: "03",
    icon: GitBranch,
    title: "Prove pipeline with clarity and confidence",
    desc: "Track replies, snooze follow-up, work the action queue and move warm contacts into early pipeline so you can see what is live, what is stuck and where value is building.",
    details: ["Follow-up queue", "Reply states", "Pipeline value", "Performance review"],
  },
];

const HowItWorksPreview = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div aria-hidden className="blob blob-pink w-72 h-72 -top-24 -right-16 animate-floaty" />
    <div aria-hidden className="blob blob-blue w-96 h-96 -bottom-32 -left-24 animate-drifty" />
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          One simple story: data in, outreach live, pipeline proved.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Velocity Vision has a lot of capability underneath, but the workflow is deliberately simple: bring the data together, activate safely, then prove what moved.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="bg-white/95 border border-white/70 rounded-2xl p-7 shadow-elevated hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <s.icon className="text-accent" size={22} />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">{s.n}</p>
                <p className="text-accent font-display font-bold text-2xl">{s.number}</p>
              </div>
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-3 leading-tight">{s.title}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">{s.desc}</p>
            <div className="flex flex-wrap gap-2">
              {s.details.map((detail) => (
                <span key={detail} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/80">
                  {detail}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button variant="cta" size="lg" asChild>
          <Link to="/how-it-works">Explore the Velocity Vision workflow <ArrowRight size={18} /></Link>
        </Button>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The full workflow still covers upload, quality review, asset generation, sender verification, activation, follow-up and early pipeline — this homepage version makes the story easy to understand at a glance.
        </p>
      </div>
    </div>
  </section>
);

export default HowItWorksPreview;
