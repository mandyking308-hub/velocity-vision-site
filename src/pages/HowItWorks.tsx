import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const steps = [
  { n: "01", title: "Pick the goal", desc: "Lead gen, launch, nurture, promo or re-engagement — choose the campaign type." },
  { n: "02", title: "Complete the brief", desc: "Short guided questions about audience, offer, voice and constraints." },
  { n: "03", title: "Generate the campaign pack", desc: "Strategy, copy, assets and follow-up generated inside your workspace." },
  { n: "04", title: "Edit and launch", desc: "Refine anything you want, then publish and start capturing leads." },
  { n: "05", title: "Track and improve", desc: "Pipeline updates in real time, monthly report tells you what to repeat." },
];

const outputs = [
  "Strategy summary", "Landing page copy", "Offer copy", "Social media pack",
  "Email follow-up", "Ad variants", "Press release", "Video pack",
  "Lead form", "Pipeline", "Monthly review",
];

const HowItWorks = () => (
  <>
    <SEO
      title="How it works — Velocity Vision self-serve campaign launchpad"
      description="A guided workflow that takes you from campaign idea to live assets, lead capture and reporting — without hiring an agency."
      path="/how-it-works"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">How it works</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">How Velocity Vision works</h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              A guided workflow that takes you from campaign idea to live assets, lead capture and reporting — without hiring an agency.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
              >
                <p className="text-accent font-display font-bold text-2xl mb-3">{s.n}</p>
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">What you get</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">Every campaign pack is delivered inside your workspace, ready to edit and launch.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outputs.map((o) => (
              <div key={o} className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-4 py-3">
                <Check className="text-accent shrink-0" size={16} />
                <span className="text-sm text-foreground">{o}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Expert eyes, only if you want them</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Premium Human Review is a paid, optional add-on. A strategist reviews your campaign pack and sends back written recommendations and one revision pass. It is never required, and never blocks you launching.
          </p>
          <Button variant="cta" asChild>
            <Link to="/pricing">See pricing <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default HowItWorks;
