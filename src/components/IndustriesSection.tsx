import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Cpu, Landmark, Bot, Briefcase, ShoppingBag } from "lucide-react";

const industries = [
  { icon: Heart, title: "Healthcare", desc: "Compliant campaigns that build trust and drive patient engagement." },
  { icon: Cpu, title: "Technology", desc: "Positioning tech brands for category leadership and demand generation." },
  { icon: Landmark, title: "Finance", desc: "Compliance-ready campaigns for financial services and fintech." },
  { icon: Bot, title: "AI & Software", desc: "Launching AI products with narratives that resonate with enterprise buyers." },
  { icon: Briefcase, title: "Professional Services", desc: "Authority-building content and lead generation for B2B firms." },
  { icon: ShoppingBag, title: "Consumer Brands", desc: "Cultural moments and brand love through integrated consumer campaigns." },
];

const IndustriesSection = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Industries We Serve</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Deep sector expertise</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">We don't do generic. Our teams bring sector-specific knowledge to every campaign.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((ind, i) => (
          <motion.div
            key={ind.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link to="/industries" className="group flex items-start gap-4 bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all border border-border/50 hover:border-accent/30">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                <ind.icon className="text-primary group-hover:text-accent transition-colors" size={20} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{ind.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{ind.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default IndustriesSection;
