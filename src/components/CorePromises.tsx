import { motion } from "framer-motion";
import { ShieldCheck, Layers, GitBranch } from "lucide-react";

const promises = [
  { icon: Layers, title: "Data to action in one place", desc: "Upload authorized business contacts, review workspace quality flags, build customer-reviewed segments and prepare campaign leads without treating a data label as legal approval." },
  { icon: ShieldCheck, title: "Governed sending by default", desc: "On eligible paid plans, mailbox readiness, tiered daily ceilings, unsubscribe handling and safety checks are applied again before a real send." },
  { icon: GitBranch, title: "Follow-up and pipeline, not just sends", desc: "Work recorded replies, follow-up states and customer-selected early opportunities inside the same workspace." },
];

const CorePromises = () => (
  <section className="section-padding bg-secondary"><div className="max-w-7xl mx-auto"><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{promises.map((p, i) => <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-card border border-border/50 rounded-xl p-8 shadow-card"><div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5"><p.icon className="text-accent" size={24} /></div><h3 className="text-xl font-display font-semibold text-foreground mb-3">{p.title}</h3><p className="text-muted-foreground leading-relaxed">{p.desc}</p></motion.div>)}</div></div></section>
);

export default CorePromises;
