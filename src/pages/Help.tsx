import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const sections = [
  {
    title: "Getting started",
    items: [
      { q: "How do I create my first campaign?", a: "Sign up, pick a campaign type, complete the guided brief and your campaign pack is generated inside your workspace." },
      { q: "Do I need anything before I start?", a: "Just a clear goal and an offer. The platform handles the structure, copy and assets." },
    ],
  },
  {
    title: "How billing works",
    items: [
      { q: "What plans are available?", a: "Starter (one-off), Growth (monthly), Agency Workspace (monthly) and the Premium Human Review add-on. See the pricing page for full details." },
      { q: "Can I upgrade, downgrade or pause?", a: "Yes. You can change or pause your plan at any time from your workspace settings." },
      { q: "Are there refunds?", a: "Refunds are handled case by case for the first 7 days on monthly plans. Contact support to discuss." },
    ],
  },
  {
    title: "How campaign packs work",
    items: [
      { q: "What's inside a campaign pack?", a: "Strategy summary, landing page copy, offer copy, email sequence, ad variants, social pack, press release, video pack and a lead capture flow." },
      { q: "Can I edit the outputs?", a: "Yes. Everything is editable inside the workspace — nothing is locked." },
      { q: "Can I regenerate parts of the pack?", a: "Yes. You can regenerate individual sections without rebuilding the whole campaign." },
    ],
  },
  {
    title: "How agency workspaces work",
    items: [
      { q: "How are clients isolated?", a: "Each client has their own workspace with separate campaigns, assets and reporting. You switch between them from one login." },
      { q: "Can I reuse templates across clients?", a: "Yes. Save any campaign as a template and re-deploy it inside any client workspace." },
      { q: "Can I export branded reports?", a: "Yes. Monthly performance reports can be exported under your agency brand." },
    ],
  },
  {
    title: "What happens when credits run out",
    items: [
      { q: "Will I lose my campaigns?", a: "No. Your workspace, campaigns, templates and assets stay intact." },
      { q: "What are my options?", a: "Top up credits, upgrade your plan, or pause until you're ready to run the next campaign." },
    ],
  },
  {
    title: "How reports work",
    items: [
      { q: "How often are reports generated?", a: "A performance review is auto-generated monthly, plus on-demand exports any time you need them." },
      { q: "What's in the report?", a: "Pipeline value, lead source breakdown, campaign performance, and recommendations for what to repeat or drop." },
    ],
  },
];

const Help = () => (
  <>
    <SEO
      title="Help — Velocity Vision knowledge base"
      description="Knowledge base for Velocity Vision: getting started, billing, campaign packs, agency workspaces, credits and reports."
      path="/help"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Help</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4">Knowledge base</h1>
            <p className="text-primary-foreground/75 text-lg">Practical answers to the questions users actually ask.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">{s.title}</h2>
              <Accordion type="single" collapsible>
                {s.items.map((it, i) => (
                  <AccordionItem key={i} value={`${s.title}-${i}`}>
                    <AccordionTrigger className="text-left font-display">{it.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Help;
