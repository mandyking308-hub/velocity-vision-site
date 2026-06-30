import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Rocket, Heart, Tag, RefreshCw } from "lucide-react";

const templates = [
  { icon: Target, name: "Outbound lead generation", desc: "Safe segment + multi-step outreach + reply queue + pipeline promotion. A repeatable template you can run every week." },
  { icon: Rocket, name: "Launch template", desc: "Coordinated outreach, social pack, press release and video pack — activated together for a product or offer launch." },
  { icon: Heart, name: "Nurture & re-warm", desc: "Multi-step educational sequence for warm contacts, with reply tracking and follow-up states built in." },
  { icon: Tag, name: "Promo & offer push", desc: "Short-window activation with urgency-led copy, safe segment limits and pipeline tracking for converted interest." },
  { icon: RefreshCw, name: "Dormant re-engagement", desc: "Re-surface lapsed customers and cold contacts with a refreshed offer, tailored follow-up and stuck-deal alerts." },
];

const Templates = () => (
  <>
    <SEO
      title="Templates — Reusable commercial templates | Velocity Vision"
      description="Templates aren't starter packs — they're repeatable commercial workflows that connect data, activation, cadence, replies and pipeline."
      path="/templates"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Templates</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Start from a proven template, not a blank workspace
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Each template is a full commercial workflow — data segment, activation rules, outreach pack, cadence, follow-up and pipeline routing — ready to adapt and reuse.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="bg-card border border-border/50 rounded-xl p-7 shadow-card flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <t.icon className="text-accent" size={22} />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">{t.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">{t.desc}</p>
                <Button variant="outline" asChild className="self-start">
                  <Link to="/auth">Start with this template <ArrowRight size={16} /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-10 max-w-3xl">
            Every template connects directly to your Data Vault, governed activation, cadence scheduler, replies inbox and pipeline — so the workflow runs end-to-end inside the workspace.
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Templates;
