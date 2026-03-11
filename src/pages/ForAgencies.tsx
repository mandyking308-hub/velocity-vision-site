import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight, Building2, BarChart3, Users, Layers, Shield, Zap
} from "lucide-react";

const benefits = [
  { icon: Layers, title: "Multiple Client Workspaces", desc: "Manage all your client campaigns from a single agency account. Create separate workspaces for each client with dedicated assets, contacts, and reporting." },
  { icon: BarChart3, title: "Centralised Campaign Analytics", desc: "View performance data across all client campaigns in one dashboard. Compare results, optimise budgets, and demonstrate ROI to every client." },
  { icon: Users, title: "Team Collaboration", desc: "Add unlimited team members to your agency account. Assign campaigns, manage workflows, and keep everyone aligned across client projects." },
  { icon: Shield, title: "White-Label Reporting", desc: "Generate branded reports for each client workspace. Present campaign results under your agency's identity with professional analytics." },
  { icon: Zap, title: "Campaign Engine at Scale", desc: "Launch email, social, paid, PR, and influencer campaigns for all your clients. Our campaign engine handles volume without sacrificing quality." },
  { icon: Building2, title: "Unified Billing", desc: "One subscription covers your entire agency. Bill your own clients independently — we handle your platform subscription, you handle your client relationships." },
];

const ForAgencies = () => (
  <>
    <Navbar />
    <main className="pt-20">
      {/* Hero */}
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Agencies</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Run campaigns for <span className="text-gradient">every client</span> in one platform.
            </h1>
            <p className="text-primary-foreground/70 text-lg mb-8 leading-relaxed">
              Velocity Influence gives agencies, consultants, and marketing firms the tools to manage multiple client campaigns, centralise analytics, and scale without complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/book-demo">Start Agency Plan <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/book-demo">Book a Platform Demo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Agencies */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Why Agencies Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Everything your agency needs, nothing it doesn't</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From boutique consultancies to full-service agencies — one platform that grows with you.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-8 shadow-card border border-border/50 hover:border-accent/30 transition-all">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <b.icon className="text-accent" size={24} />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-12">From sign-up to campaign launch in minutes</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Create your agency account and choose the Agency Plan." },
              { step: "2", title: "Add Clients", desc: "Create client workspaces for each of your clients." },
              { step: "3", title: "Launch Campaigns", desc: "Build and deploy campaigns per client workspace." },
              { step: "4", title: "Report & Scale", desc: "Track analytics per client and scale across your portfolio." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
                <h3 className="font-display font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-hero">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Ready to scale your agency?</h2>
            <p className="text-primary-foreground/70 text-lg mb-8">Join agencies worldwide using Velocity Influence to manage client campaigns at scale.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/book-demo">Start Agency Plan <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/book-demo">Book a Demo</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default ForAgencies;
