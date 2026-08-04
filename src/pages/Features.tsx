import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const groups = [
  {
    label: "Data Vault",
    features: [
      {
        title: "Upload and field mapping",
        value: "Upload customer-authorised CSV or spreadsheet records, map fields and reuse saved mapping structures.",
      },
      {
        title: "Companies and contacts",
        value: "Organise business records and relationships inside a structured workspace rather than a flat spreadsheet copy.",
      },
      {
        title: "Saved segments",
        value: "Create customer-reviewed segments for later use without treating segmentation as legal or compliance approval.",
      },
    ],
  },
  {
    label: "Record Review",
    features: [
      {
        title: "Duplicate detection",
        value: "Surface duplicated or conflicting records for customer review before any activation decision.",
      },
      {
        title: "Completeness and risk flags",
        value: "Flag missing fields, invalid formats and records requiring additional review.",
      },
      {
        title: "Review-status filters",
        value: "Filter records by review status. Software flags support customer assessment and are not legal approval.",
      },
    ],
  },
  {
    label: "Governed Activation Controls",
    features: [
      {
        title: "Sender verification",
        value: "Require the customer's sender connection and applicable verification steps before activation.",
      },
      {
        title: "Plan-level limits",
        value: "Apply per-workspace or pooled account-level limits according to the applicable paid plan.",
      },
      {
        title: "Authorised-user approval",
        value: "Keep activation separate from draft generation and require an authorised-user decision.",
      },
    ],
  },
  {
    label: "Editable AI-Assisted Drafts",
    features: [
      {
        title: "Email drafts",
        value: "Prepare editable multi-step email and follow-up drafts from a customer brief.",
      },
      {
        title: "Social drafts",
        value: "Generate editable posts, hooks and platform variants for customer review before scheduling or publishing.",
      },
      {
        title: "Press and video drafts",
        value: "Prepare announcement drafts, video scripts, shot-list ideas and captions for customer review.",
      },
    ],
  },
  {
    label: "Cadence and Activity Settings",
    features: [
      {
        title: "One-off and recurring settings",
        value: "Configure one-off, weekly, monthly or custom timing subject to the customer's plan and activation controls.",
      },
      {
        title: "Draft refresh choices",
        value: "Choose whether reviewed draft structures are reused, regenerated or edited for a later workflow.",
      },
      {
        title: "Visible lifecycle states",
        value: "Record draft, scheduled, active, paused and expired states for customer-managed workflows.",
      },
    ],
  },
  {
    label: "Follow-Up Records",
    features: [
      {
        title: "Action queue",
        value: "Record reply and follow-up actions, ownership and next steps in one customer-controlled queue.",
      },
      {
        title: "Follow-up states and snooze",
        value: "Record replied, snoozed, warm, dormant and other operational states selected by the customer.",
      },
      {
        title: "Per-contact history",
        value: "Review recorded activity, last touch, follow-up state and next action for each contact.",
      },
    ],
  },
  {
    label: "Early Opportunity Records",
    features: [
      {
        title: "Create an opportunity record",
        value: "Move a customer-selected warm contact into an early opportunity record with stage, value and owner fields.",
      },
      {
        title: "Inactivity reminders",
        value: "Surface opportunity records with no recent recorded activity for customer review.",
      },
      {
        title: "Export options",
        value: "Export records when a broader CRM or sales process is required.",
      },
    ],
  },
  {
    label: "Billing and Campaign Credits",
    features: [
      {
        title: "Published plan pricing",
        value: "Review one-off and monthly prices, access periods and included Campaign Credits before purchase.",
      },
      {
        title: "Credit requests",
        value: "Request additional Campaign Credits through the published onboarding or contact route subject to the applicable terms.",
      },
      {
        title: "Currency and tax disclosure",
        value: "The final currency, tax treatment, payment provider and product terms are confirmed before payment.",
      },
    ],
  },
  {
    label: "Agency Workspaces",
    features: [
      {
        title: "Isolated client workspaces",
        value: "Keep authorised client data, sender settings, drafts and activation decisions separated by workspace.",
      },
      {
        title: "Pooled credits and limits",
        value: "Use pooled Campaign Credits and account-level governance under the Agency Workspace plan.",
      },
      {
        title: "Cross-workspace activity view",
        value: "Review recorded activation, follow-up and early opportunity information across the agency account.",
      },
    ],
  },
];

const aiFeatures = [
  {
    title: "AI-assisted draft preparation",
    value: "Email, social, press, video and follow-up outputs remain editable drafts until reviewed by the customer.",
  },
  {
    title: "AI-supported record review",
    value: "Software can surface duplicates, missing fields and records requiring review. The customer decides how records are classified and used.",
  },
  {
    title: "AI-assisted template structures",
    value: "Customers can adapt generated structures to their own proposition, tone, recipients and legal requirements.",
  },
  {
    title: "AI-supported follow-up drafts",
    value: "Suggested next-step copy remains a draft and is not sent without customer review and approval.",
  },
  {
    title: "Separate activation controls",
    value: "Draft generation does not activate or send content. Sender verification, segment review and authorised-user approval remain separate steps.",
  },
  {
    title: "No guaranteed outcomes",
    value: "Velocity Vision does not guarantee compliance, deliverability, replies, sales, pipeline, revenue or suitability for a particular campaign.",
  },
];

const Features = () => (
  <>
    <SEO
      title="Features — Customer-controlled B2B software | Velocity Vision"
      description="Features for customer-provided data, record review, editable AI-assisted drafts, governed activation controls, follow-up records, early opportunity administration and agency workspaces."
      path="/features"
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
              Features
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              A self-serve workspace with clear customer control
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">
              Organise authorised business data, prepare editable AI-assisted drafts, verify the customer's sender, approve activation and record follow-up and early opportunity activity.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">
              Velocity Vision does not scrape contacts, sell lists, provide managed campaigns, send automatically or guarantee legal compliance, deliverability, replies, sales, pipeline or revenue.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Start Free Preview <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap">
        <div className="panel-blue">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  Workspace functions
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Product functions from data review to operational records
                </h2>
                <p className="text-lg opacity-90">
                  Each function supports a customer-controlled workflow and remains subject to the applicable plan, legal documents and third-party provider requirements.
                </p>
              </div>

              {groups.map((group, index) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                >
                  <p className="font-semibold text-sm uppercase tracking-widest mb-4 opacity-90">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {group.features.map((feature) => (
                      <div
                        key={feature.title}
                        className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                      >
                        <h3 className="font-display font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed opacity-90">
                          {feature.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="panel-wrap">
        <div className="panel-pink">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  AI-assisted functions
                </p>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                  Draft assistance without autonomous sending
                </h2>
                <p className="text-lg opacity-90 leading-relaxed">
                  AI supports drafting and record review. Customers remain responsible for data source, recipients, lawful basis, content, suppression handling, sender identity and every activation decision.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                  >
                    <h3 className="font-display font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed opacity-90">
                      {feature.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="section-padding bg-hero text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5">
            Review the plans and product terms before purchase
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8">
            Published pricing explains the billing cadence, access period, included Campaign Credits, activation requirements and refund route.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/pricing">
                Review pricing <ArrowRight size={18} />
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

export default Features;
