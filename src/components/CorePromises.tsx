import { motion } from "framer-motion";
import { ShieldCheck, Layers, GitBranch } from "lucide-react";

const promises = [
  {
    icon: Layers,
    title: "Data to action in one place",
    desc: "Upload contacts, review quality, build safe segments and activate — without exporting to another tool.",
  },
  {
    icon: ShieldCheck,
    title: "Governed sending by default",
    desc: "Sender verification, tiered daily limits and safety checks before any campaign goes live.",
  },
  {
    icon: GitBranch,
    title: "Replies and pipeline, not just sends",
    desc: "Work inbound replies, follow-up states and warm opportunities inside the same workspace.",
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
