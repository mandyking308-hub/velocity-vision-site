import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Database,
  FileCheck,
  Server,
  KeyRound,
  Globe2,
  UserCheck,
  ScanSearch,
  Scale,
} from "lucide-react";

const badges = [
  {
    icon: Server,
    title: "Secure Cloud Infrastructure",
    body: "Built on managed cloud infrastructure for authentication, database, storage and backend services.",
  },
  {
    icon: ShieldCheck,
    title: "WAF-Style Protection",
    body: "Infrastructure-level protections support network safety, abuse prevention and adaptive rate limiting.",
  },
  {
    icon: KeyRound,
    title: "Encrypted Secret Handling",
    body: "Secrets and API credentials are handled through access-controlled encrypted secret management.",
  },
  {
    icon: Database,
    title: "Workspace Separation",
    body: "Customer workspaces are logically separated to support account-level data boundaries.",
  },
  {
    icon: UserCheck,
    title: "Role-Based Access",
    body: "Access is controlled through authentication, user permissions and role-based access patterns.",
  },
  {
    icon: ScanSearch,
    title: "Security Scanning",
    body: "Publishing and configuration checks help identify database, access-control and cloud misconfiguration risks.",
  },
  {
    icon: Globe2,
    title: "Regional Hosting Support",
    body: "Cloud infrastructure supports regional hosting options including EU, US and Australia where available.",
  },
  {
    icon: Lock,
    title: "No Customer Data Model Training",
    body: "Customer prompts, code and workspace data are not used to train platform AI models.",
  },
  {
    icon: FileCheck,
    title: "DPA Available",
    body: "A Data Processing Agreement, Privacy Policy and Subprocessor List support customer data governance.",
  },
  {
    icon: Scale,
    title: "GDPR / UK GDPR Privacy Framework",
    body: "Velocity Vision operates with GDPR / UK GDPR privacy terms, data processing terms and privacy request routes.",
  },
];

const SecurityTrust = () => (
  <section className="bg-background border-t border-border px-6 md:px-12 lg:px-20 py-16 md:py-20 lg:py-24">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mb-10 md:mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3 inline-flex items-center gap-2">
          <ShieldCheck size={14} /> Security &amp; Trust
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-5">
          Safeguards built into the workspace
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Velocity Vision is built on managed cloud infrastructure with authentication controls, workspace separation, encrypted secret handling, security scanning, WAF-style protections, regional hosting support and a live legal document stack covering privacy, data processing, acceptable use, marketing compliance, cookies, security and service levels.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {badges.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: (i % 5) * 0.05 }}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-card hover:border-accent/40 hover:shadow-elevated transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <b.icon size={20} className="text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-sm md:text-base mb-2 leading-snug">
              {b.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 md:mt-10 text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
        Security and compliance controls support safer use of the platform. Customers remain responsible for their own data, users, connected services, lawful basis, outreach decisions and exported data.
      </p>
    </div>
  </section>
);

export default SecurityTrust;
