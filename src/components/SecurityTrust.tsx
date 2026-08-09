import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  FileCheck,
  Server,
  KeyRound,
  UserCheck,
  ScanSearch,
  Scale,
  Gauge,
} from "lucide-react";

const controls = [
  {
    icon: Server,
    title: "Managed Cloud Infrastructure",
    body: "Authentication, database, storage and backend functions are provided through managed cloud services.",
  },
  {
    icon: Gauge,
    title: "Rate Limiting and Abuse Controls",
    body: "Public routes and activation workflows use validation, limits and abuse-prevention controls appropriate to their function.",
  },
  {
    icon: KeyRound,
    title: "Access-Controlled Secret Configuration",
    body: "Operational credentials and service configuration are kept outside public page content and restricted to authorized system access.",
  },
  {
    icon: Database,
    title: "Logical Workspace Separation",
    body: "Customer and client workspaces use account and workspace identifiers to support logical data separation.",
  },
  {
    icon: UserCheck,
    title: "Authenticated Access",
    body: "Protected product routes require authenticated access, with permissions applied to customer and internal workspace functions.",
  },
  {
    icon: ScanSearch,
    title: "Code and Configuration Checks",
    body: "Repository checks and release reviews help identify missing routes, unsafe public claims and configuration regressions before publication.",
  },
  {
    icon: FileCheck,
    title: "Data Processing Documents",
    body: "The Legal Centre publishes a Data Processing Agreement, Privacy Policy and Subprocessor List for customer review.",
  },
  {
    icon: Scale,
    title: "Privacy and Rights Routes",
    body: "Published privacy terms explain data handling, rights requests, complaints, subprocessors and customer responsibilities.",
  },
  {
    icon: ShieldCheck,
    title: "Customer-Controlled Activation",
    body: "Sender verification, record review and plan limits are separated from the authorized user's final activation decision.",
  },
];

const SecurityTrust = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mb-10 md:mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2">
          <ShieldCheck size={14} /> Security and governance
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-5">
          Documented controls around access, data and activation
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Velocity Vision uses managed cloud services, authenticated product routes, logical workspace separation, validation, rate limiting and a published legal-document stack covering privacy, data processing, acceptable use, marketing compliance, cookies, security and service levels.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {controls.map((control, index) => (
          <motion.div
            key={control.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: (index % 3) * 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-card hover:border-accent/40 hover:shadow-elevated transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <control.icon size={20} className="text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-2 leading-snug">
              {control.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {control.body}
            </p>
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
