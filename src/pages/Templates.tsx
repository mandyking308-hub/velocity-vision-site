import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Rocket, Heart, Tag, RefreshCw } from "lucide-react";

const templates = [
  {
    icon: Target,
    name: "Business relationship workflow",
    desc: "A reusable structure for customer-authorised business records, editable outreach drafts, activation review and follow-up records.",
  },
  {
    icon: Rocket,
    name: "Product announcement workflow",
    desc: "Editable email, social, press and video drafts prepared from a customer brief for review before scheduling, distribution or activation.",
  },
  {
    icon: Heart,
    name: "Existing-contact education workflow",
    desc: "A customer-reviewed sequence structure for existing business relationships, with follow-up and reply-state records.",
  },
  {
    icon: Tag,
    name: "Time-limited offer workflow",
    desc: "Editable offer and reminder drafts linked to customer-reviewed records, timing settings and activation controls.",
  },
  {
    icon: RefreshCw,
    name: "Existing-relationship review workflow",
    desc: "A structure for reviewing source, suppression status and suitability before deciding whether an existing business relationship should be contacted again.",
  },
];

const Templates = () => (
  <>
    <SEO
      title="Templates — Customer-reviewed workflow structures | Velocity Vision"
      description="Reusable workflow structures for customer-authorised data, editable AI-assisted drafts, sender verification, activation review, follow-up records and early opportunity administration."
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
              Reusable structures for customer-controlled workflows
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">
              Each template provides an editable structure for customer-authorised records, AI-assisted drafts, sender settings, activation review and follow-up administration.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">
              Templates are not prospect databases, legal approval, managed campaigns or guaranteed commercial methods. Customers review and approve every record, output and activation decision.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
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
                  <Link to="/auth">
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
