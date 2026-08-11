import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice, priceFor, type SkuId } from "@/lib/currency";
import { authNextForPlan } from "@/lib/safeNext";

const plans: Array<{
  name: string;
  slug: string;
  sku: SkuId;
  unit: string;
  desc: string;
  bullets: string[];
  recurring?: boolean;
  featured?: boolean;
  cta: string;
}> = [
  {
    name: "Starter",
    slug: "starter",
    sku: "vv_starter_oneoff",
    unit: "one-off",
    desc: "One-off access for one customer-controlled campaign workflow.",
    bullets: [
      "1 workspace · 25 Campaign Credits",
      "Copilot brief, Launchpad and full campaign pack",
      "Preflight checks, sender verification, governed activation",
      "Pipeline and Outcome Funnel · up to 20 sends/day",
      "30 days workspace access",
    ],
    cta: "Buy Starter",
  },
  {
    name: "Growth",
    slug: "growth",
    sku: "vv_growth_monthly",
    unit: "per month",
    desc: "Monthly self-serve workspace for ongoing customer-controlled activity.",
    bullets: [
      "Everything in Starter, ongoing",
      "80 Campaign Credits / month",
      "Recurring cadence and reusable templates",
      "Up to 50 sends/day",
      "Follow-up, reply states and early pipeline",
    ],
    recurring: true,
    featured: true,
    cta: "Start Growth",
  },
  {
    name: "Agency Workspace",
    slug: "agency",
    sku: "vv_agency_monthly",
    unit: "per month",
    desc: "Monthly self-serve workspace with isolated client workspaces.",
    bullets: [
      "Everything in Growth",
      "Unlimited isolated client workspaces",
      "250 pooled Campaign Credits / month",
      "Cross-client pipeline and Outcome Funnel visibility",
      "Up to 100 sends/day",
    ],
    recurring: true,
    cta: "Start Agency Workspace",
  },
];

const freePreviewPoints = [
  "14-day preview · no card required",
  "1 full campaign pack · 1 workspace",
  "No live sending or mailbox connection",
  "No automatic paid upgrade",
];

const PricingTeaser = () => {
  const { currency } = useCurrency();

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Published plans. No surprises.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Review price, cadence, included Campaign Credits and activation requirements before purchase. Full terms live on the pricing page.
          </p>
        </motion.div>

        {/* Free Preview strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl bg-hero text-primary-foreground p-6 md:p-8 shadow-elevated flex flex-col md:flex-row md:items-center gap-6"
        >
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Free Preview · {formatPrice(0, currency)}</p>
            <h3 className="font-display font-bold text-2xl mb-2">Try the full workflow first</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {freePreviewPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5 text-sm opacity-90">
                  <Check size={14} /> {point}
                </span>
              ))}
            </div>
          </div>
          <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90 font-bold shrink-0 shadow-lg">
            <Link to="/auth">Start Free Preview <ArrowRight size={16} /></Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`rounded-2xl p-6 flex flex-col bg-card shadow-card border ${
                plan.featured ? "border-accent-warm/60 shadow-elevated ring-1 ring-accent-warm/40" : "border-border/50"
              }`}
            >
              <span
                className={`inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold mb-3 ${
                  plan.recurring ? "bg-accent-warm/15 text-accent-warm" : "bg-accent/15 text-accent"
                }`}
              >
                {plan.recurring ? "Recurring monthly plan" : "One-off plan"}
              </span>
              <h3 className="font-display font-semibold text-foreground mb-2">{plan.name}</h3>
              <p className="mb-2">
                <span className="text-3xl font-display font-bold text-foreground">
                  {priceFor(plan.sku, currency).formatted}
                </span>
                <span className="text-muted-foreground text-sm ml-1">{plan.unit}</span>
              </p>
              <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                    <Check size={14} className="text-accent mt-1 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.featured ? "cta" : "outline"} asChild className="self-stretch">
                <Link to={authNextForPlan(plan.slug)}>
                  {plan.cta} <ArrowRight size={16} />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button variant="cta" size="lg" asChild>
            <Link to="/pricing">See full pricing <ArrowRight size={18} /></Link>
          </Button>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Starter is one-off with 30 days of access; Growth and Agency Workspace renew monthly until canceled. Prices shown in {currency}; final currency, tax treatment, payment provider and product terms are confirmed before purchase.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTeaser;
