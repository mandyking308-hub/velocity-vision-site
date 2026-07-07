import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Database, ShieldCheck, GitBranch } from "lucide-react";

const BLUE = "#2440FF";
const PINK = "#FF1478";

const HeroSection = () => (
  <section className="relative bg-white py-12 md:py-16 lg:py-20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl grid grid-cols-1 md:grid-cols-2 min-h-[640px]">
        {/* Left: royal blue — headline + copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative p-10 md:p-14 lg:p-16 flex flex-col justify-center text-white"
          style={{ backgroundColor: BLUE }}
        >
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <p className="relative font-semibold text-[11px] md:text-xs uppercase tracking-[0.25em] mb-6 inline-flex items-center gap-2 text-white/80">
            <Sparkles size={14} /> Velocity Vision · AI-powered outreach · Human-controlled activation
          </p>
          <h1 className="relative font-display font-bold leading-[1.02] tracking-tight text-4xl md:text-5xl lg:text-6xl mb-6">
            Velocity Vision turns messy data into outreach, follow-up and{" "}
            <span style={{ color: PINK }}>live pipeline</span>.
          </h1>
          <p className="relative text-base md:text-lg text-white/85 max-w-xl mb-8 leading-relaxed">
            Velocity Vision is the AI-powered commercial workspace for turning messy contact data into governed outreach, follow-up and pipeline. AI drafts the assets and quality-reviews your data — you review, edit and control what gets activated.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm shadow-xl transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#ffffff", color: BLUE }}
            >
              Start your workspace <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-sm border-2 border-white/80 text-white hover:bg-white/10 transition-colors"
            >
              See pricing
            </Link>
          </div>
          <p className="relative text-xs text-white/75 mt-5">
            <Link to="/how-it-works" className="underline-offset-4 hover:underline">See how it works →</Link> · Self-serve · Governed sending · Cancel anytime
          </p>
        </motion.div>

        {/* Right: hot pink — workspace card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative p-10 md:p-14 lg:p-16 flex items-center justify-center"
          style={{ backgroundColor: PINK }}
          aria-hidden="true"
        >
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full" style={{ backgroundColor: BLUE, opacity: 0.35, filter: "blur(2px)" }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 space-y-4 border border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={18} style={{ color: BLUE }} />
                <span className="text-sm font-semibold text-slate-900">Your Velocity Vision workspace</span>
              </div>
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold text-white"
                style={{ backgroundColor: PINK }}
              >
                Live
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Usable contacts", val: "1,284" },
                { label: "Reply rate", val: "6.2%" },
                { label: "Pipeline", val: "£47k" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-display font-bold text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { i: Database, label: "Data Vault — quality reviewed", val: "92% clean", c: BLUE },
                { i: ShieldCheck, label: "Email sequence + social pack live", val: "Sending", c: PINK },
                { i: GitBranch, label: "Follow-up worked → pipeline", val: "8 warm", c: BLUE },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-slate-800">
                    <row.i size={14} style={{ color: row.c }} /> {row.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Center seam */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none" />
      </div>
    </div>
  </section>
);

export default HeroSection;
