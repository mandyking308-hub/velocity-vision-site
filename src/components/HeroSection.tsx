import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Database, Mail, Newspaper, Share2, Linkedin } from "lucide-react";
import { siX, siInstagram, siBuffer } from "simple-icons";

type BrandIconDef = { path: string; hex: string; title: string };
const BrandIcon = ({ icon, size = 14 }: { icon: BrandIconDef; size?: number }) => (
  <svg role="img" aria-label={icon.title} viewBox="0 0 24 24" width={size} height={size} fill={`#${icon.hex}`}>
    <path d={icon.path} />
  </svg>
);

const draftRows = [
  { icon: Mail, label: "Email sequence", value: "Draft ready" },
  { icon: Share2, label: "Social posts", value: "4 drafts ready" },
  { icon: Newspaper, label: "Press release", value: "In review" },
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
          Find prospects. Create outreach.{" "}
          <span className="inline-block bg-white text-accent-warm px-3 md:px-4 rounded-2xl whitespace-nowrap">
            Publish social.
          </span>{" "}
          Manage replies.
        </h1>
        <p className="text-base md:text-lg text-primary-foreground/85 max-w-xl mb-8 leading-relaxed">
          One workspace for customer-controlled B2B growth — from approved prospect data to personalized email, social publishing and follow-up.
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
          You control what gets approved, sent and published. No card required for the Free Preview.
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

          <div className="space-y-2">
            {draftRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                  <row.icon size={14} className="text-accent" /> {row.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/5 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-warm inline-flex items-center gap-1.5">
                <BrandIcon icon={siBuffer} size={12} /> Social publishing — your Buffer account
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[<Linkedin size={13} className="text-[#0A66C2]" />, <BrandIcon icon={siInstagram} size={13} />, <BrandIcon icon={siX} size={13} />].map((icon, i) => (
                <span key={i} className="w-7 h-7 rounded-lg bg-white border border-border/60 flex items-center justify-center">
                  {icon}
                </span>
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">Choose the channel</span>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1 text-center">
              {["Draft", "Queue", "Schedule"].map((mode, i) => (
                <span
                  key={mode}
                  className={`text-[11px] font-semibold rounded-md py-1.5 ${i === 0 ? "bg-accent-warm text-accent-foreground shadow" : "text-muted-foreground"}`}
                >
                  {mode}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Illustrative connected Buffer workflow — Velocity prepares, you approve, Buffer publishes under your settings.
            </p>
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
