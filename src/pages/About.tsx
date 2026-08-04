import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  Languages,
  CreditCard,
  ShieldCheck,
  Database,
  Lock,
  FileCheck,
  GitBranch,
  Users,
  Scale,
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

const heroBadges = [
  { icon: Globe2, label: "Global workspace" },
  { icon: Languages, label: "Multilingual site access" },
  { icon: CreditCard, label: "Multi-currency pricing" },
  { icon: ShieldCheck, label: "Governed activation" },
  { icon: Scale, label: "Legal stack live" },
  { icon: FileCheck, label: "DPA available" },
];

const loopCards = [
  {
    icon: Database,
    title: "Data into structure",
    desc: "Data Vault helps teams organise companies, contacts, segments and campaign-ready records in one governed workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Activation with controls",
    desc: "Sender verification, activation gates, daily caps and risky-record checks support safer outreach workflows.",
  },
  {
    icon: GitBranch,
    title: "Follow-up into pipeline",
    desc: "Follow-up handling and pipeline movement keep commercial activity connected after the first send.",
  },
];

const globalCards = [
  { icon: Languages, label: "Multilingual site access" },
  { icon: Globe2, label: "Automated translation where supported by the translation layer" },
  { icon: CreditCard, label: "Multi-currency pricing" },
  { icon: Scale, label: "International legal document stack" },
  { icon: FileCheck, label: "Delaware operating company" },
  { icon: Users, label: "Built for founders, teams and agencies" },
];

const softwareCards = [
  { icon: Database, title: "Self-serve workspace", desc: "Customers open, configure and operate their workspace directly — no managed campaign hand-off required." },
  { icon: Users, title: "Customer-controlled approvals", desc: "Sender verification, activation, sending and exports remain in the customer's hands." },
  { icon: GitBranch, title: "Agency and client workspace use", desc: "Agencies can run isolated client workspaces with pooled sending governance and cross-client visibility." },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Secure cloud infrastructure" },
  { icon: Lock, label: "Workspace separation" },
  { icon: Lock, label: "Encrypted secret handling" },
  { icon: ShieldCheck, label: "Security scanning" },
  { icon: ShieldCheck, label: "Hosting-layer request filtering" },
  { icon: FileCheck, label: "DPA available" },
  { icon: FileCheck, label: "Subprocessor List" },
  { icon: Scale, label: "Contact-page security reporting" },
];

const About = () => (
  <>
    <SEO
      title="About Velocity Vision — Global AI commercial workspace"
      description="Velocity Vision is an international-first AI commercial workspace for Data Vault, quality review, governed activation, outreach assets, follow-up and pipeline."
      path="/about"
    />
    <Navbar />
    <main className="pt-20">
      {/* Hero */}
      <section className="relative section-padding bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="" className="w-full h-full object-cover opacity-25" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">About Velocity Vision</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Built for global teams turning data into governed growth.
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Velocity Vision is an international-first AI commercial workspace for founders, lean teams and agencies. It brings Data Vault, quality review, outreach assets, governed activation, follow-up and pipeline into one self-serve platform — built for customers working across markets, languages and currencies.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {heroBadges.map((b) => (
                <span key={b.label} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs text-primary-foreground">
                  <b.icon size={14} className="text-accent" /> {b.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 1 — Why Velocity Vision exists */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Why Velocity Vision exists</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-12">
              Growth teams often work across spreadsheets, disconnected tools, agencies, inboxes and manual follow-up. That creates risk, delay and lost opportunities. Velocity Vision turns that activity into a repeatable operating loop: upload data, review quality, generate assets, activate safely, work follow-up and move real opportunities into pipeline.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loopCards.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="bg-card border border-border/50 rounded-xl p-8 shadow-card">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <item.icon className="text-accent" size={22} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Global from day one */}
      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
              <Globe2 size={14} /> Global from day one
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">A platform built for international use</h2>
            <p className="text-muted-foreground leading-relaxed">
              Velocity Vision is designed for international buyers, distributed teams and agencies working across markets. The public website and Legal Centre can be viewed through automated translation, pricing supports multiple currencies, and the legal document stack is built for international SaaS use.
            </p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Automated translations are provided for convenience only. The English version of legal documents controls if there is any conflict, ambiguity, inconsistency, error or difference between versions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {globalCards.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card">
                <c.icon size={18} className="text-accent shrink-0" />
                <span className="text-sm text-foreground font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Software first */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">Software first, not agency dependent</h2>
            <p className="text-muted-foreground leading-relaxed">
              Velocity Vision is a self-serve software platform. The platform is the core product: customers control their data, users, connected services, approvals, activation decisions and exported data. Human support may be available where offered, but the product is designed to deliver value without depending on a managed campaign service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {softwareCards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <c.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Trust, security and governance */}
      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
              <ShieldCheck size={14} /> Trust, security and governance
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">A framework designed for commercial use</h2>
            <p className="text-muted-foreground leading-relaxed">
              Velocity Vision is supported by managed cloud infrastructure, authentication controls, workspace separation, encrypted secret handling, security scanning, hosting-layer request filtering, privacy terms, data processing terms, a Subprocessor List, Cookie Policy, Platform Security Policy and Service Level Agreement.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card px-3.5 py-3 shadow-card">
                <b.icon size={16} className="text-accent shrink-0" />
                <span className="text-xs md:text-sm text-foreground font-medium">{b.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6 max-w-3xl leading-relaxed">
            Security and compliance controls support safer use of the platform. Customers remain responsible for their own data, users, connected services, lawful basis, outreach decisions and exported data.
          </p>
        </div>
      </section>

      {/* Section 5 — Who operates */}
      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Who operates Velocity Vision</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Velocity Vision is operated by <span className="text-foreground font-medium">Global Solutions Management LLC</span>, incorporated in the State of Delaware, United States. The platform is built as part of a global digital operating portfolio focused on practical AI systems for commercial execution, automation and international business workflows.
            </p>
            <p>
              Velocity Vision operates at <span className="text-foreground font-medium">velocity-outreach.com</span> and is designed for international use, subject to applicable terms, policies, customer responsibilities and local law.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Build your commercial workspace.</h2>
          <p className="text-primary-foreground/75 mb-8 leading-relaxed">
            Start with your data, review what is usable, create the assets, activate safely and move warm contacts into pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">View pricing</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/legal">Read the Legal Centre</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default About;
