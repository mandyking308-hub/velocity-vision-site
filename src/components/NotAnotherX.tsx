import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const blocks = [
  {
    title: "Not an agency retainer",
    desc: "No waiting for meetings, handovers, or monthly activity reports that go nowhere.",
  },
  {
    title: "Not a blank AI tool",
    desc: "You don't start with an empty screen and figure everything out yourself.",
  },
  {
    title: "Not founder-dependent delivery",
    desc: "The system helps you move fast without waiting on a human every time.",
  },
];

const NotAnotherX = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          Not a retainer. Not a blank tool. Not another delay.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-7 shadow-card"
          >
            <XCircle className="text-accent mb-4" size={22} />
            <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default NotAnotherX;
