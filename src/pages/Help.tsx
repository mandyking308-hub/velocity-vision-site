import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Getting started",
    items: [
      {
        q: "How do I start using Velocity Vision?",
        a: "Create a workspace, add customer-authorised business data, review the record flags, prepare editable drafts and explore the product controls. Free Preview has no live sending. Paid activation follows onboarding, applicable checks and the terms shown before purchase.",
      },
      {
        q: "Do I need perfectly formatted data before I start?",
        a: "No. You can upload structured CSV or spreadsheet records and map the available fields. The workspace can surface duplicates, missing fields, invalid formats and records requiring review. Those flags support customer assessment and are not legal approval.",
      },
      {
        q: "What is a sensible first test?",
        a: "Use a small set of records that your organisation is authorised to process. Review the source and suppression status, map the fields and generate draft content without enabling live sending.",
      },
    ],
  },
  {
    title: "Data Vault and record review",
    items: [
      {
        q: "What data can I upload?",
        a: "The Data Vault is intended for customer-authorised business records. Common fields include name, business email, company, role, location, source and customer-defined tags. Do not upload data you are not authorised to process or restricted sensitive data.",
      },
      {
        q: "What happens after upload?",
        a: "Records are mapped and can be checked for duplicates, missing fields, invalid formats and other issues requiring customer review. The customer decides whether a record should remain, be corrected, be suppressed or be excluded from activation.",
      },
      {
        q: "What do the record statuses mean?",
        a: "Statuses are operational labels for customer review. They do not confirm lawful basis, consent, recipient suitability, deliverability or legal compliance. Customers must maintain their own evidence and suppression records where required.",
      },
    ],
  },
  {
    title: "AI-assisted drafts and templates",
    items: [
      {
        q: "Are outputs AI-generated?",
        a: "AI can help prepare email, social, press, video and follow-up drafts and can support record review. Every output remains editable and must be reviewed by the customer. Velocity Vision does not guarantee compliance, deliverability, replies, sales, pipeline or revenue.",
      },
      {
        q: "What is a template?",
        a: "A template is a reusable product structure for customer-authorised records, editable drafts, timing settings, activation review and follow-up administration. It is not a prospect database, legal approval or guaranteed commercial method.",
      },
      {
        q: "Can I edit or regenerate an output?",
        a: "Yes. Customers can edit draft content or regenerate an individual draft element. No generated output is automatically sent or published.",
      },
    ],
  },
  {
    title: "Sender verification and activation",
    items: [
      {
        q: "Why is sender verification required?",
        a: "Sender verification helps confirm that the connected mailbox or domain is authorised for the workspace. It does not guarantee deliverability, inbox placement or legal compliance.",
      },
      {
        q: "What happens when records require review?",
        a: "The customer can correct, suppress or exclude records before activation. Plan limits and record controls are operational safeguards, while the authorised customer remains responsible for the final decision.",
      },
      {
        q: "Can activity be scheduled?",
        a: "Eligible paid plans may provide timing and cadence settings subject to onboarding, the connected provider, product configuration and applicable controls. Customers can review or pause settings through the available workspace functions.",
      },
    ],
  },
  {
    title: "Follow-up and early opportunity records",
    items: [
      {
        q: "Where do replies go?",
        a: "Replies use the connected mailbox route. The workspace can record follow-up states, next actions and customer-selected early opportunity records.",
      },
      {
        q: "What are follow-up states?",
        a: "Follow-up states are customer-selected operational labels such as replied, snoozed, warm or dormant. They organise activity and do not confirm sales intent or a guaranteed opportunity.",
      },
      {
        q: "When should an opportunity record be created?",
        a: "The customer decides when a contact should become an early opportunity record based on its own process and evidence. Velocity Vision does not qualify leads or promise that an opportunity will progress.",
      },
    ],
  },
  {
    title: "Plans, billing and Campaign Credits",
    items: [
      {
        q: "What plans are available?",
        a: "Free Preview, Starter, Growth and Agency Workspace are described on the Pricing page. Starter is one-off with 30 days of access. Growth and Agency Workspace renew monthly until cancelled.",
      },
      {
        q: "What happens when Campaign Credits run out?",
        a: "New AI-intensive generation pauses until additional credits are approved or the plan changes. Continued access to stored records and other functionality remains subject to the plan, paid access period, retention terms and account status.",
      },
      {
        q: "How do I request a top-up or upgrade?",
        a: "Use the public Contact page or the available account route. The final amount, currency, tax treatment, payment provider and applicable terms are confirmed before purchase.",
      },
      {
        q: "How do cancellation and refunds work?",
        a: "Monthly plans should be cancelled before the next renewal date to stop future charges. Refund eligibility depends on the product terms, usage, applicable law and the identified payment provider. The GSM Refund Policy is linked from Pricing and the Legal Centre.",
      },
    ],
  },
  {
    title: "Agency workspaces",
    items: [
      {
        q: "How are clients kept separate?",
        a: "Each client workspace uses separate workspace identifiers for authorised data, sender settings, drafts, activation decisions and operational records. The agency remains responsible for client authority and correct workspace use.",
      },
      {
        q: "Can templates be reused across clients?",
        a: "Template structures may be reused, but each client must use its own authorised data, sender, review process, content approval and activation decision.",
      },
      {
        q: "How do pooled Campaign Credits work?",
        a: "The Agency Workspace plan can pool Campaign Credits and account-level limits while retaining isolated client workspaces. The applicable pricing and usage terms are confirmed before purchase.",
      },
    ],
  },
  {
    title: "Reports and exports",
    items: [
      {
        q: "What can I export?",
        a: "Available exports depend on the workspace, permissions and product configuration. They may include customer records, draft assets, activity information and early opportunity records in supported formats.",
      },
      {
        q: "Are demo assets real customer files?",
        a: "No. Seeded demonstration information is illustrative and is not a customer result, customer campaign or performance claim. Some demonstration pointers may not represent downloadable binary files.",
      },
      {
        q: "How should I test an export?",
        a: "Use a small authorised test record set, generate a new draft or report and test the available export route without including unnecessary personal or sensitive data.",
      },
    ],
  },
];

const Help = () => (
  <>
    <SEO
      title="Velocity Vision Help Centre"
      description="Product guidance for Velocity Vision workspaces, customer-authorised data, AI-assisted drafts, sender verification, activation controls, billing and support."
      path="/help"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Product guidance
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4">
              Velocity Vision Help Centre
            </h1>
            <p className="text-primary-foreground/75 text-lg">
              Guidance on customer-authorised data, editable drafts, sender verification, activation controls, follow-up records, billing and support routes.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap">
        <div className="panel-pink">
          <section className="section-padding">
            <div className="max-w-4xl mx-auto space-y-6">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="bg-white rounded-xl border border-white/40 shadow-card p-6 md:p-8 text-foreground"
                >
                  <h2 className="text-2xl font-display font-bold mb-2">
                    {section.title}
                  </h2>
                  <Accordion type="single" collapsible>
                    {section.items.map((item, index) => (
                      <AccordionItem
                        key={item.q}
                        value={`${section.title}-${index}`}
                      >
                        <AccordionTrigger className="text-left font-display">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-foreground/80 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="section-padding bg-hero">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Need product, billing or compliance support?
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl mx-auto">
            Use the public Contact page and select the route that matches the enquiry.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/contact">
              Open Contact page <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Help;
