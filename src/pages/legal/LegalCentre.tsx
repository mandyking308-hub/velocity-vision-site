import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Shield, Scale } from "lucide-react";

const legalDocs = [
  { title: "Platform Terms of Service", path: "/legal/terms-of-service", description: "The core rules governing use of the Velocity Vision software platform and website." },
  { title: "Customer Agreement", path: "/legal/client-services-agreement", description: "The commercial agreement between Velocity Vision and paying platform customers." },
  { title: "Data Processing Agreement", path: "/legal/data-processing-agreement", description: "How personal data uploaded to or processed by the platform is handled under applicable data-protection laws." },
  { title: "Privacy Policy", path: "/legal/privacy-policy", description: "How personal information about website visitors and platform users is collected, used, and stored." },
  { title: "Acceptable Use Policy", path: "/legal/acceptable-use-policy", description: "What customers may and may not do when using the platform, including outreach conduct." },
  { title: "Marketing Compliance Policy", path: "/legal/marketing-compliance-policy", description: "Customer responsibilities for lawful outreach, consent, and contact-data usage inside the platform." },
  { title: "Cookie Policy", path: "/legal/cookie-policy", description: "How cookies and similar tracking technologies are used on the public website." },
  { title: "Platform Security Policy", path: "/legal/platform-security-policy", description: "The measures used to protect customer data, sender governance, and platform integrity." },
  { title: "Service Level Agreement", path: "/legal/service-level-agreement", description: "Expected platform availability and support response standards." },
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
            This Legal Centre is the home for the terms, policies, and agreements that govern use of the Velocity Vision software platform. Together, these documents cover platform use, customer responsibilities, data processing, privacy, security, marketing compliance, and service standards.
          </p>
          <div className="mt-4 p-4 bg-muted/40 rounded-xl border border-border/50 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Operating entity:</strong> Global Solutions Management LLC — incorporated in the State of Delaware, United States — operator of the Velocity Vision platform.</p>
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
