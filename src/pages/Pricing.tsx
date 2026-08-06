import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCurrency } from "@/hooks/useCurrency";
import { priceFor, taxNotice, type SkuId } from "@/lib/currency";
import PricingCurrencySelector from "@/components/PricingCurrencySelector";
import TrustStrip from "@/components/TrustStrip";
import GlobalStrip from "@/components/GlobalStrip";

interface PlanDef {
  sku: SkuId;
  name: string;
  tagline: string;
  unit: string;
  best: string;
  credits: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const plans: PlanDef[] = [
  {
    sku: "vv_starter_oneoff",
    name: "Starter",
    tagline: "One activated campaign",
    unit: "one-off",
    best: "Trying the workspace end to end",
    credits: "Includes 25 Campaign Credits",
    features: [
      "1 workspace",
      "Data Vault with quality review",
      "Sender verification & governed activation",
      "Full outreach pack (email, social, press, video)",
      "Follow-up & pipeline",
      "30 days workspace access",
    ],
    cta: "Request Starter onboarding",
  },
  {
    sku: "vv_growth_monthly",
    name: "Growth",
    tagline: "Recurring commercial workspace",
    unit: "per month",
    best: "Lean teams running outreach continuously",
    credits: "Includes 80 Campaign Credits / month",
    highlight: true,
    features: [
      "Everything in Starter, ongoing",
      "Recurring cadence (weekly/monthly)",
      "Larger daily send caps",
      "Reusable templates & segments",
      "Follow-up inbox with reply states",
      "Automated monthly performance summary",
    ],
    cta: "Request Growth onboarding",
  },
  {
    sku: "vv_agency_monthly",
    name: "Agency Workspace",
    tagline: "Multi-client commercial workspace",
    unit: "per month",
    best: "Agencies and fractional teams",
    credits: "Includes 250 pooled Campaign Credits / month",
    features: [
      "Unlimited client workspaces, isolated data",
      "Pooled credits across clients",
      "Pooled sending governance across client workspaces",
      "Cross-client pipeline visibility",
      "Reusable templates & branded reports",
      "Seat management",
    ],
    cta: "Request Agency onboarding",
  },
];

const faqs = [
  {
    q: "Is Free Preview really free?",
    a: "Yes. £0, no card required. You get 10 welcome Campaign Credits plus +2 per day (daily balance capped at 10) for 14 days. There is no automatic paid upgrade — you decide when, or whether, to buy credits or move to a paid plan.",
  },
  {
    q: "What happens when free credits run out?",
    a: "The workspace stays available during the preview period. AI generation pauses until you request a top-up or paid upgrade. Your stored data and review work remain intact subject to the applicable access and retention terms.",
  },
  {
    q: "Can I buy credits without subscribing?",
    a: "Top-ups and paid upgrades are arranged during onboarding. The final price, currency, tax treatment, payment provider and applicable terms are confirmed before purchase.",
  },
  {
    q: "Can I send outreach on Free Preview?",
    a: "No. Live sending, mailbox connection and third-party account activation are gated on Free Preview. Sending can only be enabled on an eligible paid plan after the applicable product and compliance gates are completed.",
  },
  {
    q: "Do free credits expire?",
    a: "Yes. Free Preview runs for 14 days from signup, and the daily free balance is capped at 10. Paid top-up credits are governed by the plan and credit terms shown before purchase.",
  },
  {
    q: "Are AI outputs drafts?",
    a: "Yes. Every AI-generated asset is a draft you review, edit and approve. Velocity Vision does not send, publish or activate anything automatically.",
  },
  {
    q: "Does Velocity Vision scrape contacts or sell lists?",
    a: "No. Velocity Vision does not scrape contact data, sell lists or supply prospect databases. Customers provide their own lawfully obtained business data and remain responsible for lawful basis, sender identity, suppression handling and every activation decision.",
  },
  {
    q: "What am I actually paying for?",
    a: "A self-serve software workspace: Data Vault, AI quality review, sender verification, governed activation, AI-assisted draft generation, cadence settings, follow-up records and early pipeline. Campaign Credits cover AI-intensive generation actions.",
  },
  {
    q: "What are Campaign Credits?",
    a: "Campaign Credits are non-cashable product-usage units for AI-intensive actions such as outreach packs, social posts, press releases, video scripts, follow-up assets and multilingual variants. They are not money, stored value or transferable currency.",
  },
  {
    q: "Is storing data the same as activating it?",
    a: "No. You can upload and review authorised data within plan limits. Activation is a separate customer-controlled step involving sender verification, segment review and applicable plan controls. AI drafts assets; the customer approves activation.",
  },
  {
    q: "What sending limits apply?",
    a: "Starter and Growth use per-workspace limits, while Agency Workspace uses pooled account-level governance across client workspaces. Daily caps and risky-record controls are operational safeguards; they do not guarantee deliverability or legal compliance.",
  },
  {
    q: "Which plans renew automatically?",
    a: "Starter is a one-off purchase with 30 days of workspace access. Growth and Agency Workspace are monthly subscriptions that renew at the disclosed monthly price until cancelled.",
  },
  {
    q: "How do I cancel a monthly plan?",
    a: "Cancel through the available billing settings or the published contact route before the next renewal date. Cancellation stops future renewal and normally leaves paid access available until the end of the current billing period, subject to the Terms.",
  },
  {
    q: "How are paid products delivered?",
    a: "Delivery is electronic through account activation and hosted workspace access after payment and any required onboarding or compliance checks are completed. No physical goods are supplied.",
  },
  {
    q: "What is the refund position?",
    a: "Refund eligibility depends on the product terms, usage, applicable law and the procedures of the identified payment provider or Merchant of Record. Approved refunds are normally returned through the original payment method. The GSM Refund Policy is linked directly on this page.",
  },
  {
    q: "What happens if I run out of paid credits?",
    a: "The workspace remains subject to the paid access period and plan terms. New AI-intensive generation pauses until credits are added or the plan is upgraded; ordinary stored records do not become cashable or refundable balances.",
  },
  {
    q: "Are outputs or results guaranteed?",
    a: "No. Velocity Vision helps draft and organise customer-controlled activity. It does not guarantee replies, sales, deliverability, legal compliance, pipeline or revenue.",
  },
  {
    q: "Can agencies share credits across clients?",
    a: "Yes. Agency Workspace pools monthly Campaign Credits and account-level sending governance across isolated client workspaces.",
  },
];

const Pricing = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <SEO
        title="Pricing — Velocity Vision commercial workspace"
        description="Published multi-currency pricing for a self-serve B2B software workspace with electronic delivery, governed activation, clear billing cadence, cancellation and refund information."
        path="/pricing"
      />
      <Navbar />
      <main className="pt-20">
        <section className="relative bg-hero px-6 md:px-12 lg:px-20 pt-16 pb-28 md:pt-20 md:pb-36 lg:pt-24 lg:pb-44">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                Pricing
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-5">
                Published plans for a governed self-serve workspace
              </h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
                Review the price, currency, billing cadence, included Campaign Credits, access period, tax treatment and delivery terms before purchase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/auth">
                    Start your workspace <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to="/contact">Talk to us about onboarding</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="panel-wrap">
          <div className="panel-pink">
            <section className="section-padding">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-xs md:text-sm max-w-xl leading-relaxed opacity-90">
                    Choose your display currency. The final checkout confirms the transaction currency, applicable tax and payment provider before payment.
                  </p>
                  <PricingCurrencySelector
                    align="right"
                    currency={currency}
                    onCurrencyChange={setCurrency}
                  />
                </div>

                <div className="mb-6 rounded-2xl border border-white/40 bg-white p-6 lg:p-7 flex flex-col md:flex-row md:items-center gap-5 shadow-card text-foreground">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-2">
                      Free preview · £0
                    </span>
                    <h2 className="font-display font-semibold text-xl">Free Preview</h2>
                    <p className="text-sm opacity-80 mt-1 max-w-2xl">
                      Start with free Campaign Credits. Build your first workspace, review your data and generate preview assets before you pay.
                    </p>
                    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />
                        10 welcome credits + 2/day (cap 10)
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />1 workspace, up to 25 contacts
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />1 full campaign pack (preview)
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />14-day preview window
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />Paid activation and top-ups arranged through onboarding
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="text-accent mt-0.5" />No live sending on Free Preview
                      </li>
                    </ul>
                    <p className="text-xs opacity-70 mt-3">
                      No card required. No automatic paid upgrade. Publishing and sending remain under customer control.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="lg" asChild>
                      <Link to="/auth">
                        Start Free Preview <ArrowRight size={18} />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/help/getting-started">How it works</Link>
                    </Button>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-accent/40 bg-accent/5 px-4 py-4 text-sm text-foreground/90 space-y-2">
                  <p>
                    Paid plans are activated after onboarding and applicable compliance checks. The final price, currency, tax treatment, payment provider and product terms are confirmed before purchase.
                  </p>
                  <p>
                    <strong>Billing:</strong> Starter is one-off with 30 days of workspace access. Growth and Agency Workspace renew monthly until cancelled. Cancellation stops future renewal and normally leaves access available until the end of the current paid period.
                  </p>
                  <p>
                    <strong>Delivery:</strong> paid products are delivered electronically through account activation and hosted workspace access. No physical goods are supplied.
                  </p>
                  <p>
                    <strong>Refunds:</strong>{" "}
                    <a
                      href="https://globalsolutions.management/refunds"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 font-semibold"
                    >
                      read the GSM Refund Policy
                    </a>
                    . Product-specific terms and the identified payment provider's procedures may also apply.
                  </p>
                </div>

                <div className="mb-6 rounded-xl border border-border/50 bg-white/70 px-4 py-4 text-sm text-foreground/90 space-y-1">
                  <p className="font-semibold">Not sure which plan?</p>
                  <p>
                    <strong>Starter</strong> is for running one first campaign end to end.{" "}
                    <strong>Growth</strong> is the recommended operating plan for most teams running outreach continuously.{" "}
                    <strong>Agency Workspace</strong> is for multi-client delivery across isolated client workspaces.
                  </p>
                  <p>
                    Launch support included: complimentary onboarding and a review of your first campaign.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      className={`rounded-2xl p-6 lg:p-7 shadow-card border flex flex-col bg-white border-white/40 text-foreground ${plan.highlight ? "ring-2 ring-accent/60 shadow-elevated" : ""}`}
                    >
                      {plan.highlight && (
                        <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">
                          Recommended for most teams
                        </span>
                      )}
                      <h2 className="font-display font-semibold text-xl">{plan.name}</h2>
                      <p className="text-sm opacity-80 mb-3">{plan.tagline}</p>
                      <p className="mb-1">
                        <span className="text-3xl md:text-4xl font-display font-bold">
                          {priceFor(plan.sku, currency).formatted}
                        </span>
                        <span className="text-sm opacity-80 ml-1">{plan.unit}</span>
                      </p>
                      <p className="text-[11px] opacity-70 mb-3">{taxNotice(currency)}</p>
                      <p className="text-xs mb-4">
                        Best for: <span className="font-medium">{plan.best}</span>
                      </p>
                      <p className="text-xs font-semibold text-accent mb-4">{plan.credits}</p>
                      <ul className="space-y-2 mb-6 flex-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check size={16} className="text-accent shrink-0 mt-0.5" />
                            <span className="opacity-80">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="cta" asChild>
                        <Link to={`/contact?plan=${planSlug(plan.sku)}`}>{plan.cta}</Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <GlobalStrip variant="compact" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="panel-wrap">
          <div className="panel-blue">
            <section className="section-padding">
              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
                  <h2 className="font-display font-semibold text-lg mb-2">
                    Campaign Credits
                  </h2>
                  <p className="text-sm opacity-90">
                    AI-intensive generation actions draw on Campaign Credits. Credits are non-cashable product-usage units and are governed by the applicable plan terms.
                  </p>
                </div>
                <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
                  <h2 className="font-display font-semibold text-lg mb-2">
                    Plan limits and top-ups
                  </h2>
                  <p className="text-sm opacity-90">
                    Daily caps and risky-record controls are operational safeguards. They do not guarantee deliverability or compliance. Additional credits may be requested through onboarding.
                  </p>
                </div>
                <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
                  <h2 className="font-display font-semibold text-lg mb-2">
                    Multi-currency display
                  </h2>
                  <p className="text-sm opacity-90">
                    Display prices are available in supported currencies. The checkout or onboarding confirmation identifies the final currency, tax and payment provider before payment.
                  </p>
                </div>
              </div>
              <div className="max-w-5xl mx-auto mt-10 md:mt-12">
                <TrustStrip variant="pricing" />
              </div>
            </section>
          </div>
        </div>

        <div className="panel-wrap">
          <div className="panel-pink">
            <section className="section-padding">
              <div className="max-w-3xl mx-auto">
                <div className="max-w-2xl mb-8">
                  <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                    Pricing FAQ
                  </p>
                  <h2 className="text-3xl md:text-4xl font-display font-bold">
                    Questions about plans, credits, billing and refunds
                  </h2>
                </div>
                <div className="bg-white border border-white/40 rounded-2xl p-6 md:p-8 shadow-card text-foreground">
                  <Accordion type="single" collapsible>
                    {faqs.map((faq, index) => (
                      <AccordionItem key={faq.q} value={`f-${index}`}>
                        <AccordionTrigger className="text-left font-display">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="leading-relaxed opacity-80">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <EmailIntegrationsStrip variant="compact" />
      <Footer />
    </>
  );
};

export default Pricing;
