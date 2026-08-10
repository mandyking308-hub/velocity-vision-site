import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Clock, DollarSign, Wrench, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCY_SYMBOLS, formatPrice, priceFor } from "@/lib/currency";

const parseNonNegative = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
};

const EXAMPLE = {
  campaigns: "4",
  hoursDataPerCampaign: "3",
  hoursAssetsPerCampaign: "5",
  toolSpend: "300",
  freelancerSpend: "1000",
  hourlyRate: "35",
};
const EMPTY = {
  campaigns: "",
  hoursDataPerCampaign: "",
  hoursAssetsPerCampaign: "",
  toolSpend: "",
  freelancerSpend: "",
  hourlyRate: "",
};

const WorkflowSavings = () => {
  const { currency } = useCurrency();
  const [values, setValues] = useState(EMPTY);
  const [exampleLoaded, setExampleLoaded] = useState(false);

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const loadExample = () => {
    setValues(EXAMPLE);
    setExampleLoaded(true);
  };
  const reset = () => {
    setValues(EMPTY);
    setExampleLoaded(false);
  };

  const growthPrice = priceFor("vv_growth_monthly", currency);
  const fmt = (value: number) => formatPrice(value, currency);
  const moneyLabel = `${CURRENCY_SYMBOLS[currency]} ${currency}`;

  const estimate = useMemo(() => {
    const campaignCount = parseNonNegative(values.campaigns);
    const dataHours = parseNonNegative(values.hoursDataPerCampaign);
    const assetHours = parseNonNegative(values.hoursAssetsPerCampaign);
    const tools = parseNonNegative(values.toolSpend);
    const freelancers = parseNonNegative(values.freelancerSpend);
    const rate = parseNonNegative(values.hourlyRate);

    const monthlyHours = campaignCount * (dataHours + assetHours);
    const monthlyTeamTimeCost = monthlyHours * rate;
    const monthlyCurrentCost = monthlyTeamTimeCost + tools + freelancers;

    return {
      monthlyHours,
      monthlyTeamTimeCost,
      monthlyCurrentCost,
      annualCurrentCost: monthlyCurrentCost * 12,
      illustrativeDifference: monthlyCurrentCost - growthPrice.amount,
    };
  }, [values, growthPrice.amount]);

  const hasAnyInput = useMemo(() => Object.values(values).some((raw) => raw.trim() !== ""), [values]);

  const fields: Array<{ key: keyof typeof EMPTY; id: string; label: string; icon: typeof Clock; placeholder: string }> = [
    { key: "campaigns", id: "campaigns", label: "Campaign workflows per month", icon: Calculator, placeholder: "e.g. 4" },
    { key: "hoursDataPerCampaign", id: "hData", label: "Hours per workflow preparing and reviewing data", icon: Clock, placeholder: "e.g. 3" },
    { key: "hoursAssetsPerCampaign", id: "hAssets", label: "Hours per workflow preparing content and follow-up", icon: Clock, placeholder: "e.g. 5" },
    { key: "toolSpend", id: "tools", label: `Current monthly software spend (${currency})`, icon: Wrench, placeholder: "e.g. 300" },
    { key: "freelancerSpend", id: "freelancers", label: `Current monthly contractor or external-service spend (${currency})`, icon: DollarSign, placeholder: "e.g. 1000" },
    { key: "hourlyRate", id: "rate", label: `Your chosen hourly cost (${moneyLabel}/hour)`, icon: DollarSign, placeholder: "e.g. 35" },
  ];

  return (
    <section id="workflow-cost" className="section-padding bg-splash-pink relative overflow-hidden">
      <div aria-hidden className="blob blob-blue w-80 h-80 -top-20 -left-24 animate-floaty" />
      <div aria-hidden className="blob blob-pink w-72 h-72 -bottom-28 -right-16 animate-drifty" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2">
            <Calculator size={14} /> Current workflow cost
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            What does your current process cost? Run your own numbers.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Enter the time and external spend behind your current workflow. Simple arithmetic only — it does not predict savings or assume Velocity Vision replaces any employee, contractor, tool or service.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid lg:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Input panel — brand blue */}
          <div className="bg-accent text-accent-foreground p-6 md:p-10 relative overflow-hidden">
            <div aria-hidden className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative bg-white text-foreground rounded-2xl p-6 md:p-7 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold">Your figures</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Money fields use {moneyLabel}. Blank fields count as 0. Results update live.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={loadExample}>
                    <Sparkles size={14} /> Load example
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={reset}>
                    <RotateCcw size={14} /> Reset
                  </Button>
                </div>
              </div>
              {exampleLoaded && (
                <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  Illustrative example loaded — every figure is editable. Replace it with your own numbers.
                </p>
              )}
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="flex items-center gap-2">
                    <field.icon size={16} className="text-accent" /> {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={set(field.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Results panel — brand pink */}
          <div className="bg-accent-warm text-accent-foreground p-6 md:p-10 relative overflow-hidden">
            <div aria-hidden className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full bg-white/15 blur-3xl" />
            <div className="relative space-y-5">
              <h3 className="font-display text-xl font-semibold">Your current-workflow estimate</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                  <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Entered hours per month</p>
                  <p className="text-2xl font-display font-bold">{estimate.monthlyHours.toFixed(1)}h</p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                  <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Entered team-time cost</p>
                  <p className="text-2xl font-display font-bold">{fmt(estimate.monthlyTeamTimeCost)}</p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white/10 border border-white/20">
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Total current monthly estimate</p>
                <p className="text-3xl md:text-4xl font-display font-bold">{fmt(estimate.monthlyCurrentCost)}</p>
                <p className="text-xs opacity-70 mt-1">{fmt(estimate.annualCurrentCost)} annualized from your entries</p>
              </div>

              <div className="p-5 rounded-xl bg-white/15 border border-white/30">
                <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Published Velocity Vision Growth price</p>
                <p className="text-xl font-display font-bold">{growthPrice.formatted} per month</p>
                {hasAnyInput ? (
                  <p className="text-xs opacity-75 mt-2 leading-relaxed">
                    Illustrative cost difference: {fmt(estimate.illustrativeDifference)} per month — your entered monthly estimate minus the published Growth price. This is a transparent price comparison, not a savings calculation.
                  </p>
                ) : (
                  <p className="text-xs opacity-75 mt-2 leading-relaxed">
                    Enter your figures to compare your current monthly estimate with the published Growth price.
                  </p>
                )}
              </div>

              <div className="pt-1 space-y-3">
                <Button size="lg" className="w-full bg-white text-accent-warm hover:bg-white/90 font-bold shadow-lg" asChild>
                  <Link to="/pricing">Review full pricing <ArrowRight size={18} /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full" asChild>
                  <Link to="/features">Review included features</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground mt-6 max-w-3xl">
          Arithmetic is based solely on the figures entered by the visitor. Velocity Vision does not guarantee cost savings, staff-time reductions, tool replacement, contractor replacement or any commercial outcome.
        </p>
      </div>
    </section>
  );
};

export default WorkflowSavings;
