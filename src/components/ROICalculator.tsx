import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, ArrowRight, DollarSign, Target, Users, Play, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCY_SYMBOLS, formatPrice, priceFor } from "@/lib/currency";
import {
  DEFAULT_ROI_PLAN,
  ROI_PLANS,
  computeScenario,
  getRoiPlan,
  parseScenarioInput,
  type RoiPlanId,
} from "@/lib/roiScenario";
import { SIGNUP_PATH } from "@/lib/signupPath";

const ROICalculator = () => {
  const { currency } = useCurrency();
  const [planId, setPlanId] = useState<RoiPlanId>(DEFAULT_ROI_PLAN);
  // Raw string state so fields can be cleared/typed freely without snapping to 0.
  const [dealValueRaw, setDealValueRaw] = useState("15000");
  const [closeRateRaw, setCloseRateRaw] = useState("20");
  const [leadsRaw, setLeadsRaw] = useState("40");

  const plan = getRoiPlan(planId);
  const planPrice = priceFor(plan.sku, currency);

  const scenario = useMemo(
    () =>
      computeScenario({
        monthlyLeads: parseScenarioInput(leadsRaw),
        closeRatePct: parseScenarioInput(closeRateRaw),
        dealValue: parseScenarioInput(dealValueRaw),
        planCost: planPrice.amount,
      }),
    [leadsRaw, closeRateRaw, dealValueRaw, planPrice.amount],
  );

  const fmt = (n: number) => formatPrice(n, currency);
  const sliderRate = scenario.closeRatePct;

  return (
    <section id="roi-calculator" className="section-padding bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            <Calculator size={16} /> Scenario Calculator
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Model your pipeline economics in 30 seconds.
          </h2>
          <p className="text-muted-foreground text-lg">
            Estimate the economics using your own assumptions — deal value, close rate and lead
            volume — then compare the scenario against a Velocity plan price.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Inputs */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-8 space-y-6">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Your numbers</h3>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Layers size={16} className="text-accent" /> Compare against plan
                </Label>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Plan selector">
                  {ROI_PLANS.map((p) => {
                    const price = priceFor(p.sku, currency);
                    const active = p.id === planId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPlanId(p.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                          active
                            ? "border-accent bg-accent/10"
                            : "border-border/60 hover:border-accent/50"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-foreground">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {price.formatted}
                          {p.period === "monthly" ? "/mo" : " one-off"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deal-value" className="flex items-center gap-2 text-foreground">
                  <DollarSign size={16} className="text-accent" /> Average deal value (
                  {CURRENCY_SYMBOLS[currency]} {currency})
                </Label>
                <Input
                  id="deal-value"
                  type="number"
                  min={0}
                  value={dealValueRaw}
                  onChange={(e) => setDealValueRaw(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="close-rate" className="flex items-center gap-2 text-foreground">
                  <Target size={16} className="text-accent" /> Close rate (%)
                </Label>
                <Input
                  id="close-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={closeRateRaw}
                  onChange={(e) => setCloseRateRaw(e.target.value)}
                  className="text-lg"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderRate}
                  onChange={(e) => setCloseRateRaw(e.target.value)}
                  className="w-full accent-accent"
                  aria-label="Close rate slider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly-leads" className="flex items-center gap-2 text-foreground">
                  <Users size={16} className="text-accent" /> Monthly qualified leads
                </Label>
                <Input
                  id="monthly-leads"
                  type="number"
                  min={0}
                  value={leadsRaw}
                  onChange={(e) => setLeadsRaw(e.target.value)}
                  className="text-lg"
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                {plan.period === "one-off"
                  ? `Comparing against ${plan.name} at ${planPrice.formatted} one-off — the 30-day plan price.`
                  : `Comparing against ${plan.name} at ${planPrice.formatted}/mo — the monthly plan price.`}
              </p>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-hero text-primary-foreground border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
            <CardContent className="p-8 space-y-6 relative">
              <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" /> Scenario estimate
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                    Estimated deals / month
                  </p>
                  <p className="text-2xl font-display font-bold">{scenario.deals.toFixed(1)}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                    Revenue-to-plan-cost ratio
                  </p>
                  <p className="text-2xl font-display font-bold text-accent">
                    {scenario.ratio.toFixed(1)}×
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                  Potential monthly revenue
                </p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {fmt(scenario.monthlyRevenue)}
                </p>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                  Potential annual revenue
                </p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {fmt(scenario.annualRevenue)}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  scenario.isNetPositive
                    ? "bg-accent/15 border-accent/30"
                    : "bg-destructive/15 border-destructive/30"
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 mb-1">
                  {plan.period === "one-off"
                    ? "Net vs one-off plan price (first 30 days)"
                    : "Net monthly vs monthly plan price"}
                </p>
                <p className="text-xl font-display font-bold">
                  {scenario.isNetPositive ? "+" : ""}
                  {fmt(scenario.netVsPlan)}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {scenario.isNetPositive
                    ? "Your scenario revenue covers the plan price."
                    : "Your scenario doesn't cover the plan price yet."}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/demo">
                    <Play size={16} /> Explore the Platform
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full" asChild>
                  <Link to={SIGNUP_PATH}>
                    Start your workspace <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-xl mx-auto">
          Illustrative only — not a guarantee of results. Actual outcomes depend on your offer,
          market and execution.
        </p>
      </div>
    </section>
  );
};

export default ROICalculator;
