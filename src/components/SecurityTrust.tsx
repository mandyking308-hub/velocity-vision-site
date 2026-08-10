import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  FileCheck,
  Server,
  UserCheck,
  ScanSearch,
  Gauge,
} from "lucide-react";

const controls = [
  {
    icon: Server,
    title: "Managed cloud infrastructure",
    body: "Authentication, database, storage and backend functions run on managed cloud services.",
  },
  {
    icon: UserCheck,
    title: "Authenticated access",
    body: "Protected product routes require sign-in, with permissions applied to customer and internal functions.",
  },
  {
    icon: Database,
    title: "Logical workspace separation",
    body: "Account and workspace identifiers keep customer and client data logically separated.",
  },
  {
    icon: ShieldCheck,
    title: "Customer-controlled activation",
    body: "Sender verification, record review and plan limits sit ahead of the authorized user's final decision.",
  },
  {
    icon: Gauge,
    title: "Rate limiting & abuse controls",
    body: "Public routes and activation workflows use validation and limits appropriate to their function.",
  },
  {
    icon: FileCheck,
    title: "Published legal stack",
    body: "Privacy Policy, Data Processing Agreement, Subprocessor List and security terms are published in the Legal Centre.",
  },
  {
    icon: ScanSearch,
    title: "Code & configuration checks",
    body: "Repository checks and release reviews catch missing routes, unsafe claims and configuration regressions.",
  },
];

const SecurityTrust = () => (
  <section className="section-padding bg-background relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mb-10 md:mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2">
          <ShieldCheck size={14} /> Security and governance
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
          Documented controls around access, data and activation
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {controls.map((control, index) => (
          <motion.div
            key={control.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-card hover:border-accent/40 hover:shadow-elevated transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <control.icon size={20} className="text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-2 leading-snug">
              {control.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{control.body}</p>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 md:mt-10 text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
        No internet service can guarantee absolute security or compliance. Customers remain responsible for their users, credentials, data, connected services, lawful basis, recipients, content, suppression handling, activation decisions and exported records.
      </p>
    </div>
  </section>
);

export default SecurityTrust;
