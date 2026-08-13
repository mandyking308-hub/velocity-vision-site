import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice, priceFor, taxNotice, type SkuId } from "@/lib/currency";
import PricingCurrencySelector from "@/components/PricingCurrencySelector";
import TrustStrip from "@/components/TrustStrip";
import GlobalStrip from "@/components/GlobalStrip";
import { planSlug } from "@/lib/planIntent";
import { useDodoReadiness } from "@/hooks/useDodoReadiness";
import { isAnyTopUpLiveReady } from "@/lib/dodoReadiness";
import { authNextForPlan } from "@/lib/safeNext";

const LIVE_CTA: Record<string, string> = {
  vv_starter_oneoff: "Buy Starter",
  vv_growth_monthly: "Start Growth",
  vv_agency_monthly: "Start Agency Workspace",
};

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
    tagline: "One-off campaign workspace",
    unit: "one-off",
    best: "Running a first paid campaign end to end",
    credits: "Includes 25 Campaign Credits",
    features: [
      "1 workspace · one-off campaigns",
      "Data Vault with customer review",
      "First-Campaign Copilot and Launchpad",
      "Complete campaign pack: strategy, landing & offer, email, social, press, video, paid ads and lead capture",
      "Activation-preparation preflight and sender setup",
      "Reply Intent Command Centre, referrals and out-of-office dates",
      "Meeting handoff, pipeline and Outcome Funnel",
      "Normal send ceiling up to 20/day · 30 days workspace access",
    ],
    cta: "Buy Starter",
  },
  {
    sku: "vv_growth_monthly",
    name: "Growth",
    tagline: "Recurring campaign workspace",
    unit: "per month",
    best: "Teams running complete customer-controlled campaigns continuously",
    credits: "Includes 80 Campaign Credits / month",
    highlight: true,
    features: [
      "Everything in Starter, ongoing",
      "Recurring cadence (weekly/monthly/custom) — each run remains customer-controlled",
      "Reusable recurring campaign templates and segments",
      "Normal send ceiling up to 50/day",
      "Reply triage, referral and out-of-office handling",
      "Outcome Funnel reporting from stored records",
    ],
    cta: "Start Growth",
  },
  {
    sku: "vv_agency_monthly",
    name: "Agency Workspace",
    tagline: "Multi-client campaign workspace",
    unit: "per month",
    best: "Agencies and fractional teams running separate client campaigns",
    credits: "Includes 250 pooled Campaign Credits / month",
    features: [
      "Everything in Growth",
      "Unlimited isolated client workspaces",
      "Pooled Campaign Credits across client workspaces",
      "Cross-client pipeline and Outcome Funnel visibility",
      "Account-wide view of daily send usage across client workspaces",
      "Normal send ceiling up to 100/day",
    ],
    cta: "Start Agency Workspace",
  },
];

const buildFaqs = (topUpsPurchasable: boolean) => [
  {
    q: "Is Free Preview really free?",
    a: "Yes. $0, no card required. You get 10 welcome Campaign Credits plus +2 per day, with the daily balance capped at 10, for a 14-day preview. Free Preview is limited to one full campaign pack, one workspace, up to 25 contacts and no live sending. There is no automatic paid upgrade.",
  },
  {
    q: "What happens when the Free Preview pack or credits are used?",
    a: "You can continue reviewing the existing preview work during the 14-day window, subject to the applicable terms. Free Preview cannot generate a second full campaign pack and does not accept credit top-ups. Move to a paid plan for further full-pack generation or live sending.",
  },
  {
    q: "Can I buy Campaign Credits without a monthly subscription?",
    a: topUpsPurchasable
      ? "Yes, on an eligible paid workspace. Starter is a one-off paid plan, so an eligible Starter account can buy available top-up packs without a monthly subscription. Growth and Agency are monthly plans. Free Preview cannot buy top-ups. The final price, currency, tax treatment, payment provider and terms are shown before payment."
      : "Top-up packs are only for eligible paid workspaces and instant self-serve top-up checkout is not active yet. Starter is a one-off paid plan; Growth and Agency are monthly plans. Free Preview cannot buy top-ups. The final price, currency, tax treatment, payment provider and terms are confirmed before payment.",
  },
  {
    q: "Can I send outreach on Free Preview?",
    a: "No. Free Preview cannot connect a live sending mailbox or send outreach. Eligible paid plans can send only after the applicable sender, legal, unsubscribe and send-safety checks. Starter also supports live sending; Growth and Agency add recurring cadence.",
  },
  {
    q: "What are Campaign Credits used for today?",
    a: "Campaign Credits are non-cashable product-usage units for credit-priced AI generation. The current live credit-priced generator is full campaign-pack generation. Data review, activation preparation and each individual email/contact send are not charged as Campaign Credits. Credits are not money, stored value or transferable currency.",
  },
  {
    q: "Is activation preparation the same as sending?",
    a: "No. Activation preparation creates campaign leads from customer-selected eligible records after campaign, legal and human-approval checks. It does not send email and does not spend Campaign Credits. Before a real send, Velocity Vision checks the paid plan, mailbox state, unsubscribe handling and current daily safety allowance again.",
  },
  {
    q: "Are AI outputs drafts?",
    a: "Yes. AI-generated assets remain editable drafts. The customer reviews and approves them. Velocity Vision does not automatically publish, send or activate campaign content.",
  },
  {
    q: "Does Velocity Vision scrape contacts or sell lists?",
    a: "No. Customers provide their own lawfully obtained business data and remain responsible for lawful basis, sender identity, suppression handling and recipient appropriateness.",
  },
  {
    q: "What sending limits apply?",
    a: "Normal daily plan ceilings are 20/day on Starter, 50/day on Growth and 100/day on Agency for the sending account. Sender health, warm-up and other safety controls can reduce those allowances but never raise them. Free Preview has a zero live-send ceiling. Agency also provides account-wide send-usage visibility across client workspaces; it does not claim cross-seat pooled-send enforcement.",
  },
  {
    q: "Which plans renew automatically?",
    a: "Starter is a one-off purchase with 30 days of workspace access. Growth and Agency Workspace are monthly subscriptions that renew at the disclosed monthly price until canceled.",
  },
  {
    q: "How do I cancel a monthly plan?",
    a: "Cancel through the available billing settings or published contact route before the next renewal date. Cancellation stops future renewal and normally leaves paid access available until the end of the current billing period, subject to the Terms.",
  },
  {
    q: "What is the refund position?",
    a: "Refund eligibility depends on the product terms, usage, applicable law and the procedures of the identified payment provider or Merchant of Record. Approved refunds are normally returned through the original payment method. The GSM Refund Policy is linked on this page.",
  },
  {
    q: "Are outputs or commercial results guaranteed?",
    a: "No. Velocity Vision helps organize customer-controlled activity and stored outcome records. It does not guarantee replies, sales, deliverability, legal compliance, pipeline or revenue and does not perform automated attribution or A/B testing.",
  },
];

export default function Pricing() {
  const { currency, setCurrency } = useCurrency();
  const { readiness } = useDodoReadiness();
  const faqs = buildFaqs(isAnyTopUpLiveReady(readiness));

  return (
    <>
      <SEO title="Pricing — Complete customer-controlled campaign workspace | Velocity Vision" description="Published pricing for Velocity Vision Free Preview, Starter, Growth and Agency Workspace, covering complete campaign-pack generation, Campaign Credits, sending, billing and add-on terms." path="/pricing" />
      <Navbar />
      <main className="pt-20">
        <section className="relative bg-hero px-6 md:px-12 lg:px-20 pt-16 pb-28 md:pt-20 md:pb-36 lg:pt-24 lg:pb-44">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-5">Published plans for the complete campaign workspace</h1>
              <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-3xl mx-auto">Choose the level of campaign generation, recurring use, sending capacity and workspace access you need. Review price, Campaign Credits, billing cadence, tax treatment and delivery terms before purchase.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild><Link to="/auth">Start Free Preview <ArrowRight size={18} /></Link></Button>
                <Button variant="hero-outline" size="lg" asChild><a href="#paid-plans">Compare paid plans</a></Button>
              </div>

            </motion.div>
          </div>
        </section>

        <div className="panel-wrap"><div className="panel-pink"><section className="section-padding"><div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs md:text-sm max-w-xl leading-relaxed opacity-90">Choose a display currency. The final transaction currency, applicable tax, payment provider and terms are confirmed before payment.</p>
            <PricingCurrencySelector align="right" currency={currency} onCurrencyChange={setCurrency} />
          </div>

          <div className="mb-6 rounded-2xl border border-white/40 bg-white p-6 lg:p-7 shadow-card text-foreground">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-1">
                <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-2">Free Preview · {formatPrice(0, currency)}</span>
                <h2 className="font-display font-semibold text-xl">Build and review your first complete campaign pack before you pay</h2>
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {["10 welcome credits + 2/day (daily balance cap 10)", "1 workspace · up to 25 contacts", "Maximum 1 full campaign pack", "14-day preview window", "No card required. No automatic upgrade.", "No live sending or mailbox connection", "No recurring cadence", "No credit top-ups into Free Preview"].map((x) => <li key={x} className="flex gap-2"><Check size={16} className="text-accent mt-0.5 shrink-0" />{x}</li>)}
                </ul>
              </div>
              <Button size="lg" asChild><Link to="/auth">Start Free Preview <ArrowRight size={18} /></Link></Button>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-accent/40 bg-accent/5 px-4 py-4 text-sm text-foreground/90 space-y-2">
            <p><strong>Billing:</strong> Starter is one-off with 30 days of workspace access. Growth and Agency renew monthly until canceled.</p>
            <p><strong>Credits:</strong> the current live credit-priced action is full campaign-pack generation. Sending, Data Vault review and activation preparation are governed separately.</p>
            <p><strong>Delivery:</strong> paid products are delivered electronically through account/workspace access after payment and any required onboarding or compliance checks.</p>
            <p><strong>Refunds:</strong> <a href="https://globalsolutions.management/refunds" target="_blank" rel="noreferrer" className="underline underline-offset-4 font-semibold">read the GSM Refund Policy</a>. Product-specific terms and the identified payment provider's procedures may also apply.</p>
          </div>

          <div className="mb-6 rounded-xl border border-border/50 bg-white/70 px-4 py-4 text-sm text-foreground/90 space-y-1">
            <p><strong>Launch support:</strong> complimentary onboarding and setup guidance are included.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }} className={`rounded-2xl p-6 lg:p-7 shadow-card border flex flex-col bg-white border-white/40 text-foreground ${plan.highlight ? "ring-2 ring-accent/60 shadow-elevated" : ""}`}>
                {plan.highlight && <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Recommended for recurring use</span>}
                <h2 className="font-display font-semibold text-xl">{plan.name}</h2>
                <p className="text-sm opacity-80 mb-3">{plan.tagline}</p>
                <p><span className="text-3xl md:text-4xl font-display font-bold">{priceFor(plan.sku, currency).formatted}</span><span className="text-sm opacity-80 ml-1">{plan.unit}</span></p>
                <p className="text-[11px] opacity-70 mb-3">{taxNotice(currency)}</p>
                <p className="text-xs mb-3">Best for: <span className="font-medium">{plan.best}</span></p>
                <p className="text-xs font-semibold text-accent mb-4">{plan.credits}</p>
                <ul className="space-y-2 mb-6 flex-1">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><Check size={16} className="text-accent shrink-0 mt-0.5" /><span className="opacity-80">{feature}</span></li>)}</ul>
                <Button variant="cta" asChild><Link to={authNextForPlan(planSlug(plan.sku))}>{LIVE_CTA[plan.sku] ?? plan.cta}</Link></Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8"><GlobalStrip variant="compact" /></div>
        </div></section></div></div>

        <div className="panel-wrap"><div className="panel-blue"><section className="section-padding"><div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <Info title="Campaign Credits">Currently used for full campaign-pack generation. They are non-cashable product-usage units, not money or stored value.</Info>
          <Info title="Paid-workspace top-ups">Top-up packs are only for eligible paid workspaces. Free Preview cannot buy top-ups. Availability depends on live checkout readiness.</Info>
          <Info title="Send ceilings">Free 0/day · Starter 20/day · Growth 50/day · Agency 100/day normal ceilings. Sender/safety controls can reduce them.</Info>
        </div><div className="max-w-5xl mx-auto mt-10"><TrustStrip variant="pricing" /></div></section></div></div>

        <div className="panel-wrap"><div className="panel-pink"><section className="section-padding"><div className="max-w-3xl mx-auto">
          <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">Pricing FAQ</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">Questions about plans, credits, sending and billing</h2>
          <div className="bg-white border border-white/40 rounded-2xl p-6 md:p-8 shadow-card text-foreground"><Accordion type="single" collapsible>{faqs.map((faq, index) => <AccordionItem key={faq.q} value={`f-${index}`}><AccordionTrigger className="text-left font-display">{faq.q}</AccordionTrigger><AccordionContent className="leading-relaxed opacity-80">{faq.a}</AccordionContent></AccordionItem>)}</Accordion></div>
        </div></section></div></div>
      </main>
      <EmailIntegrationsStrip variant="compact" />
      <Footer />
    </>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"><h2 className="font-display font-semibold text-lg mb-2">{title}</h2><p className="text-sm opacity-90">{children}</p></div>;
}