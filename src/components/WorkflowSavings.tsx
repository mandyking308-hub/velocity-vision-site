import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, Clock, DollarSign, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import { CURRENCY_SYMBOLS, formatPrice, priceFor } from "@/lib/currency";

const parseNonNegative = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
};

const WorkflowSavings = () => {
  const { currency } = useCurrency();
  const [campaigns, setCampaigns] = useState("");
  const [hoursDataPerCampaign, setHoursDataPerCampaign] = useState("");
  const [hoursAssetsPerCampaign, setHoursAssetsPerCampaign] = useState("");
  const [toolSpend, setToolSpend] = useState("");
  const [freelancerSpend, setFreelancerSpend] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const growthPrice = priceFor("vv_growth_monthly", currency);
  const fmt = (value: number) => formatPrice(value, currency);
  const moneyLabel = `${CURRENCY_SYMBOLS[currency]} ${currency}`;

  const estimate = useMemo(() => {
    const campaignCount = parseNonNegative(campaigns);
    const dataHours = parseNonNegative(hoursDataPerCampaign);
    const assetHours = parseNonNegative(hoursAssetsPerCampaign);
    const tools = parseNonNegative(toolSpend);
    const freelancers = parseNonNegative(freelancerSpend);
    const rate = parseNonNegative(hourlyRate);

    const monthlyHours = campaignCount * (dataHours + assetHours);
    const monthlyTeamTimeCost = monthlyHours * rate;
    const monthlyCurrentCost = monthlyTeamTimeCost + tools + freelancers;

    return {
      monthlyHours,
      monthlyTeamTimeCost,
      monthlyCurrentCost,
      annualCurrentCost: monthlyCurrentCost * 12,
    };
  }, [
    campaigns,
    hoursDataPerCampaign,
    hoursAssetsPerCampaign,
    toolSpend,
    freelancerSpend,
    hourlyRate,
  ]);

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
            Calculate the cost of your existing process using your own figures
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Enter the time and external spend associated with your current workflow. The calculator performs simple arithmetic only; it does not predict savings or assume that Velocity Vision replaces any existing employee, contractor, tool or service.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-8 space-y-5">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Your figures
              </h3>
              <p className="text-xs text-muted-foreground -mt-2">
                Money fields use {moneyLabel}. Leave a field blank if it does not apply.
              </p>

              <div className="space-y-2">
                <Label htmlFor="campaigns" className="flex items-center gap-2">
                  <Calculator size={16} className="text-accent" /> Campaign workflows per month
                </Label>
                <Input
                  id="campaigns"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 4"
                  value={campaigns}
                  onChange={(event) => setCampaigns(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hData" className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" /> Hours per workflow preparing and reviewing data
                </Label>
                <Input
                  id="hData"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 3"
                  value={hoursDataPerCampaign}
                  onChange={(event) => setHoursDataPerCampaign(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hAssets" className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" /> Hours per workflow preparing content and follow-up
                </Label>
                <Input
                  id="hAssets"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 5"
                  value={hoursAssetsPerCampaign}
                  onChange={(event) => setHoursAssetsPerCampaign(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools" className="flex items-center gap-2">
                  <Wrench size={16} className="text-accent" /> Current monthly software spend ({currency})
                </Label>
                <Input
                  id="tools"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 300"
                  value={toolSpend}
                  onChange={(event) => setToolSpend(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freelancers" className="flex items-center gap-2">
                  <DollarSign size={16} className="text-accent" /> Current monthly contractor or external-service spend ({currency})
                </Label>
                <Input
                  id="freelancers"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 1000"
                  value={freelancerSpend}
                  onChange={(event) => setFreelancerSpend(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate" className="flex items-center gap-2">
                  <DollarSign size={16} className="text-accent" /> Your chosen hourly cost ({moneyLabel}/hour)
                </Label>
                <Input
                  id="rate"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  placeholder="e.g. 35"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-hero text-primary-foreground border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
            <CardContent className="p-8 space-y-5 relative">
              <h3 className="font-display text-xl font-semibold">
                Your current-workflow estimate
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                    Entered hours per month
                  </p>
                  <p className="text-2xl font-display font-bold">
                    {estimate.monthlyHours.toFixed(1)}h
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                    Entered team-time cost
                  </p>
                  <p className="text-2xl font-display font-bold">
                    {fmt(estimate.monthlyTeamTimeCost)}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                  Total current monthly estimate
                </p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {fmt(estimate.monthlyCurrentCost)}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {fmt(estimate.annualCurrentCost)} annualised from your entries
                </p>
              </div>

              <div className="p-4 rounded-lg bg-accent/15 border border-accent/30">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 mb-1">
                  Published Velocity Vision Growth price
                </p>
                <p className="text-xl font-display font-bold">
                  {growthPrice.formatted} per month
                </p>
                <p className="text-xs text-primary-foreground/65 mt-2 leading-relaxed">
                  This is a price reference, not a savings calculation. Review the included functionality and decide which current costs, if any, are genuinely replaced in your own organisation.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/pricing">
                    Review full pricing <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full" asChild>
                  <Link to="/features">Review included features</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-3xl">
          Arithmetic is based solely on the figures entered by the visitor. Velocity Vision does not guarantee cost savings, staff-time reductions, tool replacement, contractor replacement or any commercial outcome.
        </p>
      </div>
    </section>
  );
};

export default WorkflowSavings;
