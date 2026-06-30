import { motion } from "framer-motion";
import { Compass, Target, UserCheck } from "lucide-react";

const promises = [
  {
    icon: Compass,
    title: "Guided, not blank-page",
    desc: "Answer a short brief and the platform builds your campaign plan.",
  },
  {
    icon: Target,
    title: "Built for revenue, not vanity",
    desc: "Campaign packs, lead capture and follow-up are structured to move buyers.",
  },
  {
    icon: UserCheck,
    title: "Self-serve with optional expert review",
    desc: "Run it yourself and only add human review if you want it.",
  },
];

const CorePromises = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {promises.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-8 shadow-card"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
              <p.icon className="text-accent" size={24} />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-3">{p.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CorePromises;
