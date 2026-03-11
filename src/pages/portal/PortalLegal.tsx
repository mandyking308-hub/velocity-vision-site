import { Link } from "react-router-dom";
import { FileText, Shield, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const legalDocs = [
  { title: "Platform Terms of Service", path: "/legal/terms-of-service", description: "Defines the core rules governing use of the platform." },
  { title: "Client Services Agreement", path: "/legal/client-services-agreement", description: "Defines the contractual relationship with paying customers." },
  { title: "Data Processing Agreement", path: "/legal/data-processing-agreement", description: "How personal data is processed and protected." },
  { title: "Privacy Policy", path: "/legal/privacy-policy", description: "How personal information is collected, used, and stored." },
  { title: "Acceptable Use Policy", path: "/legal/acceptable-use-policy", description: "Permitted and prohibited uses of the platform." },
  { title: "Marketing Compliance Policy", path: "/legal/marketing-compliance-policy", description: "Responsibilities for lawful marketing campaigns." },
  { title: "Cookie Policy", path: "/legal/cookie-policy", description: "How cookies and tracking technologies are used." },
  { title: "Platform Security Policy", path: "/legal/platform-security-policy", description: "Measures to protect customer data and platform integrity." },
  { title: "Service Level Agreement", path: "/legal/service-level-agreement", description: "Platform availability and support response standards." },
];

const PortalLegal = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
        <Shield size={24} className="text-accent" /> Legal Documents
      </h1>
      <p className="text-muted-foreground text-sm mt-1">
        Access all legal policies and agreements that govern platform use.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {legalDocs.map((doc, i) => (
        <motion.div key={doc.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Link
            to={doc.path}
            target="_blank"
            className="group flex items-start gap-3 p-4 bg-card border border-border/50 rounded-xl shadow-card hover:border-accent/30 hover:shadow-elevated transition-all"
          >
            <FileText size={18} className="text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground/40 shrink-0 mt-0.5" />
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default PortalLegal;
