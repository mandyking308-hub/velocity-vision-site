import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Building2, Sparkles } from "lucide-react";
import laughingMarketer from "@/assets/laughing-marketer.jpg";

const BLUE = "#2440FF";
const PINK = "#FF1478";

const cards = [
  {
    icon: Briefcase,
    label: "For Businesses",
    title: "A commercial workspace for lean teams",
    desc: "Founders, agencies and lean growth teams need structure, safe activation and early pipeline — not another agency.",
    cta: "See it for lean teams",
    href: "/for-businesses",
    tone: "blue" as const,
  },
  {
    icon: Building2,
    label: "For Agencies",
    title: "One account, one workspace per client",
    desc: "Run multiple clients with isolated data, pooled credits and pooled sending governance — without tool sprawl.",
    cta: "See it for agencies",
    href: "/for-agencies",
    tone: "pink" as const,
  },
];

const AudienceSplit = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div aria-hidden className="blob blob-pink w-72 h-72 -top-24 -right-16 animate-floaty" />
    <div aria-hidden className="blob blob-blue w-96 h-96 -bottom-32 -left-24 animate-drifty" />
    <div className="max-w-7xl mx-auto relative">
      {/* Hero band: laughing marketer + colour blocks */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative grid md:grid-cols-5 gap-0 rounded-[32px] overflow-hidden shadow-2xl mb-12"
      >
        <div className="md:col-span-2 relative min-h-[380px]">
          <img
            src={laughingMarketer}
            alt="Marketer laughing while running her campaigns in Velocity Vision"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            width={1024}
            height={1280}
          />
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: PINK }}>
            <Sparkles size={12} /> Made for marketers
          </div>
        </div>
        <div
          className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center text-white relative"
          style={{ backgroundColor: BLUE }}
        >
          <div aria-hidden className="absolute -top-16 -right-16 w-60 h-60 rounded-full" style={{ backgroundColor: PINK, opacity: 0.35, filter: "blur(30px)" }} />
          <div aria-hidden className="absolute bottom-6 right-8 w-24 h-24 rounded-full" style={{ backgroundColor: PINK }} />
          <p className="relative font-semibold text-[11px] uppercase tracking-[0.25em] text-white/80 mb-4">Marketing, minus the grind</p>
          <h2 className="relative font-display font-bold text-3xl md:text-5xl leading-[1.05] mb-4">
            Real people. Real pipeline.{" "}
            <span style={{ color: "#FFD6E7" }}>Zero busywork.</span>
          </h2>
          <p className="relative text-white/85 text-base md:text-lg max-w-xl leading-relaxed">
            Velocity Vision gives marketers back the fun bits — the strategy, the stories, the wins — and quietly handles the data, the drafts and the follow-up.
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((c, i) => {
          const bg = c.tone === "blue" ? BLUE : PINK;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl p-8 shadow-elevated flex flex-col text-white overflow-hidden"
              style={{ backgroundColor: bg }}
            >
              <div aria-hidden className="absolute -top-16 -right-10 w-52 h-52 rounded-full" style={{ backgroundColor: c.tone === "blue" ? PINK : BLUE, opacity: 0.25, filter: "blur(24px)" }} />
              <div className="relative w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center mb-5">
                <c.icon className="text-white" size={24} />
              </div>
              <p className="relative font-semibold text-xs uppercase tracking-widest mb-2 text-white/80">{c.label}</p>
              <h3 className="relative text-2xl font-display font-semibold mb-3">{c.title}</h3>
              <p className="relative text-white/85 text-sm md:text-base leading-relaxed mb-6 flex-1">{c.desc}</p>
              <Button asChild className="relative self-start bg-white hover:bg-white/90" style={{ color: bg }}>
                <Link to={c.href}>{c.cta} <ArrowRight size={16} /></Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AudienceSplit;

