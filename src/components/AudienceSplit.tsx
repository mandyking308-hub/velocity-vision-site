import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import laughingMarketer from "@/assets/laughing-marketer.jpg";

const BLUE = "#2440FF";
const PINK = "#FF1478";

const cards = [
  {
    icon: Briefcase,
    label: "For Businesses",
    title: "A customer-controlled workspace for lean teams",
    desc: "Organise authorised data, editable drafts, activation controls, follow-up and early opportunity records without transferring responsibility to a managed service.",
    cta: "Review the business workspace",
    href: "/for-businesses",
    tone: "blue" as const,
  },
  {
    icon: Building2,
    label: "For Agencies",
    title: "One account with an isolated workspace per client",
    desc: "Keep authorised client data, draft content, sender settings and activation decisions separated while using pooled Campaign Credits and account-wide send-usage visibility.",
    cta: "Review the agency workspace",
    href: "/for-agencies",
    tone: "pink" as const,
  },
];

const AudienceSplit = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div aria-hidden className="blob blob-pink w-72 h-72 -top-24 -right-16 animate-floaty" />
    <div aria-hidden className="blob blob-blue w-96 h-96 -bottom-32 -left-24 animate-drifty" />
    <div className="max-w-7xl mx-auto relative">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative grid md:grid-cols-5 gap-0 rounded-[32px] overflow-hidden shadow-2xl mb-12">
        <div className="md:col-span-2 relative aspect-[4/5] sm:aspect-[16/10] md:aspect-auto md:min-h-[460px] bg-muted">
          <img src={laughingMarketer} alt="Business user working in a commercial software workspace" className="absolute inset-0 w-full h-full object-cover object-[50%_20%]" loading="lazy" width={1024} height={1280} />
        </div>
        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center text-white relative" style={{ backgroundColor: BLUE }}>
          <div aria-hidden className="absolute -top-16 -right-16 w-60 h-60 rounded-full" style={{ backgroundColor: PINK, opacity: 0.35, filter: "blur(30px)" }} />
          <div aria-hidden className="absolute bottom-6 right-8 w-24 h-24 rounded-full" style={{ backgroundColor: PINK }} />
          <p className="relative font-semibold text-[11px] uppercase tracking-[0.25em] text-white/80 mb-4">Built for customer-controlled B2B workflows</p>
          <h2 className="relative font-display font-bold text-3xl md:text-5xl leading-[1.05] mb-4">One self-serve product. <span style={{ color: "#FFD6E7" }}>Clear responsibility at every step.</span></h2>
          <p className="relative text-white/85 text-base md:text-lg max-w-xl leading-relaxed">Businesses and agencies use Velocity Vision to organise customer-provided data, editable drafts, activation controls, follow-up records and early opportunity records in one workspace.</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const background = card.tone === "blue" ? BLUE : PINK;
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative rounded-2xl p-8 shadow-elevated flex flex-col text-white overflow-hidden" style={{ backgroundColor: background }}>
              <div aria-hidden className="absolute -top-16 -right-10 w-52 h-52 rounded-full" style={{ backgroundColor: card.tone === "blue" ? PINK : BLUE, opacity: 0.25, filter: "blur(24px)" }} />
              <div className="relative w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center mb-5"><card.icon className="text-white" size={24} /></div>
              <p className="relative font-semibold text-xs uppercase tracking-widest mb-2 text-white/80">{card.label}</p>
              <h3 className="relative text-2xl font-display font-semibold mb-3">{card.title}</h3>
              <p className="relative text-white/85 text-sm md:text-base leading-relaxed mb-6 flex-1">{card.desc}</p>
              <Button asChild className="relative self-start bg-white hover:bg-white/90" style={{ color: background }}><Link to={card.href}>{card.cta} <ArrowRight size={16} /></Link></Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AudienceSplit;
