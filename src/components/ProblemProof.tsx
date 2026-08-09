import { motion } from "framer-motion";
import { Database, Mail, Inbox, GitBranch } from "lucide-react";

const workflowChanges = [
  {
    title: "One operating record",
    desc: "Customer-provided data, editable drafts, follow-up records and early opportunity records can remain connected instead of being split across unrelated tools.",
  },
  {
    title: "Review before activation",
    desc: "Customers review data source, record status, sender configuration, audience selection and generated drafts before an authorized-user activation decision.",
  },
  {
    title: "Recorded next actions",
    desc: "Reply states, follow-up actions and opportunity records remain visible inside the workspace for customer-managed review.",
  },
];

const pains = [
  {
    icon: Database,
    title: "Fragmented contact records",
    desc: "Business records may be spread across spreadsheets, exports and duplicated files without a consistent review status.",
  },
  {
    icon: Mail,
    title: "Draft creation across separate tools",
    desc: "Email, social, press and video materials may be prepared in different documents and systems without a shared approval workflow.",
  },
  {
    icon: Inbox,
    title: "Follow-up held only in inboxes",
    desc: "Reply and next-action information can become difficult to review when it exists only in individual inboxes or informal notes.",
  },
  {
    icon: GitBranch,
    title: "Early opportunities recorded inconsistently",
    desc: "Potential opportunities may be tracked in separate spreadsheets, notes or partial CRM records without a consistent operating view.",
  },
];

const ProblemProof = () => (
  <section className="section-padding bg-splash-pink relative overflow-hidden">
    <div aria-hidden className="blob blob-blue w-80 h-80 -top-20 -left-24 animate-floaty" />
    <div aria-hidden className="blob blob-pink w-72 h-72 -bottom-28 -right-16 animate-drifty" />
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          The operational problem
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Data review, draft creation, activation and follow-up often sit in separate systems
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Velocity Vision is designed to organize those customer-controlled activities in one self-serve software workspace without taking over the customer's data, content, sender or activation decisions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {pains.map((pain, index) => (
          <motion.div
            key={pain.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <pain.icon className="text-accent" size={20} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              {pain.title}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {pain.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {workflowChanges.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-secondary/60 border border-border/50 rounded-xl p-7"
          >
            <p className="text-xl md:text-2xl font-display font-bold text-accent mb-2">
              {item.title}
            </p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {item.desc}
            </p>
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
          A structured workspace, not a managed campaign service
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Customers provide authorized data, review software flags, edit generated drafts, verify their sender, approve activation and manage follow-up. Velocity Vision does not guarantee legal compliance, deliverability, replies, sales, pipeline or revenue.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ProblemProof;
