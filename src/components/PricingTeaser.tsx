import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: "£149",
    unit: "one-off",
    desc: "One-off access for one customer-controlled campaign workflow.",
    bullets: [
      "1 workspace · 25 Campaign Credits",
      "Copilot brief, Launchpad and full campaign pack",
      "Preflight checks, sender verification and governed activation",
      "Reply triage, referrals, out-of-office dates and meeting handoff",
      "Pipeline and Outcome Funnel · up to 20 sends/day",
      "One-off campaigns · 30 days workspace access",
    ],
    cta: "Request Starter onboarding",
  },
  {
    name: "Growth",
    slug: "growth",
    price: "£249",
    unit: "per month",
    desc: "Monthly self-serve workspace for ongoing customer-controlled activity.",
    bullets: [
      "Everything in Starter, ongoing",
      "80 Campaign Credits / month",
      "Recurring cadence and reusable campaign templates",
      "Up to 50 sends/day",
      "Follow-up, reply states and early pipeline records",
    ],
    recurring: true,
    cta: "Request Growth onboarding",
  },
  {
    name: "Agency Workspace",
    slug: "agency",
    price: "£499",
    unit: "per month",
    desc: "Monthly self-serve workspace with isolated client workspaces.",
    bullets: [
      "Everything in Growth",
      "Unlimited isolated client workspaces",
      "250 pooled Campaign Credits / month",
      "Cross-client pipeline and Outcome Funnel visibility",
      "Account-wide daily send usage view · up to 100 sends/day",
    ],
    recurring: true,
    cta: "Request Agency onboarding",
  },
];


const PricingTeaser = () => (
  <section className="section-padding bg-splash-duo relative overflow-hidden">
    <div aria-hidden className="blob blob-blue w-80 h-80 -top-24 -left-20 animate-floaty" />
    <div aria-hidden className="blob blob-pink w-96 h-96 -bottom-32 -right-24 animate-drifty" />
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          Pricing
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Published plans for a governed self-serve workspace
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Review the price, billing cadence, included Campaign Credits, access period and activation requirements before purchase.
        </p>
      </motion.div>

      <div className="mb-6 rounded-xl border border-accent/40 bg-accent/5 px-4 py-4 text-sm text-foreground/90 max-w-4xl space-y-1">
        <p>
          Free Preview is available at £0 with no card and no automatic paid upgrade.
        </p>
        <p>
          Starter is one-off with 30 days of access. Growth and Agency Workspace renew monthly until cancelled. The final currency, tax treatment, payment provider and product terms are confirmed before purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-2xl p-6 shadow-card border flex flex-col bg-card border-border/50"
          >
            {plan.recurring && (
              <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">
                Recurring monthly plan
              </span>
            )}
            <h3 className="font-display font-semibold text-foreground mb-2">
              {plan.name}
            </h3>
            <p className="mb-2">
              <span className="text-3xl font-display font-bold text-foreground">
                {plan.price}
              </span>
              <span className="text-muted-foreground text-sm ml-1">{plan.unit}</span>
            </p>
            <p className="text-muted-foreground text-sm md:text-base mb-4">
              {plan.desc}
            </p>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed"
                >
                  <Check size={14} className="text-accent mt-1 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" asChild className="self-stretch">
              <Link to={`/contact?plan=${plan.slug}`}>
                {plan.cta} <ArrowRight size={16} />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="cta" size="lg" asChild>
          <Link to="/pricing">
            See full pricing <ArrowRight size={18} />
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground self-center">
          Product use remains self-serve. Paid activation follows onboarding and applicable compliance checks.
        </p>
      </div>
    </div>
  </section>
);

export default PricingTeaser;
