import { motion } from "framer-motion";
import { Database, Globe, BrainCircuit, Rocket } from "lucide-react";
import intelligenceVisual from "@/assets/intelligence-visual.jpg";

const pillars = [
  { icon: Database, title: "Data-Driven", desc: "Every decision backed by evidence. Every campaign measured against outcomes." },
  { icon: Globe, title: "Globally Connected", desc: "Teams across London, New York, Dubai, and Singapore. Reach everywhere." },
  { icon: BrainCircuit, title: "AI-Enabled", desc: "Proprietary AI tools for audience intelligence, content optimization, and predictive analytics." },
  { icon: Rocket, title: "Growth Focused", desc: "We exist to accelerate your growth. Period. Everything we do ladders up to revenue." },
];

const AgencyPositioning = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Why Velocity</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Built for the speed of modern business</h2>
          <p className="text-muted-foreground max-w-xl">We combine the strategic rigour of a consultancy with the creative firepower of an agency and the precision of a data company.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <img
            src={intelligenceVisual}
            alt="AI-powered marketing intelligence dashboard"
            className="rounded-2xl shadow-elevated w-full"
            loading="lazy"
          />
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <p.icon className="text-accent" size={28} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AgencyPositioning;
