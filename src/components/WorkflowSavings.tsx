import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calculator, TrendingDown, ArrowRight, Clock, DollarSign, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0,
  );

const VELOCITY_COST_MONTHLY = 249; // Growth plan benchmark
const DEFAULT_HOURLY_RATE = 45; // blended team hourly rate, GBP — user-editable

const WorkflowSavings = () => {
  const [campaigns, setCampaigns] = useState(2);
  const [hoursDataPerCampaign, setHoursDataPerCampaign] = useState(4);
  const [hoursAssetsPerCampaign, setHoursAssetsPerCampaign] = useState(8);
  const [toolSpend, setToolSpend] = useState(280);
  const [freelancerSpend, setFreelancerSpend] = useState(600);
  const [hourlyRate, setHourlyRate] = useState(DEFAULT_HOURLY_RATE);

  const { hoursSaved, timeSavingsValue, toolSavings, totalMonthly, totalAnnual, netVsVelocity } = useMemo(() => {
    const c = Math.max(0, campaigns || 0);
    const hData = Math.max(0, hoursDataPerCampaign || 0);
    const hAssets = Math.max(0, hoursAssetsPerCampaign || 0);
    const tools = Math.max(0, toolSpend || 0);
    const free = Math.max(0, freelancerSpend || 0);
    const rate = Math.max(0, hourlyRate || 0);

    // Estimate ~70% of repetitive data + asset hours collapse into the workspace flow
    const totalHours = c * (hData + hAssets);
    const savedHrs = totalHours * 0.7;
    const timeValue = savedHrs * rate;
    // Assume ~60% of stitched-together tool spend overlaps the workspace
    const toolSaved = tools * 0.6 + free * 0.5;
    const monthly = timeValue + toolSaved;
    const annual = monthly * 12;
    const net = monthly - VELOCITY_COST_MONTHLY;
    return {
      hoursSaved: savedHrs,
      timeSavingsValue: timeValue,
      toolSavings: toolSaved,
      totalMonthly: monthly,
      totalAnnual: annual,
      netVsVelocity: net,
    };
  }, [campaigns, hoursDataPerCampaign, hoursAssetsPerCampaign, toolSpend, freelancerSpend, hourlyRate]);

  const positive = netVsVelocity > 0;

  return (
    <section id="savings" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2">
            <Calculator size={14} /> What's your current workflow costing you?
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Estimate the spend hidden in your current outreach process
          </h2>
          <p className="text-muted-foreground text-lg">
            Most teams underestimate what they spend each month cleaning data, building assets and stitching tools together. Plug in your numbers — these are estimates, not promises.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/60 shadow-card">
            <CardContent className="p-8 space-y-5">
              <h3 className="font-display text-xl font-semibold text-foreground">Your current workflow</h3>

              <div className="space-y-2">
                <Label htmlFor="campaigns" className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-accent" /> Outreach campaigns per month
                </Label>
                <Input id="campaigns" type="number" min={0} value={campaigns} onChange={(e) => setCampaigns(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hData" className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" /> Hours per campaign cleaning data & building lists
                </Label>
                <Input id="hData" type="number" min={0} value={hoursDataPerCampaign} onChange={(e) => setHoursDataPerCampaign(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hAssets" className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" /> Hours per campaign creating emails, social posts, press releases
                </Label>
                <Input id="hAssets" type="number" min={0} value={hoursAssetsPerCampaign} onChange={(e) => setHoursAssetsPerCampaign(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tools" className="flex items-center gap-2">
                  <Wrench size={16} className="text-accent" /> Monthly spend on stitched-together tools
                </Label>
                <Input id="tools" type="number" min={0} value={toolSpend} onChange={(e) => setToolSpend(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="free" className="flex items-center gap-2">
                  <DollarSign size={16} className="text-accent" /> Monthly spend on freelancers / contractors for outreach assets
                </Label>
                <Input id="free" type="number" min={0} value={freelancerSpend} onChange={(e) => setFreelancerSpend(Number(e.target.value))} />
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Time valued at {fmt(HOURLY_RATE)}/hr blended. Adjust to your own rate mentally if your team is more senior.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-hero text-primary-foreground border-0 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
            <CardContent className="p-8 space-y-5 relative">
              <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                <TrendingDown size={20} className="text-accent" /> Estimated monthly savings
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mb-1">Hours saved / month</p>
                  <p className="text-2xl font-display font-bold">{hoursSaved.toFixed(0)}h</p>
                </div>
                <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                  <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mb-1">Time value reclaimed</p>
                  <p className="text-2xl font-display font-bold">{fmt(timeSavingsValue)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mb-1">Tool & freelancer spend reduced</p>
                <p className="text-2xl font-display font-bold">{fmt(toolSavings)}</p>
              </div>

              <div className="p-5 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10">
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60 mb-1">Total estimated monthly savings</p>
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient">{fmt(totalMonthly)}</p>
                <p className="text-xs text-primary-foreground/60 mt-1">{fmt(totalAnnual)} per year</p>
              </div>

              <div className={`p-4 rounded-lg border ${positive ? "bg-accent/15 border-accent/30" : "bg-primary-foreground/5 border-primary-foreground/10"}`}>
                <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70 mb-1">Net vs Velocity Vision Growth ({fmt(VELOCITY_COST_MONTHLY)}/mo)</p>
                <p className="text-xl font-display font-bold">{positive ? "+" : ""}{fmt(netVsVelocity)}</p>
              </div>

              <div className="pt-2 space-y-3">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="w-full" asChild>
                  <Link to="/pricing">See pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-2xl">
          Estimates only. Actual savings depend on team size, current toolset, campaign volume and how much work currently lives in spreadsheets, inboxes and freelancers.
        </p>
      </div>
    </section>
  );
};

export default WorkflowSavings;
