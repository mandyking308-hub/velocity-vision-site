import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Rocket, Heart, Tag, RefreshCw } from "lucide-react";

const templates = [
  { icon: Target, name: "Lead generation campaign", desc: "Capture qualified interest with an offer, landing page, lead form and follow-up sequence." },
  { icon: Rocket, name: "Launch campaign", desc: "Announce a new product, service or offer with coordinated landing page, social pack, press release and video pack." },
  { icon: Heart, name: "Nurture campaign", desc: "Stay in front of warm leads with multi-step educational emails and supporting social posts." },
  { icon: Tag, name: "Promo campaign", desc: "Drive short-window conversion with a clear offer, urgency-led copy and lead capture." },
  { icon: RefreshCw, name: "Re-engagement campaign", desc: "Win back lapsed customers or cold leads with a refreshed offer and tailored follow-up." },
];

const Templates = () => (
  <>
    <SEO
      title="Templates — Pre-built marketing campaign templates | Velocity Vision"
      description="Lead generation, launch, nurture, promo and re-engagement campaign templates — ready to brief, customise and launch from your workspace."
      path="/templates"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Templates</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Start from a proven campaign, not a blank page
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Pick a template, answer the brief, generate the pack. Every template is editable end-to-end inside your workspace.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
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
                  <Link to="/auth">Use this template <ArrowRight size={16} /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Templates;
