import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    tagline: "Self-Serve Campaign Launch",
    price: "£149",
    unit: "one-off",
    best: "Your first guided campaign launch",
    credits: "Includes 25 Campaign Credits",
    features: [
      "1 workspace",
      "1 guided brief",
      "1 full generated campaign pack",
      "Social, press release, video pack",
      "Lead capture page",
      "30 days dashboard access",
    ],
    cta: "Start Starter",
  },
  {
    name: "Growth",
    tagline: "Monthly Campaign Engine",
    price: "£249",
    unit: "per month",
    best: "Businesses running campaigns continuously",
    credits: "Includes 80 Campaign Credits / month",
    highlight: true,
    features: [
      "1 main workspace",
      "Recurring monthly credits",
      "Templates & repeat campaigns",
      "Lead capture and mini pipeline",
      "Connected email area",
      "Monthly AI performance review",
    ],
    cta: "Start Growth",
  },
  {
    name: "Agency Workspace",
    tagline: "Multi-client workspace",
    price: "£499",
    unit: "per month",
    best: "Agencies, consultants, fractional teams",
    credits: "Includes 250 pooled Campaign Credits / month",
    features: [
      "Unlimited client workspaces",
      "Pooled credits across clients",
      "Reusable templates & assets",
      "Cross-client pipeline",
      "Client-level reporting",
      "Seat management",
    ],
    cta: "Start Agency Workspace",
  },
  {
    name: "Premium Human Review",
    tagline: "Optional add-on",
    price: "£199",
    unit: "per review",
    best: "Optional only — never required",
    credits: "Adds expert review to one campaign",
    features: [
      "Senior strategist review of one pack",
      "Written recommendations",
      "One async revision pass",
    ],
    cta: "Add Human Review",
    addon: true,
  },
];

const faqs = [
  { q: "What are Campaign Credits?", a: "Campaign Credits are your allowance for AI-heavy actions like generating a full campaign pack, social pack, press release, video pack or email sequence. Browsing, editing, moving leads, exporting and reading reports are always free." },
  { q: "What happens if I run out of credits?", a: "Your workspace stays fully usable — campaigns, leads, reports and assets remain accessible. Only new AI generations pause. You can buy a credit top-up or upgrade plan in seconds." },
  { q: "Can I top up between cycles?", a: "Yes. Top-up packs add credits instantly and never expire while your plan is active." },
  { q: "What happens after Starter's 30 days?", a: "Your campaign pack and assets stay yours read-only. To run new generations, upgrade to Growth or buy another Starter." },
  { q: "Is human review required?", a: "No. Premium Human Review is a paid optional add-on you can buy from inside any campaign." },
  { q: "Can agencies share credits across clients?", a: "Yes — Agency Workspace pools its monthly credits across all client workspaces." },
];

const Pricing = () => (
  <>
    <SEO
      title="Pricing — Velocity Vision self-serve marketing platform"
      description="Self-serve pricing for businesses and agencies. Starter, Growth and Agency Workspace plans plus an optional Premium Human Review add-on."
      path="/pricing"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Choose the plan that fits how you launch
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl mx-auto">
              Self-serve pricing for businesses and agencies, with optional expert review when you want it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/app/billing">Start your first campaign <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`rounded-2xl p-7 shadow-card border flex flex-col ${p.highlight ? "bg-card border-accent/60 ring-1 ring-accent/30" : p.addon ? "bg-secondary border-border/50" : "bg-card border-border/50"}`}
              >
                {p.highlight && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/15 text-accent font-semibold mb-3">Most popular</span>
                )}
                {p.addon && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-foreground/10 text-foreground font-semibold mb-3">Optional add-on</span>
                )}
                <h3 className="font-display font-semibold text-xl text-foreground">{p.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{p.tagline}</p>
                <p className="mb-2">
                  <span className="text-4xl font-display font-bold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{p.unit}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-2">Best for: {p.best}</p>
                <p className="text-xs font-semibold text-accent mb-4">{p.credits}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={p.highlight ? "cta" : "outline"} asChild>
                  <Link to="/app/billing">{p.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background border-t border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Plans include Campaign Credits</h3>
            <p className="text-muted-foreground text-sm">Every plan includes a generous allowance of credits for AI-heavy actions: full campaign packs, social, press, video and email sequences. Browsing, editing, pipeline and reports are always free.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Scale with top-ups, not surprises</h3>
            <p className="text-muted-foreground text-sm">Need more in a busy month? Add a credit top-up in seconds — Small, Medium or Large. Top-ups never expire while your plan is active.</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Human review when you want it</h3>
            <p className="text-muted-foreground text-sm">Optional Premium Human Review (£199) adds a senior strategist's eyes to any campaign — never required, available from inside the workspace.</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
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

export default Pricing;
