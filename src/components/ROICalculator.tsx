import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, TrendingUp, ArrowRight, DollarSign, Target, Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const SERVICE_COST_MONTHLY = 7500; // Growth plan benchmark used for ROI comparison

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const ROICalculator = () => {
  const [dealValue, setDealValue] = useState<number>(15000);
  const [closeRate, setCloseRate] = useState<number>(20);
  const [monthlyLeads, setMonthlyLeads] = useState<number>(40);

  const { monthlyDeals, monthlyRevenue, annualRevenue, roiMultiple, netMonthly } = useMemo(() => {
    const safeLeads = Math.max(0, monthlyLeads || 0);
    const safeRate = Math.min(Math.max(0, closeRate || 0), 100) / 100;
    const safeValue = Math.max(0, dealValue || 0);

    const deals = safeLeads * safeRate;
    const revenue = deals * safeValue;
    const annual = revenue * 12;
    const net = revenue - SERVICE_COST_MONTHLY;
    const roi = SERVICE_COST_MONTHLY > 0 ? revenue / SERVICE_COST_MONTHLY : 0;

    return {
      monthlyDeals: deals,
      monthlyRevenue: revenue,
      annualRevenue: annual,
      roiMultiple: roi,
      netMonthly: net,
    };
  }, [dealValue, closeRate, monthlyLeads]);

  const isProfitable = netMonthly > 0;

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
            <Calculator size={16} /> ROI Calculator
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            See your growth potential in 30 seconds.
          </h2>
          <p className="text-muted-foreground text-lg">
            Plug in your numbers. We'll show you what a Velocity Vision engine could deliver — and what it would cost to build.
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
                <Label htmlFor="deal-value" className="flex items-center gap-2 text-foreground">
                  <DollarSign size={16} className="text-accent" /> Average deal value (USD)
                </Label>
                <Input
                  id="deal-value"
                  type="number"
                  min={0}
                  max={10000000}
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
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
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value))}
                  className="text-lg"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value))}
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
                  max={100000}
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Comparison benchmarks against our Growth plan at {formatCurrency(SERVICE_COST_MONTHLY)}/mo.
              </p>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-hero text-primary-foreground border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
            <CardContent className="p-8 space-y-6 relative">
              <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" /> Projected impact
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">Monthly deals</p>
                  <p className="text-2xl font-display font-bold">{monthlyDeals.toFixed(1)}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">ROI multiple</p>
                  <p className="text-2xl font-display font-bold text-accent">{roiMultiple.toFixed(1)}×</p>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">Monthly revenue</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {formatCurrency(monthlyRevenue)}
                </p>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">Annual revenue</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">
                  {formatCurrency(annualRevenue)}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isProfitable
                    ? "bg-accent/15 border-accent/30"
                    : "bg-destructive/15 border-destructive/30"
                }`}
              >
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 mb-1">
                  Net monthly vs service cost
                </p>
                <p className="text-xl font-display font-bold">
                  {isProfitable ? "+" : ""}
                  {formatCurrency(netMonthly)}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  {isProfitable
                    ? "You'd net positive after our retainer."
                    : "Volume needs to grow before our retainer pays back."}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/demo">
                    <Play size={16} /> Explore the Platform
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full" asChild>
                  <Link to="/auth">
                    Start your workspace <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-xl mx-auto">
          Estimates only. Actual results depend on offer, market, and execution. Confirmed in your discovery call.
        </p>
      </div>
    </section>
  );
};

export default ROICalculator;
