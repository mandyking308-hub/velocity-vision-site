import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";

const cards = [
  {
    icon: Briefcase,
    label: "For Businesses",
    title: "Structured marketing without agency overhead",
    desc: "For founders, operators and lean teams that need traction now — not another retainer.",
    cta: "For Businesses",
    href: "/for-businesses",
  },
  {
    icon: Building2,
    label: "For Agencies",
    title: "One workspace for every client",
    desc: "Run campaigns for multiple clients, reuse what works, and export clean branded reporting.",
    cta: "For Agencies",
    href: "/for-agencies",
  },
];

const AudienceSplit = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-card flex flex-col"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
              <c.icon className="text-accent" size={24} />
            </div>
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">{c.label}</p>
            <h3 className="text-2xl font-display font-semibold text-foreground mb-3">{c.title}</h3>
            <p className="text-muted-foreground mb-6 flex-1">{c.desc}</p>
            <Button variant="cta" asChild className="self-start">
              <Link to={c.href}>{c.cta} <ArrowRight size={16} /></Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AudienceSplit;
