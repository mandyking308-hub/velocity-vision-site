import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { SIGNUP_PATH } from "@/lib/signupPath";

const steps = [
  {
    n: "01",
    title: "Upload authorized business data",
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
    title: "Connect and verify the customer's sender for paid activation",
    desc: "When moving to paid email activation, configure the authorized mailbox or sender route and complete the applicable verification steps before any live send. Free Preview remains review-only and does not connect a live sender.",
  },
  {
    n: "05",
    title: "Generate the complete campaign pack",
    desc: "Answer one Copilot brief and create editable strategy, landing & offer copy, email sequences, social content, a press release, video scripts, paid-ad copy and lead capture. Every output remains editable.",
  },
  {
    n: "06",
    title: "Choose channels, timing and cadence",
    desc: "Decide how approved assets will be used. Eligible paid plans can use governed email sending and customer-controlled Buffer handoff; other assets remain under customer control. Configure one-off timing, or recurring cadence on Growth and Agency.",
  },
  {
    n: "07",
    title: "Run preflight and approve activation",
    desc: "Work through the readiness scorecard, apply plan limits and daily send allowances, then require an authorized-user decision before eligible email activity is activated.",
  },
  {
    n: "08",
    title: "Triage replies in the Reply Intent Command Centre",
    desc: "Review replies grouped by intent, with unsubscribe and bounce wording always taking precedence, referrals surfaced for review, out-of-office return dates recorded and replies waiting 24h+ listed together.",
  },
  {
    n: "09",
    title: "Hand off meetings and create opportunity records",
    desc: "Move an interested reply into handoff with your own booking link, record a meeting as booked when it is confirmed, and create opportunity records with stage, value and owner fields. Velocity Vision does not connect to your calendar.",
  },
  {
    n: "10",
    title: "Measure the Outcome Funnel",
    desc: "Review Contacted → Replied → Interested/Referral → Meeting booked → Opportunity → Won from your stored records, then decide whether a later workflow should be reused, edited, paused or discontinued.",
  },
];

const outputs = [
  "Data Vault",
  "Campaign strategy",
  "Landing & offer copy",
  "Email sequence",
  "Social pack",
  "Press release",
  "Video scripts",
  "Paid-ad copy",
  "Lead capture",
  "Sender verification",
  "Follow-up records",
  "Early opportunity records",
  "Outcome Funnel",
];

const HowItWorks = () => (
  <>
    <SEO
      title="How it works — From data to complete campaign to response | Velocity Vision"
      description="See how Velocity Vision moves from customer-provided business data and one brief to a complete campaign pack, customer-controlled activation, replies, meetings, pipeline and stored outcomes."
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
              From approved data to complete campaign to response
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">
              Start with the customer data and campaign brief, build the complete pack, review every asset, choose the right activation route, then manage replies and early pipeline from the same workspace.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">
              Velocity Vision does not scrape contacts, sell lists, provide managed campaigns, send automatically or guarantee compliance, deliverability, replies, sales, pipeline or revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to={SIGNUP_PATH}>
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
                  Ten documented steps from data to measured outcomes
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
                  What lives in the workspace
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  The campaign assets and operational records stay connected
                </h2>
                <p className="text-lg opacity-90">
                  Campaign assets remain drafts until customer review. Recorded activity describes use of the workspace and is not a promised commercial result.
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
            Free Preview has no live sending or external Buffer handoff. Paid activation is self-serve after purchase and the applicable sender, safety and legal gates; optional setup guidance is available but is never required for checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to={SIGNUP_PATH}>
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