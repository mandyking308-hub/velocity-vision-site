import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "£149",
    unit: "one-off",
    desc: "Test the full workflow on one campaign.",
    bullets: ["1 activated campaign", "Data Vault + quality review", "Email + social + press pack", "Follow-up & pipeline access", "30 days workspace access"],
    cta: "Request Starter onboarding",
  },
  {
    name: "Growth",
    price: "£249",
    unit: "per month",
    desc: "Run outreach and pipeline as your main workflow.",
    bullets: ["Recurring campaigns & cadence", "Larger sending caps", "Follow-up automation", "Pipeline tracking", "Monthly review"],
    highlight: true,
    cta: "Request Growth onboarding",
  },
  {
    name: "Agency",
    price: "£499",
    unit: "per month",
    desc: "Manage multiple clients in one account.",
    bullets: ["Multiple client workspaces", "Pooled credits", "Pooled sending governance", "Per-client reporting", "Agency-level controls"],
    cta: "Request Agency onboarding",
  },
];

const PricingTeaser = () => (
  <section className="section-padding bg-splash-duo relative overflow-hidden">
    <div aria-hidden className="blob blob-blue w-80 h-80 -top-24 -left-20 animate-floaty" /><div aria-hidden className="blob blob-pink w-96 h-96 -bottom-32 -right-24 animate-drifty" />
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
          One workspace for marketing-led growth and early pipeline
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Outreach, follow-up and early pipeline together — for less than most teams spend on disconnected tools and lost follow-up.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`rounded-2xl p-6 shadow-card border flex flex-col ${p.highlight ? "bg-card border-accent/60 ring-1 ring-accent/30" : "bg-card border-border/50"}`}
          >
            {p.highlight && (
              <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Most popular</span>
            )}
            <h3 className="font-display font-semibold text-foreground mb-2">{p.name}</h3>
            <p className="mb-2">
              <span className="text-3xl font-display font-bold text-foreground">{p.price}</span>
              <span className="text-muted-foreground text-sm ml-1">{p.unit}</span>
            </p>
            <p className="text-muted-foreground text-sm md:text-base mb-4">{p.desc}</p>
            <ul className="space-y-2 mb-6 flex-1">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                  <Check size={14} className="text-accent mt-1 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button variant={p.highlight ? "cta" : "outline"} asChild className="self-stretch">
              <Link to="/contact">{p.cta} <ArrowRight size={16} /></Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="cta" size="lg" asChild>
          <Link to="/pricing">See full pricing <ArrowRight size={18} /></Link>
        </Button>
        <p className="text-xs text-muted-foreground self-center">
          Multi-currency checkout supported. Self-serve from day one.
        </p>
      </div>
    </div>
  </section>
);

export default PricingTeaser;
