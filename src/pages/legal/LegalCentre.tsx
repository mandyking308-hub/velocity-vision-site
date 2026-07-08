import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Shield, Scale } from "lucide-react";
import TrustStrip from "@/components/TrustStrip";

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
  { title: "Subprocessor List", path: "/legal/subprocessors", description: "Third-party providers Velocity Vision may use to host, run, secure, support and improve the platform, and how updates are communicated." },
];

const LegalCentre = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Legal Centre — Velocity Vision</title>
      <meta name="description" content="Terms, policies and agreements governing use of the Velocity Vision platform, including privacy, DPA, acceptable use, marketing compliance, security and SLA." />
    </Helmet>
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-3 mb-4">
              <Scale size={28} className="text-accent" />
              <p className="text-accent font-semibold text-sm uppercase tracking-widest">Legal Centre</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Terms, policies and agreements
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-3xl">
              The documents that govern use of the Velocity Vision software platform — workspace access, customer responsibilities, Data Vault processing, safe activation, outreach compliance, privacy, security, billing, service standards and agency workspace use.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap"><div className="panel-blue">
      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-white/40 shadow-card p-6 text-foreground/85 text-sm space-y-2 mb-10">
            <p><strong className="text-foreground">Operating entity:</strong> Global Solutions Management LLC — incorporated in the State of Delaware, United States — operator of the Velocity Vision platform.</p>
            <p><strong className="text-foreground">Document stack:</strong> The Platform Terms govern general use. The Customer Agreement governs paid plans, credits and subscriptions. The Data Processing Agreement governs customer-uploaded personal data. Product policies apply to all customers and workspaces.</p>
            <p><strong className="text-foreground">Legal status:</strong> These documents govern access to and use of the Velocity Vision software platform from their stated effective dates. They form part of the Velocity Vision legal document stack and apply according to their stated scope, incorporated terms and applicable plan or workspace use.</p>
            <p><strong className="text-foreground">Multilingual access:</strong> This Legal Centre may be viewed in multiple languages using automated translation. Automated translations are provided for convenience only. The English version controls if there is any conflict, ambiguity, inconsistency, error or difference between versions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legalDocs.map((doc, i) => (
              <motion.div key={doc.path} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link
                  to={doc.path}
                  className="group flex items-start gap-4 p-5 bg-white border border-white/40 rounded-xl shadow-card hover:shadow-elevated transition-all h-full text-foreground"
                >
                  <div className="mt-0.5 shrink-0">
                    <FileText size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold group-hover:text-accent transition-colors">{doc.title}</h3>
                    <p className="text-sm text-foreground/70 mt-1">{doc.description}</p>
                  </div>
                  <Shield size={16} className="text-foreground/30 shrink-0 mt-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div></div>

      <section className="section-padding bg-background">
        <div className="max-w-5xl mx-auto">
          <TrustStrip variant="legal" />
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default LegalCentre;
