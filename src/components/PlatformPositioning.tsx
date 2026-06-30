import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const bullets = [
  "One workspace for every campaign and client",
  "Guided campaign builder — brief in, pack out",
  "Lead forms wired straight into your pipeline",
  "Simple pipeline to track interest through to closed",
  "Auto-generated monthly performance reporting",
  "Reusable templates so the next campaign is faster",
  "Optional agency workspace mode for multi-client work",
];

const PlatformPositioning = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Inside the platform</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5">
          The self-serve campaign engine behind the results
        </h2>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Everything you need to plan, launch, capture and improve — in one workspace you control. No retainer. No handovers.
        </p>
        <ul className="space-y-3 mb-8">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-foreground">
              <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} className="text-accent" />
              </span>
              <span className="text-muted-foreground">{b}</span>
            </li>
          ))}
        </ul>
        <Button variant="cta" size="lg" asChild>
          <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative"
        aria-hidden="true"
      >
        <div className="absolute -inset-6 bg-accent/10 blur-3xl rounded-3xl" />
        <div className="relative bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-semibold text-foreground">Q4 Launch Campaign</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Leads captured</p>
              <p className="text-2xl font-display font-bold text-foreground">182</p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline</p>
              <p className="text-2xl font-display font-bold text-foreground">£47k</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              ["Landing page", "Live"],
              ["Email sequence", "4 / 5 sent"],
              ["Social pack", "12 posts scheduled"],
              ["Lead form", "Capturing"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between bg-secondary/40 rounded-md px-3 py-2 text-xs">
                <span className="text-foreground">{k}</span>
                <span className="font-semibold text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PlatformPositioning;
