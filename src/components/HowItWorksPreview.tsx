import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, ShieldCheck, GitBranch } from "lucide-react";

const steps = [
  {
    n: "step-one",
    number: "01",
    icon: Upload,
    title: "Organise customer-authorised business data",
    desc: "Upload CSV or spreadsheet records, map fields and organise companies, contacts and segments inside the Data Vault.",
    details: ["Data Vault", "Field mapping", "Duplicate checks", "Records requiring review"],
  },
  {
    n: "step-two",
    number: "02",
    icon: ShieldCheck,
    title: "Prepare drafts and apply activation controls",
    desc: "Generate editable email, social, press and video drafts from a customer brief, verify the customer's sender and require an authorised-user decision before activation.",
    details: ["AI-assisted drafts", "Sender verification", "Cadence settings", "Customer approval"],
  },
  {
    n: "step-three",
    number: "03",
    icon: GitBranch,
    title: "Record follow-up and early pipeline activity",
    desc: "Track reply states, customer-managed next actions and customer-selected opportunity records without treating activity as a guaranteed commercial outcome.",
    details: ["Follow-up records", "Reply states", "Opportunity records", "Activity summary"],
  },
];

const HowItWorksPreview = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div aria-hidden className="blob blob-pink w-72 h-72 -top-24 -right-16 animate-floaty" />
    <div aria-hidden className="blob blob-blue w-96 h-96 -bottom-32 -left-24 animate-drifty" />
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          How it works
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Customer data in, editable drafts prepared, authorised activity recorded
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          The workflow separates data review, draft preparation, sender verification, customer approval, activation and follow-up records so responsibility remains clear at every step.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {steps.map((step, index) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="bg-white/95 border border-white/70 rounded-2xl p-7 shadow-elevated hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <step.icon className="text-accent" size={22} />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                  {step.n}
                </p>
                <p className="text-accent font-display font-bold text-2xl">
                  {step.number}
                </p>
              </div>
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-3 leading-tight">
              {step.title}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
              {step.desc}
            </p>
            <div className="flex flex-wrap gap-2">
              {step.details.map((detail) => (
                <span
                  key={detail}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground/80"
                >
                  {detail}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Button variant="cta" size="lg" asChild>
          <Link to="/how-it-works">
            Review the full workflow <ArrowRight size={18} />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Software flags and controls support customer review; they do not provide legal approval, compliance sign-off, deliverability guarantees or promised commercial results.
        </p>
      </div>
    </div>
  </section>
);

export default HowItWorksPreview;
