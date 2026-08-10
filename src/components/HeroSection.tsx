import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Database,
  Mail,
  Newspaper,
  Share2,
  Target,
  LayoutTemplate,
  Clapperboard,
  Megaphone,
  ListChecks,
  Send,
} from "lucide-react";
import { siBuffer } from "simple-icons";

const packTiles = [
  { icon: Target, label: "Strategy" },
  { icon: LayoutTemplate, label: "Landing & offer" },
  { icon: Mail, label: "Email sequence" },
  { icon: Newspaper, label: "Press release" },
  { icon: Share2, label: "Social pack" },
  { icon: Clapperboard, label: "Video scripts" },
  { icon: Megaphone, label: "Paid ads" },
  { icon: ListChecks, label: "Lead capture" },
];

const HeroSection = () => (
  <section className="relative overflow-hidden bg-hero text-primary-foreground">
    <div aria-hidden className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
    <div aria-hidden className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-black/10 blur-3xl" />

    <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <p className="font-semibold text-[11px] md:text-xs uppercase tracking-[0.25em] mb-6 inline-flex items-center gap-2 text-primary-foreground/80">
          <ShieldCheck size={14} /> Velocity Vision · Customer-controlled B2B workspace
        </p>
        <h1 className="font-display font-bold leading-[1.05] tracking-tight text-4xl md:text-5xl lg:text-[3.6rem] mb-6">
          Build the whole campaign.{" "}
          <span className="inline-block bg-white text-accent-warm px-3 md:px-4 rounded-2xl">
            Run it from one workspace.
          </span>
        </h1>
        <p className="text-base md:text-lg text-primary-foreground/85 max-w-xl mb-8 leading-relaxed">
          Approved prospect data and a single brief become a complete campaign pack — strategy, landing &amp; offer copy, email sequences, press, social, video scripts, paid ads and lead capture — with governed sending, replies and early pipeline in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-white text-accent shadow-xl transition-transform hover:-translate-y-0.5"
          >
            Start Free Preview <ArrowRight size={16} />
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-sm border-2 border-white/70 text-primary-foreground hover:bg-white/10 transition-colors"
          >
            See how it works
          </Link>
        </div>
        <p className="text-xs md:text-sm text-primary-foreground/75 max-w-xl leading-relaxed">
          You review and approve what gets used, sent or handed off. No card required for the Free Preview.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        aria-hidden="true"
        className="relative"
      >
        <div className="relative w-full max-w-md mx-auto bg-white text-foreground rounded-3xl shadow-2xl p-5 md:p-6 space-y-4 border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-accent" />
              <span className="text-sm font-semibold">Spring launch — campaign workspace</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold bg-accent-warm text-accent-foreground">
              Sample
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Complete campaign pack — from one brief
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {packTiles.map((tile) => (
                <div key={tile.label} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-2">
                  <tile.icon size={13} className="text-accent shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/90">{tile.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/5 p-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-warm">Activation routes</p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <Send size={12} className="text-accent" /> Governed email sending
              </span>
              <span className="text-muted-foreground font-semibold">Approval-gated</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <svg role="img" aria-label="Buffer" viewBox="0 0 24 24" width={12} height={12} fill={`#${siBuffer.hex}`}>
                  <path d={siBuffer.path} />
                </svg>
                Social → your Buffer account
              </span>
              <span className="text-muted-foreground font-semibold">Draft · Queue · Schedule</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <LayoutTemplate size={12} className="text-accent" /> Other assets
              </span>
              <span className="text-muted-foreground font-semibold">Use in your channels</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-foreground/90">Replies this week</span>
            <span className="text-xs font-semibold text-muted-foreground">2 interested · 1 referral · 3 follow-ups</span>
          </div>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Illustrative interface only. These figures are not customer results or performance claims.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
