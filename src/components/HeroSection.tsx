import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, LayoutDashboard, Mail, BarChart3 } from "lucide-react";
import heroAbstract from "@/assets/hero-abstract.jpg";

/*
 * Alternate headline for later A/B testing:
 *   "Your marketing department, in a login."
 */

const HeroSection = () => (
  <section className="relative bg-hero min-h-[90vh] flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img src={heroAbstract} alt="" width={1920} height={1080} className="w-full h-full object-cover opacity-25" loading="eager" fetchPriority="high" decoding="async" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
    </div>
    <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
    <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent-warm/5 blur-3xl" />

    <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-28 w-full">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-6 inline-flex items-center gap-2">
            <Sparkles size={14} /> Self-serve campaign launchpad
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
            Launch your next marketing campaign in a <span className="text-gradient">weekend</span> — not a quarter.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/75 max-w-xl mb-10 leading-relaxed">
            Guided onboarding, AI-generated campaign packs, lead capture, pipeline tracking and monthly performance reports — all in one platform you control. No agency retainer, no strategy calls required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/75 mt-4">
            Self-serve. Guided. Cancel, pause or upgrade anytime.
          </p>
        </motion.div>

        {/* Right: product mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-5"
          aria-hidden="true"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-3xl" />
            <div className="relative bg-card/95 backdrop-blur rounded-2xl border border-border/40 shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="text-accent" size={18} />
                  <span className="text-sm font-semibold text-foreground">Campaign workspace</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Leads</p>
                  <p className="text-xl font-display font-bold text-foreground">342</p>
                </div>
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">CTR</p>
                  <p className="text-xl font-display font-bold text-foreground">4.8%</p>
                </div>
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                  <p className="text-xl font-display font-bold text-foreground">£28k</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { i: Mail, label: "Email sequence — sent", val: "5 / 5" },
                  { i: BarChart3, label: "Landing page", val: "Live" },
                  { i: Sparkles, label: "Social pack generated", val: "12 posts" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between bg-secondary/40 rounded-md px-3 py-2">
                    <span className="flex items-center gap-2 text-xs text-foreground">
                      <row.i size={14} className="text-accent" /> {row.label}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
