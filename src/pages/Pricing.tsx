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
    best: "One guided campaign launch",
    features: [
      "Guided brief",
      "1 campaign strategy pack",
      "Landing page + offer copy",
      "Email, social and ad drafts",
      "Press release",
      "Video pack",
      "Lead-capture checklist",
      "Dashboard access for 30 days",
    ],
    cta: "Start Starter",
  },
  {
    name: "Growth",
    tagline: "Monthly Campaign Engine",
    price: "£249",
    unit: "per month",
    best: "Businesses running campaigns continuously",
    highlight: true,
    features: [
      "Recurring campaign credits",
      "Repeat campaigns from templates",
      "Lead magnet / offer builder",
      "Follow-up sequence drafts",
      "Pipeline tracking",
      "Auto-generated monthly performance review",
      "Full dashboard access",
    ],
    cta: "Start Growth",
  },
  {
    name: "Agency Workspace",
    tagline: "Multi-client workspace",
    price: "£499",
    unit: "per month",
    best: "Agencies, consultants, fractional CMOs",
    features: [
      "Multiple client workspaces",
      "Campaign template library",
      "Reusable assets",
      "Branded reporting exports",
      "Cross-client pipeline",
      "Seat management",
    ],
    cta: "Start Agency Workspace",
  },
  {
    name: "Premium Human Review",
    tagline: "Optional Add-on",
    price: "£199",
    unit: "per review",
    best: "Optional only — never required",
    features: [
      "Strategist review",
      "Written recommendations",
      "1 async revision pass",
    ],
    cta: "Add Human Review",
    addon: true,
  },
];

const faqs = [
  { q: "Do I need a call before buying?", a: "No. Sign up, pick a plan and start. Calls are only for enterprise or large agency volume." },
  { q: "What happens after payment?", a: "You go straight into guided onboarding inside your new workspace and start your first campaign brief." },
  { q: "What happens when Starter access ends?", a: "Your campaign pack and assets stay yours. You can upgrade to Growth to keep the workspace live and run new campaigns." },
  { q: "Is human review required?", a: "No. Human Review is a paid optional add-on. The product works fully without it." },
  { q: "Can agencies manage multiple clients?", a: "Yes. Agency Workspace gives you isolated client workspaces, shared templates and branded reporting." },
  { q: "Are there usage limits or campaign credits?", a: "Yes — each plan includes a fair-use campaign credit allowance. You can top up, upgrade or pause at any time." },
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
                <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
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
                <p className="text-xs text-muted-foreground mb-5">Best for: {p.best}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={16} className="text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={p.highlight ? "cta" : "outline"} asChild>
                  <Link to="/auth">{p.cta}</Link>
                </Button>
              </motion.div>
            ))}
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
