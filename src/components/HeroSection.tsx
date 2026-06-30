import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Database, ShieldCheck, GitBranch } from "lucide-react";
import heroAbstract from "@/assets/hero-abstract.jpg";

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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-6 inline-flex items-center gap-2">
            <Sparkles size={14} /> Marketing outreach, follow-up and pipeline — in one workspace
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
            Turn messy data into outreach, replies and <span className="text-gradient">live pipeline</span>.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/75 max-w-xl mb-10 leading-relaxed">
            Upload your contacts, see who is safe to contact, generate marketing outreach assets — email sequences, social media content and press releases — then work the replies and move leads into pipeline. All from one workspace, instead of five disconnected tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="text-xs text-primary-foreground/75 mt-4">
            <Link to="/how-it-works" className="underline-offset-4 hover:underline">See how it works →</Link> · Self-serve · Governed sending · Cancel anytime
          </p>
        </motion.div>

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
                  <Database className="text-accent" size={18} />
                  <span className="text-sm font-semibold text-foreground">Your workspace</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Usable contacts</p>
                  <p className="text-xl font-display font-bold text-foreground">1,284</p>
                </div>
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reply rate</p>
                  <p className="text-xl font-display font-bold text-foreground">6.2%</p>
                </div>
                <div className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline</p>
                  <p className="text-xl font-display font-bold text-foreground">£47k</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { i: Database, label: "Data Vault — quality reviewed", val: "92% clean" },
                  { i: ShieldCheck, label: "Email sequence + social pack live", val: "Sending" },
                  { i: GitBranch, label: "Replies worked → pipeline", val: "8 warm" },
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
