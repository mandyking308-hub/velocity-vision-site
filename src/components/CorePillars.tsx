import { motion } from "framer-motion";
import { Database, Sparkles, Send, Inbox } from "lucide-react";

const pillars = [
  {
    icon: Database,
    title: "Data & Audience",
    desc: "Upload approved business contacts, map fields, review record quality and work from clean segments in the Data Vault.",
    highlight: false,
  },
  {
    icon: Sparkles,
    title: "Create the Campaign",
    desc: "One brief becomes a complete campaign pack: strategy, landing & offer copy, email sequence, press release, social pack, video scripts, paid ads and lead capture.",
    highlight: true,
  },
  {
    icon: Send,
    title: "Activate Across Channels",
    desc: "Send approved email through governed sending, hand social drafts to your own Buffer account, and use the other assets in the channels you choose.",
    highlight: false,
  },
  {
    icon: Inbox,
    title: "Replies & Pipeline",
    desc: "Triage replies by intent, record follow-ups, hand off meetings and track early opportunities in the Outcome Funnel.",
    highlight: false,
  },
];

const CorePillars = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">What Velocity Vision does</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          Everything your campaign needs, connected.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className={
              pillar.highlight
                ? "relative rounded-2xl p-6 bg-accent-warm text-accent-foreground shadow-elevated overflow-hidden"
                : "rounded-2xl p-6 bg-card border border-border/50 shadow-card hover:border-accent/40 transition-colors"
            }
          >
            {pillar.highlight && (
              <div aria-hidden className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl" />
            )}
            <div
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                pillar.highlight ? "bg-white/20" : "bg-accent/10"
              }`}
            >
              <pillar.icon size={22} className={pillar.highlight ? "text-accent-foreground" : "text-accent"} />
            </div>
            <h3 className={`relative font-display font-semibold text-lg mb-2 ${pillar.highlight ? "" : "text-foreground"}`}>
              {pillar.title}
            </h3>
            <p className={`relative text-sm leading-relaxed ${pillar.highlight ? "text-accent-foreground/90" : "text-muted-foreground"}`}>
              {pillar.desc}
            </p>
            {pillar.highlight && (
              <p className="relative mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded-full px-2.5 py-1">
                <Sparkles size={11} />
                8 editable asset types from one brief
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CorePillars;
