import { motion } from "framer-motion";
import { Database, Mail, Inbox, GitBranch } from "lucide-react";

const stats = [
  { stat: "6+", desc: "tools the average lean team stitches together to run outreach, follow-up and pipeline" },
  { stat: "40%+", desc: "of imported B2B contact data is duplicated, invalid or unsafe to send without review" },
  { stat: "70%", desc: "of warm conversations go cold because nobody owns follow-up across systems" },
];

const pains = [
  { icon: Database, title: "Messy contact data", desc: "Spreadsheets full of duplicates, missing emails and unsafe records — no clear view of who you can actually contact." },
  { icon: Mail, title: "Outreach takes forever to build", desc: "Email sequences, social posts and press releases written from scratch each campaign — across docs, tools and freelancers." },
  { icon: Inbox, title: "Follow-up gets dropped", desc: "Follow-up tasks sit in inboxes, snooze never happens, warm contacts cool down before anyone moves them forward." },
  { icon: GitBranch, title: "Pipeline lives nowhere", desc: "Opportunities tracked in someone's head or a half-built CRM. Nobody knows what's actually live." },
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
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Marketing-led outreach, follow-up and early pipeline are scattered across too many tools
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Founders, agencies and lean growth teams hit the same wall: data in one place, outreach assets in another, follow-up tasks in inboxes, early pipeline in someone's head. Marketing-led growth breaks at the joins.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {pains.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <p.icon className="text-accent" size={20} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{p.title}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.stat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-secondary/60 border border-border/50 rounded-xl p-7"
          >
            <p className="text-4xl md:text-5xl font-display font-bold text-accent mb-2">{s.stat}</p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{s.desc}</p>
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
          Velocity Vision pulls marketing-led outreach into one workspace.
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Data in. Quality reviewed. Outreach assets generated — email sequences, social media, press releases. Sending governed. Follow-up worked. Early pipeline moved. Without juggling six apps.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ProblemProof;
