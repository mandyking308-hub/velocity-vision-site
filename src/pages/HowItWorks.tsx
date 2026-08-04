import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Upload authorised business data",
    desc: "Import CSV or spreadsheet records and map the fields needed for the customer's workspace.",
  },
  {
    n: "02",
    title: "Review data-quality flags",
    desc: "Surface duplicates, missing fields and records requiring review. Software flags are not legal approval.",
  },
  {
    n: "03",
    title: "Create a customer-reviewed segment",
    desc: "Filter and save records selected by the customer after reviewing source, permissions, suppression and suitability.",
  },
  {
    n: "04",
    title: "Connect and verify the customer's sender",
    desc: "Configure the authorised mailbox or sender route and complete the applicable verification steps.",
  },
  {
    n: "05",
    title: "Prepare editable AI-assisted drafts",
    desc: "Generate email, social, press and video drafts from a customer brief. Every output remains editable.",
  },
  {
    n: "06",
    title: "Set timing and cadence",
    desc: "Configure one-off or recurring timing subject to the customer's plan, provider rules and activation controls.",
  },
  {
    n: "07",
    title: "Review activation controls",
    desc: "Apply plan limits and record controls, then require an authorised-user decision before activation.",
  },
  {
    n: "08",
    title: "Record follow-up activity",
    desc: "Use reply states, next actions and optional AI-assisted drafts while keeping every send under customer control.",
  },
  {
    n: "09",
    title: "Create early opportunity records",
    desc: "Move customer-selected warm contacts into opportunity records with stage, value and owner fields.",
  },
  {
    n: "10",
    title: "Review recorded activity",
    desc: "Summarise workspace activity and decide whether a later workflow should be reused, edited, paused or discontinued.",
  },
];

const outputs = [
  "Data Vault",
  "Quality and review flags",
  "Sender verification",
  "Editable email drafts",
  "Editable social drafts",
  "Editable press drafts",
  "Editable video drafts",
  "Cadence settings",
  "Follow-up records",
  "Early opportunity records",
  "Automated activity summary",
];

const HowItWorks = () => (
  <>
    <SEO
      title="How it works — Customer-controlled workflow | Velocity Vision"
      description="The Velocity Vision workflow for customer-provided business data, record review, editable AI-assisted drafts, sender verification, authorised activation, follow-up records and early opportunity administration."
      path="/how-it-works"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              How it works
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              AI-assisted drafts with customer-controlled activation
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">
              Velocity Vision separates data review, draft preparation, sender verification, activation approval, follow-up records and early opportunity administration.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">
              Velocity Vision does not scrape contacts, sell lists, provide managed campaigns, send automatically or guarantee compliance, deliverability, replies, sales, pipeline or revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Start Free Preview <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/pricing">Review pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap">
        <div className="panel-pink">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  The workflow
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Ten documented steps from upload to activity review
                </h2>
                <p className="text-lg opacity-90">
                  The customer remains responsible for data source, lawful basis, recipients, content, sender identity, suppression handling and every activation decision.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                  >
                    <p className="text-accent font-display font-bold text-2xl mb-3">
                      {step.n}
                    </p>
                    <h3 className="font-display font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed opacity-90">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="panel-wrap">
        <div className="panel-blue">
          <section className="section-padding">
            <div className="max-w-5xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  Product outputs and records
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Editable drafts and operational records in one workspace
                </h2>
                <p className="text-lg opacity-90">
                  Outputs remain drafts until customer review. Recorded activity describes use of the workspace and is not a promised commercial result.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {outputs.map((output) => (
                  <div
                    key={output}
                    className="flex items-center gap-2 bg-white border border-white/40 rounded-lg px-4 py-3 shadow-card text-foreground"
                  >
                    <Check className="text-accent shrink-0" size={16} />
                    <span className="text-sm font-medium">{output}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="section-padding bg-hero">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Review the product before paid activation
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-6">
            Free Preview has no live sending. Paid activation follows onboarding, applicable checks and the terms shown before purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Start Free Preview <ArrowRight size={16} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/legal">Review legal documents</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <CampaignChannelsStrip variant="compact" />
    <Footer />
  </>
);

export default HowItWorks;
