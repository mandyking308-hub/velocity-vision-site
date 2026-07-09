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
  addon?: boolean;
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
      "Monthly performance review",
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
  { q: "Is Free Preview really free?", a: "Yes. £0, no card required. You get 10 welcome Campaign Credits plus +2 per day (daily balance capped at 10) for 14 days. There is no automatic paid upgrade — you decide when, or whether, to buy credits or move to Growth." },
  { q: "What happens when free credits run out?", a: "The workspace stays available. AI generation pauses until you top up credits or upgrade. Your data, review and pipeline remain intact." },
  { q: "Can I buy credits without subscribing?", a: "Yes. Top-ups are available to every plan, including Free Preview. Paid top-up credits are recorded separately and become usable as soon as Stripe payment clears." },
  { q: "Can I send outreach on Free Preview?", a: "No. Live sending, Nylas mailbox connection and third-party account activation are gated on Free Preview. Sending unlocks with a paid plan and completed compliance gates." },
  { q: "Do free credits expire?", a: "Yes — Free Preview runs for 14 days from signup, and the daily free balance is capped at 10. Paid top-up credits do not expire while your plan is active." },
  { q: "Are AI outputs drafts?", a: "Yes. Every AI-generated asset is a draft you review, edit and approve. Velocity Vision does not send, publish or activate anything automatically." },
  { q: "What am I actually paying for?", a: "An AI-powered commercial operating workspace: Data Vault, AI quality review, sender verification, governed activation, AI-assisted outreach asset generation, cadence, follow-up and pipeline. Storage is generous on every plan. Credits cover heavy-value AI generations." },
  { q: "What are Campaign Credits?", a: "Campaign Credits power AI-heavy actions such as outreach packs, social posts, press releases, video scripts, follow-up assets and multilingual variants. Uploading, reviewing, sending, following up, moving pipeline and exporting are always free." },
  { q: "Is storing data the same as activating it?", a: "No. You can upload and review unlimited data within plan limits. Activation is the governed step where you verify your sender, pick a safe segment and start sending — with daily caps and risky-record limits enforced. AI drafts assets; you approve activation." },
  { q: "What sending limits apply?", a: "Tiered daily caps protect deliverability. Starter and Growth have per-workspace limits; Agency has pooled sending governance across client workspaces. Risky records are limited within each batch." },
  { q: "What happens if I run out of credits?", a: "The workspace stays fully usable — data, follow-up, pipeline and reports remain live. Only new AI generations pause. Top up in seconds or upgrade your plan." },
  { q: "Are outputs AI-generated?", a: "Yes. Velocity Vision uses AI to help draft and structure outreach assets, run quality checks and suggest follow-ups. Every output is a draft — you review, edit and control what is activated or sent. We don't guarantee replies, sales, deliverability or legal compliance." },
  { q: "Can agencies share credits across clients?", a: "Yes — Agency Workspace pools monthly credits and sending governance across every client workspace in the account." },
  { q: "Why don't you publish customer case studies or logos?", a: "We do not publish customer names, campaign data, account details or results without explicit written permission. Velocity Vision is built for confidential commercial work — your strategy, targeting, pipeline activity and customer data stay private by default." },
];

const Pricing = () => {
  const { currency, setCurrency } = useCurrency();
  return (
  <>

    <SEO
      title="Pricing — Velocity Vision commercial workspace"
      description="Self-serve pricing for businesses and agencies. Generous data storage, governed sending, and credits for heavy-value actions."
      path="/pricing"
    />
    <Navbar />
    <main className="pt-20">
      <section className="relative bg-hero px-6 md:px-12 lg:px-20 pt-16 pb-28 md:pt-20 md:pb-36 lg:pt-24 lg:pb-44">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-5">
              Pay for governed action, not for stored data
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Storage is generous. Sending stays safe. Credits cover heavy-value AI generations. Scale with top-ups, not surprise bills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Talk to us about onboarding</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap"><div className="panel-pink">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-xs md:text-sm max-w-xl leading-relaxed opacity-90">
              Choose your display currency. Velocity Vision is built for international buyers, agencies and teams working across markets.
            </p>
            <PricingCurrencySelector align="right" currency={currency} onCurrencyChange={setCurrency} />
          </div>
          {/* Free Preview entry tier — no Stripe SKU, no auto-upgrade, no live sending. */}
          <div className="mb-6 rounded-2xl border border-white/40 bg-white p-6 lg:p-7 flex flex-col md:flex-row md:items-center gap-5 shadow-card text-foreground">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-2">Free preview · £0</span>
              <h3 className="font-display font-semibold text-xl">Free Preview</h3>
              <p className="text-sm opacity-80 mt-1 max-w-2xl">
                Start with free Campaign Credits. Build your first workspace, review your data and generate preview assets before you pay.
              </p>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />10 welcome credits + 2/day (cap 10)</li>
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />1 workspace, up to 25 contacts</li>
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />1 full campaign pack (preview)</li>
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />14-day preview window</li>
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />Buy top-up credits any time</li>
                <li className="flex gap-2"><Check size={16} className="text-accent mt-0.5" />No live sending on Free Preview</li>
              </ul>
              <p className="text-xs opacity-70 mt-3">
                No surprise bills. No automatic paid upgrade. Publishing and sending remain under your control.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button size="lg" asChild><Link to="/auth">Start Free Preview <ArrowRight size={18} /></Link></Button>
              <Button variant="outline" size="lg" asChild><Link to="/help/getting-started">How it works</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`rounded-2xl p-6 lg:p-7 shadow-card border flex flex-col bg-white border-white/40 text-foreground ${p.highlight ? "ring-1 ring-accent/30" : ""}`}
              >
                {p.highlight && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Most popular</span>
                )}
                {p.addon && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-foreground/10 text-foreground font-semibold mb-3">Optional add-on</span>
                )}
                <h3 className="font-display font-semibold text-xl">{p.name}</h3>
                <p className="text-sm opacity-80 mb-3">{p.tagline}</p>
                <p className="mb-1">
                  <span className="text-3xl md:text-4xl font-display font-bold">{priceFor(p.sku, currency).formatted}</span>
                  <span className="text-sm opacity-80 ml-1">{p.unit}</span>
                </p>
                <p className="text-[11px] opacity-70 mb-3">{taxNotice(currency)}</p>
                <p className="text-xs mb-4">Best for: <span className="font-medium">{p.best}</span></p>

                <p className="text-xs font-semibold text-accent mb-4">{p.credits}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="opacity-80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={p.addon ? "outline" : "cta"} asChild>
                  <Link to="/app/billing">{p.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="mt-8">
            <GlobalStrip variant="compact" />
          </div>
        </div>
      </section>
      </div></div>


      <div className="panel-wrap"><div className="panel-blue">
      <section className="section-padding">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
            <h3 className="font-display font-semibold text-lg mb-2">Generous data, governed action</h3>
            <p className="text-sm opacity-90">Store companies, contacts and segments without per-record fees. Heavy-value actions — full outreach packs, social packs, press releases, video packs — draw on Campaign Credits.</p>
          </div>
          <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
            <h3 className="font-display font-semibold text-lg mb-2">Safe scaling, no surprise bills</h3>
            <p className="text-sm opacity-90">Tiered daily caps protect deliverability. Top up credits when a month gets busy — Small, Medium or Large. Top-ups never expire while your plan is active.</p>
          </div>
          <div className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground">
            <h3 className="font-display font-semibold text-lg mb-2">International by default</h3>
            <p className="text-sm opacity-90">Multi-currency pricing (GBP, USD, EUR and more), localised tax at checkout, multilingual outreach. Built for distributed teams from day one.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 md:mt-12">
          <TrustStrip variant="pricing" />
        </div>
      </section>
      </div></div>

      <div className="panel-wrap"><div className="panel-pink">
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="max-w-2xl mb-8">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">Pricing FAQ</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Questions about plans, credits and billing</h2>
          </div>
          <div className="bg-white border border-white/40 rounded-2xl p-6 md:p-8 shadow-card text-foreground">
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`}>
                  <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed opacity-80">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
      </div></div>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <Footer />
  </>
  );
};

export default Pricing;
