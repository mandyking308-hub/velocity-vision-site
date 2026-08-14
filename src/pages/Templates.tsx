import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Rocket, Heart, Tag, RefreshCw } from "lucide-react";
import { SIGNUP_PATH } from "@/lib/signupPath";

const templates = [
  {
    icon: Target,
    name: "Business relationship campaign",
    desc: "A reusable structure connecting customer-authorized business records, the campaign brief, editable assets, activation review and follow-up records.",
  },
  {
    icon: Rocket,
    name: "Product launch campaign",
    desc: "Start from one brief and prepare the campaign strategy, landing & offer copy, email, social, press, video, paid-ad copy and lead capture for review before use.",
  },
  {
    icon: Heart,
    name: "Existing-contact education campaign",
    desc: "A customer-reviewed campaign structure for existing business relationships, combining relevant campaign assets with follow-up and reply-state records.",
  },
  {
    icon: Tag,
    name: "Time-limited offer campaign",
    desc: "Connect offer and landing copy, email and supporting campaign assets to customer-reviewed records, timing settings and activation controls.",
  },
  {
    icon: RefreshCw,
    name: "Existing-relationship review campaign",
    desc: "Review source, suppression status and suitability before deciding whether an existing business relationship should enter a new customer-controlled campaign.",
  },
];

const Templates = () => (
  <>
    <SEO
      title="Campaign Templates — Reusable customer-controlled structures | Velocity Vision"
      description="Reusable campaign structures connecting customer-authorized data, a complete campaign pack, activation review, follow-up and early opportunity records."
      path="/templates"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Templates
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Reusable campaign structures, not disconnected copy templates
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">
              Start from a reviewed campaign structure that keeps the audience, brief, working assets, activation choices and follow-up connected in the same workspace.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">
              Templates are not prospect databases, legal approval, managed campaigns or guaranteed commercial methods. Customers review and approve every record, output and activation decision.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to={SIGNUP_PATH}>
                Start Free Preview <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-card border border-border/50 rounded-xl p-7 shadow-card flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <template.icon className="text-accent" size={22} />
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  {template.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                  {template.desc}
                </p>
                <Button variant="outline" asChild className="self-start">
                  <Link to={SIGNUP_PATH}>
                    Review in Free Preview <ArrowRight size={16} />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-10 max-w-3xl">
            Templates support repeatable product configuration. They do not determine lawful basis, recipient suitability, message accuracy, sender authority, compliance or expected results.
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Templates;
