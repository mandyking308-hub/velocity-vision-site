import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, BarChart3, Users, Layers, FileDown, Eye } from "lucide-react";

const benefits = [
  { icon: Layers, title: "Multiple client workspaces", desc: "Run every client from one account — isolated workspaces, shared templates, no context-switching tax." },
  { icon: FileDown, title: "Repeatable templates", desc: "Save winning campaigns as templates and re-deploy across clients in minutes." },
  { icon: Users, title: "Reusable assets", desc: "Build a shared asset library — copy frameworks, offers, sequences — and stop rewriting from scratch." },
  { icon: BarChart3, title: "Branded reporting exports", desc: "Auto-generated monthly reports under your agency brand — no analyst time required." },
  { icon: Eye, title: "Cross-client campaign visibility", desc: "One dashboard across every active campaign — never lose track of what's running where." },
  { icon: Building2, title: "Reduced delivery friction", desc: "Less calls, fewer handovers, faster turnarounds. Your team ships campaigns, not status updates." },
];

const ForAgencies = () => (
  <>
    <SEO
      title="For Agencies — One workspace to run every client | Velocity Vision"
      description="Velocity Vision for agencies: multi-client workspaces, reusable templates, branded reporting and a self-serve campaign engine that scales delivery without scaling headcount."
      path="/for-agencies"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Agencies</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              One workspace to run campaigns for every client
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Multi-client workspaces, repeatable templates, reusable assets and branded reporting — so your team ships more, faster, without burning more hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start Agency Workspace <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Talk to us about volume</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10 max-w-2xl">Built for delivery teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <b.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default ForAgencies;
