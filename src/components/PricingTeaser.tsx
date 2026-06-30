import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const plans = [
  { name: "Starter", price: "£149", unit: "one-off", desc: "One activated campaign with Data Vault, governed sending, replies and pipeline — 30 days workspace access." },
  { name: "Growth", price: "£249", unit: "per month", desc: "Recurring campaigns, larger sending caps, cadence scheduling, follow-up automation and monthly review.", highlight: true },
  { name: "Agency Workspace", price: "£499", unit: "per month", desc: "Multiple client workspaces, pooled credits and pooled sending governance across the account." },
  { name: "Premium Human Review", price: "£199", unit: "per review", desc: "Optional strategist review of one activation with written recommendations and a revision pass." },
];

const PricingTeaser = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Pay for governed action, not for stored data
        </h2>
        <p className="text-muted-foreground text-lg">Storage is generous. Credits cover heavy-value actions. Sending stays safe at every tier.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`rounded-2xl p-6 shadow-card border ${p.highlight ? "bg-card border-accent/60 ring-1 ring-accent/30" : "bg-card border-border/50"}`}
          >
            {p.highlight && (
              <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Most popular</span>
            )}
            <h3 className="font-display font-semibold text-foreground mb-2">{p.name}</h3>
            <p className="mb-3">
              <span className="text-3xl font-display font-bold text-foreground">{p.price}</span>
              <span className="text-muted-foreground text-sm ml-1">{p.unit}</span>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="cta" size="lg" asChild>
        <Link to="/pricing">See pricing <ArrowRight size={18} /></Link>
      </Button>
    </div>
  </section>
);

export default PricingTeaser;
