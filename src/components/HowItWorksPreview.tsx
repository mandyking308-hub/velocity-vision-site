import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, ShieldCheck, Mail, Send, Inbox, GitBranch } from "lucide-react";

const steps = [
  { n: "01", icon: Upload, title: "Upload your messy data", desc: "CSV or paste rows. Map your fields once. Companies and contacts land safely in the Data Vault." },
  { n: "02", icon: ShieldCheck, title: "AI reviews quality & readiness", desc: "AI quality review surfaces duplicates, risky records and missing fields. You pick who is safe to contact." },
  { n: "03", icon: Mail, title: "Generate AI-assisted outreach assets", desc: "Email sequences, social posts, press release and video pack — drafted by AI from one brief, fully editable before use." },
  { n: "04", icon: Send, title: "Verify sender & activate safely", desc: "Governed AI activation: verify sender, set cadence, and let daily caps and risky-record limits gate what goes out." },
  { n: "05", icon: Inbox, title: "Track replies with AI follow-up", desc: "Action queue for inbound replies with AI-supported follow-up suggestions and snooze — you approve every send." },
  { n: "06", icon: GitBranch, title: "Move warm contacts into early pipeline", desc: "Promote replies into early pipeline, track value and prepare for sales handoff — pipeline visibility, not CRM bloat." },
];

const HowItWorksPreview = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          From upload to early pipeline — one marketing-led workflow
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The same flow that creates your outreach also captures replies and moves early pipeline. No exports, no handoffs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <s.icon className="text-accent" size={20} />
              </div>
              <p className="text-accent font-display font-bold text-lg">{s.n}</p>
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="cta" size="lg" asChild>
        <Link to="/how-it-works">See the full workflow <ArrowRight size={18} /></Link>
      </Button>
    </div>
  </section>
);

export default HowItWorksPreview;
