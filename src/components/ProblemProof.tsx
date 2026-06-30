import { motion } from "framer-motion";

const stats = [
  { stat: "56%", desc: "of SMBs have an hour or less per day for marketing" },
  { stat: "27%", desc: "of consumers say they never hear from a small business again after first contact or purchase" },
  { stat: "30%", desc: "of SMBs say ROI uncertainty holds them back from adopting growth technology" },
];

const ProblemProof = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">The problem</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          Why campaign launch breaks for most small businesses
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.stat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-card border border-border/50 rounded-xl p-8 shadow-card"
          >
            <p className="text-5xl md:text-6xl font-display font-bold text-accent mb-3">{s.stat}</p>
            <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <p className="text-xl md:text-2xl font-display font-semibold text-foreground mb-3">
          Velocity Vision is built to fix exactly this.
        </p>
        <p className="text-muted-foreground text-lg">
          Launch faster. Capture leads properly. Follow up consistently. See what worked.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-6">
          Sources: industry survey reporting from Shopify / Constant Contact.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ProblemProof;
