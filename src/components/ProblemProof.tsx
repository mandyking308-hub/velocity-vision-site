import { motion } from "framer-motion";

const stats = [
  { stat: "6+", desc: "tools the average lean team stitches together to run outreach, follow-up and pipeline" },
  { stat: "40%+", desc: "of imported B2B contact data is duplicated, invalid or unsafe to send to without review" },
  { stat: "70%", desc: "of inbound replies go cold because no one owns follow-up across systems" },
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
          Commercial work breaks across tools, spreadsheets and inboxes
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
          Velocity Vision pulls all of that into one operating workspace.
        </p>
        <p className="text-muted-foreground text-lg">
          Data in. Quality reviewed. Activation governed. Outreach created. Replies worked. Pipeline moved — without context-switching across half a dozen apps.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ProblemProof;
