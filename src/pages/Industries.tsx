import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Cpu,
  Briefcase,
  Building2,
  GraduationCap,
  HeartHandshake,
  Boxes,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const industries = [
  {
    icon: Cpu,
    title: "Software and technology",
    need: "Organize customer-provided prospect and partner data, prepare launch materials and manage structured follow-up around a defined product proposition.",
    use: "Teams can create editable outreach drafts, review safe segments, approve activation and move selected responses into an early pipeline.",
    safeguard: "No scraped databases, automatic sending or guaranteed pipeline claims.",
  },
  {
    icon: Briefcase,
    title: "Professional services",
    need: "Maintain a clear commercial workflow for relationship-led business development without relying on disconnected spreadsheets and inbox reminders.",
    use: "Firms can organize lawful business contacts, prepare customer-reviewed messages and track follow-up and opportunities in one workspace.",
    safeguard: "The platform does not provide professional advice, prospecting services or managed campaigns.",
  },
  {
    icon: Building2,
    title: "Agencies and fractional teams",
    need: "Keep each client's data, drafts, activation controls and pipeline activity separated while maintaining account-level visibility.",
    use: "Agency Workspace provides isolated client workspaces, pooled Campaign Credits, account-wide send-usage visibility and the plan's daily send ceiling.",
    safeguard: "Each agency remains responsible for client authority, lawful data, sender identity and every activation decision.",
  },
  {
    icon: GraduationCap,
    title: "Education and training businesses",
    need: "Structure business-to-business outreach to organizations, partners and professional audiences using data the customer is authorized to use.",
    use: "Teams can prepare editable campaign packs, manage approved follow-up and track early commercial opportunities.",
    safeguard: "Velocity Vision is not intended for outreach to children or for processing student special-category data.",
  },
  {
    icon: HeartHandshake,
    title: "Membership and nonprofit organizations",
    need: "Coordinate lawful partner, sponsor, supplier and organizational outreach without turning the platform into a consumer messaging database.",
    use: "Organizations can review their own records, create draft materials and manage approved follow-up through a governed workflow.",
    safeguard: "Sensitive beneficiary, health, safeguarding or donor-payment data should not be uploaded unless expressly permitted and properly protected.",
  },
  {
    icon: Boxes,
    title: "B2B product and service companies",
    need: "Bring data preparation, outreach drafting, follow-up and early pipeline into a repeatable internal operating process.",
    use: "Customers can upload their own business data, prepare assets, approve safe segments and retain control of all sending and publishing decisions.",
    safeguard: "Velocity Vision does not promise replies, sales, deliverability, compliance or any particular commercial outcome.",
  },
];

const Industries = () => (
  <>
    <SEO
      title="Business Use Cases by Industry — Velocity Vision"
      description="See how businesses, agencies and organizations can use the self-serve Velocity Vision workspace for customer-provided data, AI-assisted drafts, governed activation, follow-up and early pipeline."
      path="/industries"
    />
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Business use cases
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-4xl">
              A governed software workflow for different B2B operating models
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-3xl leading-relaxed">
              Velocity Vision is a self-serve software workspace. The examples below describe how different organizations may configure the same product functionality; they are not managed services, customer case studies or performance claims.
            </p>
            <p className="text-primary-foreground/70 text-sm max-w-3xl mt-5 leading-relaxed">
              Customers supply their own lawfully obtained business data, connect their own sender and remain responsible for permissions, content review, suppression handling and every activation decision.
            </p>
          </motion.div>
        </div>
      </section>

      {industries.map((industry, index) => (
        <section
          key={industry.title}
          className={`section-padding ${index % 2 === 0 ? "bg-background" : "bg-secondary"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                  <industry.icon className="text-accent" size={22} />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {industry.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-2">
                    Typical operational need
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {industry.need}
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-2">
                    Software use
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {industry.use}
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-accent text-sm uppercase tracking-wider mb-2">
                    Important safeguard
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {industry.safeguard}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      <section className="section-padding bg-hero text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-5">
            The same product controls apply in every sector
          </h2>
          <p className="text-primary-foreground/75 mb-8">
            Review the platform features, published pricing, acceptable-use rules and marketing-compliance requirements before choosing a plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/features">
                Review features <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Industries;
