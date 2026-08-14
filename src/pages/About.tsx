import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  CreditCard,
  ShieldCheck,
  Database,
  FileCheck,
  GitBranch,
  Users,
  Scale,
  Sparkles,
} from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import { SIGNUP_PATH } from "@/lib/signupPath";

const productCards = [
  {
    icon: Database,
    title: "Customer-provided data",
    desc: "Customers upload and organize business records they are authorized to use. Velocity Vision does not scrape or sell contact lists.",
  },
  {
    icon: Sparkles,
    title: "Complete campaign pack",
    desc: "One customer brief can generate strategy, landing & offer copy, email sequences, social content, a press release, video scripts, paid-ad copy and lead capture as editable campaign assets.",
  },
  {
    icon: GitBranch,
    title: "Controlled activation and outcomes",
    desc: "Customers review and approve assets, use governed email or Buffer social handoff where applicable, then manage replies and early opportunity records without a promised commercial result.",
  },
];

const operatingCards = [
  {
    icon: Users,
    title: "Self-serve software",
    desc: "Customers configure and operate their own workspace. Velocity Vision does not provide managed campaigns.",
  },
  {
    icon: CreditCard,
    title: "Published commercial terms",
    desc: "Pricing, billing cadence, access period, Campaign Credits, tax treatment and the payment provider are disclosed before purchase.",
  },
  {
    icon: FileCheck,
    title: "Published legal documents",
    desc: "The Legal Centre includes Terms, Customer Agreement, DPA, Privacy, Acceptable Use, Marketing Compliance, Security, SLA and Subprocessor information.",
  },
];

const About = () => (
  <>
    <SEO
      title="About Velocity Vision — Complete customer-controlled campaign software"
      description="Velocity Vision is self-serve B2B campaign software operated by Global Solutions Management LLC, combining customer-provided data, complete campaign-pack generation, controlled activation, follow-up and early pipeline records."
      path="/about"
    />
    <Navbar />
    <main className="pt-20">
      <section className="relative section-padding bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutHero}
            alt=""
            className="w-full h-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              About Velocity Vision
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Customer-controlled B2B campaign software operated by Global Solutions Management LLC
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed mb-5">
              Velocity Vision connects customer-provided business data, a complete AI-assisted campaign pack, controlled activation routes, follow-up and early pipeline in one self-serve workspace.
            </p>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              It does not scrape contacts, sell lists, provide managed campaigns, send automatically or guarantee compliance, deliverability, replies, sales, pipeline or revenue.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
              What the product does
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Start with approved business data and a campaign brief, create the working campaign assets, then review and control what is used or activated. Customers retain responsibility for data source, lawful basis, recipients, sender identity, content, suppression handling and every activation decision.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-card border border-border/50 rounded-xl p-8 shadow-card"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <card.icon className="text-accent" size={22} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
              <Globe2 size={14} /> International access
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
              Designed for business customers working across markets
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The website offers automated translation and supported display currencies. The English legal documents control, and the final transaction currency, tax treatment, payment provider and terms are confirmed before purchase.
            </p>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Customers remain responsible for laws applying to their organization, data, recipients, sender and activity in each relevant jurisdiction.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
              <Scale size={14} /> Company and operating structure
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
              One identifiable operator and a documented product stack
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Velocity Vision is operated by Global Solutions Management LLC, a company incorporated in the State of Delaware, United States. GSM is the legal owner and operating company behind the product.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {operatingCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-card border border-border/50 rounded-xl p-6 shadow-card"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <card.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Security and governance
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-5">
            Documented controls without absolute-security claims
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The product uses managed cloud services, authenticated routes, logical workspace separation, validation, rate limiting and published privacy, security and data-processing documents.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No internet service can guarantee absolute security or compliance. Customers remain responsible for credentials, users, data, connected services and exported records.
          </p>
        </div>
      </section>

      <section className="section-padding bg-hero text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Review the product, pricing and legal documents
          </h2>
          <p className="text-primary-foreground/75 mb-8 leading-relaxed">
            Free Preview has no live sending. Paid activation follows onboarding, applicable checks and the terms shown before purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to={SIGNUP_PATH}>
                Start Free Preview <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">Review pricing</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/legal">Review Legal Centre</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default About;
