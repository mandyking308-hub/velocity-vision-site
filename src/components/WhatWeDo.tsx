import { motion } from "framer-motion";
import { Target, Megaphone, Users, BarChart3, Palette, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: Target, title: "Marketing Strategy", desc: "Data-backed plans that turn market opportunity into measurable growth." },
  { icon: Megaphone, title: "PR & Media Relations", desc: "Earned media campaigns that build credibility across global markets." },
  { icon: Users, title: "Social & Influencer", desc: "Authentic creator partnerships that drive cultural relevance and reach." },
  { icon: BarChart3, title: "Paid Advertising", desc: "Performance media across search, social, and programmatic channels." },
  { icon: Palette, title: "Brand & Creative", desc: "Distinctive identities and campaigns that capture attention instantly." },
  { icon: BrainCircuit, title: "Marketing Intelligence", desc: "AI-powered analytics that turn data into decisive competitive advantage." },
];

const WhatWeDo = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">What We Do</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Full-spectrum marketing power</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">Six core disciplines. One integrated approach. Every channel, audience, and market—covered.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link to="/services" className="group block bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-accent/30">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <s.icon className="text-accent" size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatWeDo;
