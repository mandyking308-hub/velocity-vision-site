import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Target,
  LayoutTemplate,
  Mail,
  Newspaper,
  Share2,
  Clapperboard,
  Megaphone,
  ListChecks,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siBuffer } from "simple-icons";

const chips = [
  "8 editable asset types",
  "One voice across every channel",
  "Edit everything before use",
  "Your approval, every time",
];

const packTiles = [
  { icon: Target, label: "Strategy", note: "Positioning & big idea" },
  { icon: LayoutTemplate, label: "Landing & offer", note: "Page & offer copy" },
  { icon: Mail, label: "Email sequence", note: "Personalized drafts" },
  { icon: Newspaper, label: "Press release", note: "PR-ready draft" },
  { icon: Share2, label: "Social pack", note: "Posts, hooks & CTAs" },
  { icon: Clapperboard, label: "Video scripts", note: "30s & 60s scripts" },
  { icon: Megaphone, label: "Paid ads", note: "Headlines & copy" },
  { icon: ListChecks, label: "Lead capture", note: "Form & thank-you" },
];

const CampaignPackSection = () => (
  <section className="section-padding relative">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-90">Campaign generation</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-5">
          One brief. A complete campaign pack.
        </h2>
        <p className="text-base md:text-lg opacity-90 leading-relaxed mb-7 max-w-xl">
          Build the strategy and the working assets together, so the campaign speaks with one voice across every channel — then review and edit each piece before it goes anywhere.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
              <Check size={12} /> {chip}
            </span>
          ))}
        </div>
        <p className="text-xs opacity-75 mb-8 max-w-xl leading-relaxed">
          Every asset stays an editable draft until you approve it. Velocity never sends or publishes automatically.
        </p>
        <Button asChild className="bg-white text-accent-warm hover:bg-white/90 font-bold shadow-lg" size="lg">
          <Link to="/features">See the full campaign pack <ArrowRight size={16} /></Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        aria-hidden="true"
        className="relative"
      >
        <div className="relative w-full max-w-md mx-auto bg-white text-foreground rounded-3xl shadow-2xl p-5 md:p-6 space-y-4 border border-white/40">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Complete campaign pack</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold bg-accent text-accent-foreground">
              Illustrative
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {packTiles.map((tile) => (
              <div key={tile.label} className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/90">
                  <tile.icon size={12} className="text-accent shrink-0" /> {tile.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{tile.note}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/5 p-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-warm">Activation routes — you choose</p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <Send size={12} className="text-accent" /> Email sequence
              </span>
              <span className="text-muted-foreground font-semibold">Governed sending</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <svg role="img" aria-label="Buffer" viewBox="0 0 24 24" width={12} height={12} fill={`#${siBuffer.hex}`}>
                  <path d={siBuffer.path} />
                </svg>
                Social pack
              </span>
              <span className="text-muted-foreground font-semibold">Handoff to your Buffer account</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90">
                <LayoutTemplate size={12} className="text-accent" /> Landing, PR, video & ads
              </span>
              <span className="text-muted-foreground font-semibold">Use in your channels</span>
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Illustrative view. Social handoff is text-only to your own Buffer account as draft, queue or scheduled post — Velocity never publishes automatically.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CampaignPackSection;
