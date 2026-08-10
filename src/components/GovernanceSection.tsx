import { motion } from "framer-motion";
import { Eye, KeyRound, FileCheck, UserCheck } from "lucide-react";

const cards = [
  {
    icon: Eye,
    title: "Review before activation",
    desc: "Every campaign asset stays reviewable, and every send or handoff waits for an authorised human decision.",
  },
  {
    icon: KeyRound,
    title: "Clear permissions & control",
    desc: "Authenticated workspaces, plan limits and sender verification define who can do what.",
  },
  {
    icon: FileCheck,
    title: "Recorded activity",
    desc: "Approvals, sends, handoffs and follow-ups stay visible as workspace records you can audit.",
  },
  {
    icon: UserCheck,
    title: "Human ownership",
    desc: "Your data, your campaign, your call. Software assists — people decide.",
  },
];

const GovernanceSection = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Governance</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          Built for review, approval and accountability.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="rounded-2xl border border-border/50 bg-card p-6 shadow-card hover:border-accent/40 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <card.icon size={22} className="text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{card.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default GovernanceSection;
