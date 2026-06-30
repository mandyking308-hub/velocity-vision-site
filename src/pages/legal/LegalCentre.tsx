import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Shield, Scale } from "lucide-react";

const legalDocs = [
  { title: "Platform Terms of Service", path: "/legal/terms-of-service", description: "The core rules for using the Velocity Vision website, app, workspaces, data tools, activation controls and generated outputs." },
  { title: "Customer Agreement", path: "/legal/client-services-agreement", description: "The commercial subscription, billing, credits, plan, agency-workspace and customer-use agreement for paying customers." },
  { title: "Data Processing Agreement", path: "/legal/data-processing-agreement", description: "Processor terms for customer-uploaded personal data, including processing scope, subprocessors, transfers, security, deletion and audit support." },
  { title: "Privacy Policy", path: "/legal/privacy-policy", description: "How Velocity Vision handles website, account, billing, support, usage and customer-uploaded data across the platform." },
  { title: "Acceptable Use Policy", path: "/legal/acceptable-use-policy", description: "Rules that prohibit unlawful data use, spam, misuse, platform abuse, security evasion and harmful or restricted content." },
  { title: "Marketing Compliance Policy", path: "/legal/marketing-compliance-policy", description: "Customer responsibilities for lawful outreach, sender identity, consent, opt-outs, suppression lists, agencies and jurisdiction-specific rules." },
  { title: "Cookie Policy", path: "/legal/cookie-policy", description: "How cookies and similar technologies are used for essential functions, preferences, analytics, performance and lawful marketing." },
  { title: "Platform Security Policy", path: "/legal/platform-security-policy", description: "Shared security responsibilities, platform safeguards, sender governance, incident response and responsible reporting." },
  { title: "Service Level Agreement", path: "/legal/service-level-agreement", description: "Operational service targets for availability, maintenance, support response and exclusions for the self-serve workspace." },
];

const LegalCentre = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <Scale size={28} className="text-accent" />
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Legal Centre</h1>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-4 max-w-3xl">
            This Legal Centre contains the terms, policies and agreements that govern use of the Velocity Vision software platform. Together, these documents cover workspace access, customer responsibilities, Data Vault processing, safe activation, outreach compliance, privacy, security, billing, service standards and agency workspace use.
          </p>
          <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50 text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Operating entity:</strong> Global Solutions Management LLC — incorporated in the State of Delaware, United States — operator of the Velocity Vision platform.</p>
            <p><strong className="text-foreground">Document stack:</strong> The Platform Terms govern general use. The Customer Agreement governs paid plans, credits and subscriptions. The Data Processing Agreement governs customer-uploaded personal data. Product policies apply to all customers and workspaces.</p>
            <p><strong className="text-foreground">Review note:</strong> These documents are a hardened platform draft and should be reviewed by qualified counsel before high-volume paid rollout or enterprise contracting.</p>
          </div>
        </motion.div>

        <div className="mt-12 space-y-4">
          {legalDocs.map((doc, i) => (
            <motion.div key={doc.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                to={doc.path}
                className="group flex items-start gap-4 p-5 bg-card border border-border/50 rounded-xl shadow-card hover:border-accent/30 hover:shadow-elevated transition-all"
              >
                <div className="mt-0.5 shrink-0">
                  <FileText size={20} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                </div>
                <Shield size={16} className="text-muted-foreground/40 shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default LegalCentre;
