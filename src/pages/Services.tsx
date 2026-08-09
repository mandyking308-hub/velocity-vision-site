import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Database,
  Sparkles,
  ShieldCheck,
  Inbox,
  GitBranch,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import servicesHero from "@/assets/services-hero.jpg";

const capabilities = [
  {
    icon: Database,
    title: "Data Vault",
    overview:
      "Upload customer-provided business data, map fields, identify duplicates and review records before any activation decision.",
    features: [
      "CSV and spreadsheet upload",
      "Field mapping and deduplication",
      "Quality and risk review",
      "Customer-controlled segmentation",
    ],
    workflow: "Upload → Map → Review → Segment",
  },
  {
    icon: Sparkles,
    title: "AI-assisted asset drafting",
    overview:
      "Generate editable campaign materials from a customer brief while keeping every output in draft until the customer reviews it.",
    features: [
      "Email sequence drafts",
      "Social post drafts",
      "Press release drafts",
      "Video scripts and follow-up copy",
    ],
    workflow: "Brief → Generate → Review → Edit",
  },
  {
    icon: ShieldCheck,
    title: "Governed activation",
    overview:
      "Connect and verify the customer's own sender, apply plan limits and require an explicit customer decision before anything is activated.",
    features: [
      "Sender verification",
      "Daily send limits",
      "Risky-record controls",
      "Customer approval before activation",
    ],
    workflow: "Verify → Check → Approve → Activate",
  },
  {
    icon: Inbox,
    title: "Follow-up workspace",
    overview:
      "Organize replies and next actions in one workspace so customers can manage follow-up without relying on a shared spreadsheet or disconnected inbox process.",
    features: [
      "Reply and follow-up states",
      "Snooze and action queues",
      "Warm and dormant status",
      "Customer-managed next actions",
    ],
    workflow: "Review → Respond → Snooze → Follow up",
  },
  {
    icon: GitBranch,
    title: "Early pipeline",
    overview:
      "Move customer-selected warm contacts into an early pipeline and track stage, value and next action without presenting software activity as guaranteed revenue.",
    features: [
      "Opportunity stages",
      "Value and status tracking",
      "Activity history",
      "CRM export when required",
    ],
    workflow: "Qualify → Move → Track → Export",
  },
  {
    icon: Layers,
    title: "Agency workspaces",
    overview:
      "Give agencies separate client workspaces with isolated data, customer-controlled activation, pooled Campaign Credits and account-wide visibility of send usage.",
    features: [
      "Isolated client workspaces",
      "Pooled Campaign Credits",
      "Account-wide send-usage visibility and the plan's daily send ceiling",
      "Cross-workspace visibility",
    ],
    workflow: "Create → Isolate → Govern → Review",
  },
];

const Services = () => (
  <>
    <SEO
      title="Platform Capabilities — Velocity Vision"
      description="Explore the self-serve Velocity Vision software workspace: customer-provided data review, AI-assisted drafts, governed activation, follow-up and early pipeline."
      path="/services"
    />
    <Navbar />
    <main className="pt-20">
      <section className="relative section-padding bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={servicesHero}
            alt=""
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Platform capabilities
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">
              One self-serve workspace for governed commercial activity
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-3xl leading-relaxed">
              Velocity Vision helps businesses organize their own contact data, prepare AI-assisted drafts, approve governed activation, manage follow-up and track early pipeline from one software workspace.
            </p>
            <p className="text-primary-foreground/70 text-sm max-w-3xl mt-5 leading-relaxed">
              Velocity Vision does not scrape contact data, sell lists, provide managed campaigns or send automatically. Customers provide lawfully obtained business data, connect their own sender and remain responsible for every review, approval and activation decision.
            </p>
          </motion.div>
        </div>
      </section>

      {capabilities.map((capability, index) => (
        <section
          key={capability.title}
          className={`section-padding ${index % 2 === 0 ? "bg-background" : "bg-secondary"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <capability.icon className="text-accent" size={24} />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  {capability.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {capability.overview}
                </p>
                <p className="text-sm font-semibold text-accent">
                  Software workflow: {capability.workflow}
                </p>
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">
                  Included functionality
                </h3>
                <ul className="space-y-3">
                  {capability.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      <section className="section-padding bg-hero text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-5">
            Review the product before choosing a paid plan
          </h2>
          <p className="text-primary-foreground/75 mb-8">
            Start with the Free Preview or review the published plans, included functionality, billing cadence and usage limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Start your workspace <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Services;
