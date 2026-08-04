import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Upload,
  Rocket,
  Send,
  ShieldCheck,
  TrendingUp,
  Coins,
} from "lucide-react";

const topics = [
  {
    icon: Sparkles,
    title: "How Campaign Credits work",
    body: "Campaign Credits are non-cashable product-usage units for AI-intensive actions such as draft packs, social drafts, press drafts, video scripts and follow-up assets. Access and usage remain subject to the applicable plan terms.",
  },
  {
    icon: Upload,
    title: "How to upload authorised data",
    body: "Use CSV or spreadsheet upload only for business records your organisation is authorised to process. Data Vault flags support customer review and do not confirm lawful basis, deliverability or compliance.",
  },
  {
    icon: Rocket,
    title: "How to prepare a first draft workflow",
    body: "Choose a business objective, review a small authorised record set and generate editable draft assets. Free Preview supports product review without live sending.",
  },
  {
    icon: ShieldCheck,
    title: "How to review AI outputs",
    body: "Every output remains a draft. Review tone, factual accuracy, claims, recipients and legal requirements before deciding whether it should be used.",
  },
  {
    icon: Send,
    title: "Why live sending is gated",
    body: "Free Preview does not enable live sending. Eligible paid activation follows onboarding, sender configuration, applicable product checks and an authorised-user decision. These controls do not guarantee deliverability or legal compliance.",
  },
  {
    icon: TrendingUp,
    title: "Moving from Free Preview to a paid plan",
    body: "Review the published Starter, Growth and Agency Workspace terms. The final product, price, currency, tax treatment, payment provider and applicable terms are confirmed before purchase.",
  },
  {
    icon: Coins,
    title: "Requesting additional Campaign Credits",
    body: "Use the published Contact route or available account route. Additional credits are not activated until the commercial terms and payment route have been confirmed.",
  },
];

export default function GettingStarted() {
  return (
    <>
      <SEO
        title="Getting started — Velocity Vision"
        description="Guidance for reviewing a first workspace, uploading customer-authorised data, preparing editable drafts and understanding Campaign Credits and paid activation."
        path="/help/getting-started"
      />
      <Navbar />
      <main className="pt-24">
        <section className="section-padding bg-hero">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
                Getting started
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
                Review the workspace before paid activation
              </h1>
              <p className="text-primary-foreground/75 text-lg max-w-3xl">
                Start with Free Preview, use a small authorised record set and review editable draft functions. Free Preview has no live sending and no automatic paid upgrade.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="panel-wrap">
          <div className="panel-blue">
            <section className="section-padding">
              <div className="max-w-5xl mx-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  {topics.map(({ icon: Icon, title, body }, index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-accent" />
                        <h2 className="font-display font-semibold">{title}</h2>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed">
                        {body}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-xl bg-white border border-white/40 shadow-card text-foreground">
                  <h2 className="font-display font-semibold mb-1">Need more help?</h2>
                  <p className="text-sm text-foreground/75">
                    Use the public Contact page for product, billing, privacy, security, abuse, marketing-compliance or legal enquiries.
                  </p>
                  <p className="text-sm text-foreground/75 mt-2">
                    <Link to="/contact" className="text-accent underline">
                      Open the Contact page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
