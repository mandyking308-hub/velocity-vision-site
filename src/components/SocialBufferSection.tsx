import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siBuffer, siX, siInstagram, siFacebook } from "simple-icons";

type BrandIconDef = { path: string; hex: string; title: string };
const BrandIcon = ({ icon, size = 14 }: { icon: BrandIconDef; size?: number }) => (
  <svg role="img" aria-label={icon.title} viewBox="0 0 24 24" width={size} height={size} fill={`#${icon.hex}`}>
    <path d={icon.path} />
  </svg>
);

const chips = [
  "Connect your Buffer account",
  "Review & edit before handoff",
  "Choose the destination channel",
  "Draft, Queue or Schedule",
  "Customer-controlled publishing",
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SocialBufferSection = () => (
  <section className="section-padding relative">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2 opacity-90">
          <BrandIcon icon={siBuffer} size={14} /> Social publishing
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-5">
          Your social publishing workflow, connected to Buffer.
        </h2>
        <p className="text-base md:text-lg opacity-90 leading-relaxed mb-7 max-w-xl">
          Create and review social copy in Velocity, then send it to your Buffer account as a draft, to the queue, or scheduled for a future time.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
              <Check size={12} /> {chip}
            </span>
          ))}
        </div>
        <p className="text-xs opacity-75 mb-8 max-w-xl leading-relaxed">
          Text-only posts currently. Velocity never publishes automatically — your Buffer account, your channels and Buffer's own settings apply.
        </p>
        <Button asChild className="bg-white text-accent-warm hover:bg-white/90 font-bold shadow-lg" size="lg">
          <Link to="/features">See how social publishing works <ArrowRight size={16} /></Link>
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
            <p className="text-sm font-semibold inline-flex items-center gap-2">
              <BrandIcon icon={siBuffer} size={14} /> Buffer publishing handoff
            </p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold bg-accent text-accent-foreground">
              Illustrative
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Social draft — reviewed & editable</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Your reviewed post copy appears here. Edit it, pick a channel, then choose how it lands in your Buffer account.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Destination channel</p>
            <div className="flex items-center gap-2">
              {[
                { icon: <Linkedin size={13} className="text-[#0A66C2]" />, label: "LinkedIn", active: true },
                { icon: <BrandIcon icon={siInstagram} size={13} />, label: "Instagram", active: false },
                { icon: <BrandIcon icon={siFacebook} size={13} />, label: "Facebook", active: false },
                { icon: <BrandIcon icon={siX} size={13} />, label: "X", active: false },
              ].map((ch) => (
                <span
                  key={ch.label}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border ${
                    ch.active ? "border-accent bg-accent/10 text-foreground" : "border-border/60 text-muted-foreground"
                  }`}
                >
                  {ch.icon} {ch.label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your Buffer schedule</p>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={`rounded-lg py-2 text-center ${
                    day === "Thu" ? "bg-accent-warm text-accent-foreground shadow" : "bg-muted/50"
                  }`}
                >
                  <p className={`text-[9px] font-bold uppercase ${day === "Thu" ? "" : "text-muted-foreground"}`}>{day}</p>
                  {day === "Thu" && <p className="text-[9px] font-semibold mt-0.5">09:30</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1 text-center">
            {["Draft", "Queue", "Schedule"].map((mode, i) => (
              <span
                key={mode}
                className={`text-[11px] font-semibold rounded-md py-1.5 ${i === 0 ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground"}`}
              >
                {mode}
              </span>
            ))}
          </div>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Illustrative view of the connected Buffer workflow — your channels, your Buffer account, your schedule. Not a native Velocity calendar or analytics tool.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default SocialBufferSection;
