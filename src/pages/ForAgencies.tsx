import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck, Coins, Layers, Inbox, Eye } from "lucide-react";

const benefits = [
  { icon: Layers, title: "One workspace per client", desc: "Isolated data, isolated activation, isolated pipeline. No cross-client contamination, no context-switching tax." },
  { icon: Coins, title: "Pooled credits across the account", desc: "Agency Workspace credits flow across all client workspaces — use them where the work lands that month." },
  { icon: ShieldCheck, title: "Pooled sending governance", desc: "A single 1,000/day pooled ceiling and shared risky-record limits protect deliverability across every client." },
  { icon: Inbox, title: "Replies & pipeline per client", desc: "Inbound replies, follow-up states and opportunity movement, tracked per client — without bolting on another CRM." },
  { icon: Eye, title: "Cross-client visibility", desc: "See what's active, what's stuck and where pipeline is moving across your whole book of clients." },
  { icon: Building2, title: "Repeatable delivery", desc: "Reusable templates, segments and cadences. Operators ship the work; they don't reinvent the workflow each time." },
];

const ForAgencies = () => (
  <>
    <SEO
      title="For Agencies — Multi-client commercial workspace | Velocity Vision"
      description="Run every client from one account: isolated workspaces, pooled credits, pooled sending governance and cross-client pipeline visibility."
      path="/for-agencies"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Agencies</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              One account. One workspace per client. No tool sprawl.
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Manage data, activation, replies and pipeline per client — with pooled credits, pooled sending governance and clear visibility across the whole book.
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10 max-w-2xl">How agencies operationalise delivery</h2>
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
