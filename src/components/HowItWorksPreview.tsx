import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  { n: "01", title: "Answer the brief", desc: "Short guided questions about goal, audience and offer." },
  { n: "02", title: "Generate the campaign pack", desc: "The platform builds strategy, copy, assets and follow-up." },
  { n: "03", title: "Edit what you want", desc: "Tweak in the workspace — everything is editable, nothing is locked." },
  { n: "04", title: "Launch and capture leads", desc: "Publish, share, and collect leads into your pipeline." },
  { n: "05", title: "Review and improve", desc: "See what worked in the monthly report and rerun the winners." },
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
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          From brief to live campaign in 5 steps
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
          >
            <p className="text-accent font-display font-bold text-2xl mb-3">{s.n}</p>
            <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="cta" size="lg" asChild>
        <Link to="/how-it-works">See how it works <ArrowRight size={18} /></Link>
      </Button>
    </div>
  </section>
);

export default HowItWorksPreview;
