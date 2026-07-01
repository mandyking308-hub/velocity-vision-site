import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      "Replies, follow-up & pipeline",
      "30 days workspace access",
    ],
    cta: "Start your workspace",
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
      "Replies inbox with follow-up states",
      "Monthly performance review",
    ],
    cta: "Choose Growth",
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
    cta: "Start Agency Workspace",
  },
];


const faqs = [
  { q: "What am I actually paying for?", a: "An AI-powered commercial operating workspace: Data Vault, AI quality review, sender verification, governed activation, AI-assisted outreach asset generation, cadence, replies, follow-up and pipeline. Storage is generous on every plan. Credits cover heavy-value AI generations." },
  { q: "What are Campaign Credits?", a: "Campaign Credits power AI-heavy actions such as outreach packs, social posts, press releases, video scripts, follow-up assets and multilingual variants. Uploading, reviewing, sending, replying, moving pipeline and exporting are always free." },
  { q: "Is storing data the same as activating it?", a: "No. You can upload and review unlimited data within plan limits. Activation is the governed step where you verify your sender, pick a safe segment and start sending — with daily caps and risky-record limits enforced. AI drafts assets; you approve activation." },
  { q: "What sending limits apply?", a: "Tiered daily caps protect deliverability. Starter and Growth have per-workspace limits; Agency has pooled sending governance across client workspaces. Risky records are limited within each batch." },
  { q: "What happens if I run out of credits?", a: "The workspace stays fully usable — data, replies, pipeline and reports remain live. Only new AI generations pause. Top up in seconds or upgrade your plan." },
  { q: "Are outputs AI-generated?", a: "Yes. Velocity Vision uses AI to help draft and structure outreach assets, run quality checks and suggest follow-ups. Every output is a draft — you review, edit and control what is activated or sent. We don't guarantee replies, sales, deliverability or legal compliance." },
  { q: "Can agencies share credits across clients?", a: "Yes — Agency Workspace pools monthly credits and sending governance across every client workspace in the account." },
];

const Pricing = () => {
  const { currency } = useCurrency();
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
                <Link to="/app/billing">View agency workspace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


      <section className="relative z-10 bg-background px-6 md:px-12 lg:px-20 -mt-16 md:-mt-20 lg:-mt-28 pt-0 pb-16 md:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <PricingCurrencySelector align="right" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`rounded-2xl p-6 lg:p-7 shadow-elevated border flex flex-col ${p.highlight ? "bg-card border-accent/60 ring-1 ring-accent/30" : p.addon ? "bg-secondary border-border/50" : "bg-card border-border/50"}`}
              >
                {p.highlight && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Most popular</span>
                )}
                {p.addon && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-foreground/10 text-foreground font-semibold mb-3">Optional add-on</span>
                )}
                <h3 className="font-display font-semibold text-xl text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{p.tagline}</p>
                <p className="mb-1">
                  <span className="text-3xl md:text-4xl font-display font-bold text-foreground">{priceFor(p.sku, currency).formatted}</span>
                  <span className="text-muted-foreground text-sm ml-1">{p.unit}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mb-3">{taxNotice(currency)}</p>
                <p className="text-xs text-muted-foreground mb-4">Best for: <span className="text-foreground font-medium">{p.best}</span></p>

                <p className="text-xs font-semibold text-accent mb-4">{p.credits}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={p.addon ? "outline" : "cta"} asChild>
                  <Link to="/app/billing">{p.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="bg-background border-t border-border px-6 md:px-12 lg:px-20 py-14 md:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Generous data, governed action</h3>
            <p className="text-muted-foreground text-sm">Store companies, contacts and segments without per-record fees. Heavy-value actions — full outreach packs, social packs, press releases, video packs — draw on Campaign Credits.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Safe scaling, no surprise bills</h3>
            <p className="text-muted-foreground text-sm">Tiered daily caps protect deliverability. Top up credits when a month gets busy — Small, Medium or Large. Top-ups never expire while your plan is active.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">International by default</h3>
            <p className="text-muted-foreground text-sm">Multi-currency pricing (GBP, USD, EUR and more), localised tax at checkout, multilingual outreach. Built for distributed teams from day one.</p>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-6 md:px-12 lg:px-20 py-14 md:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">Pricing FAQ</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
    <Footer />
  </>
  );
};

export default Pricing;
