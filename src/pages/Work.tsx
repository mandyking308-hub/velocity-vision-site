import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const useCases = [
  {
    tag: "Product launch planning",
    title: "Prepare a structured launch workflow",
    objective:
      "Organise customer-provided business and media contacts around a defined launch brief.",
    workflow:
      "Upload authorised records → review duplicates and risk states → generate editable email, social and press drafts → approve a safe segment → manage follow-up in the workspace.",
    control:
      "The customer reviews all data and content, verifies the sender and decides whether and when to activate.",
  },
  {
    tag: "Founder-led business development",
    title: "Keep daily follow-up in one place",
    objective:
      "Give a founder or lean commercial team a repeatable way to review contacts and next actions without relying on spreadsheets and inbox memory.",
    workflow:
      "Review an approved segment → prepare editable drafts → activate within plan limits → record replies and follow-up states → move customer-selected warm contacts into early pipeline.",
    control:
      "Velocity Vision does not identify prospects, promise replies or operate the campaign on the customer's behalf.",
  },
  {
    tag: "New market test",
    title: "Separate activity by market or proposition",
    objective:
      "Keep customer-provided records, drafts and follow-up organised when testing a new region, vertical or product proposition.",
    workflow:
      "Create a dedicated workspace or segment → prepare multilingual draft variants → review local requirements → approve activation → compare recorded activity by market.",
    control:
      "The customer remains responsible for lawful basis, local marketing rules, sender identity and the suitability of every recipient.",
  },
  {
    tag: "Existing database review",
    title: "Review records before any outreach decision",
    objective:
      "Bring an existing business database into a governed review process before using it for commercial activity.",
    workflow:
      "Import customer-owned data → map fields → identify duplicates and risky records → create approved segments → retain blocked and suppressed records outside activation.",
    control:
      "Velocity Vision does not scrape, sell or provide contact lists, and software quality flags are not legal approval.",
  },
  {
    tag: "Dormant business relationships",
    title: "Organise a cautious re-engagement review",
    objective:
      "Help a customer assess existing business relationships and decide which records may be appropriate for renewed contact.",
    workflow:
      "Identify an existing relationship segment → check source and suppression status → prepare editable copy → approve a limited activation → record responses and opt-outs.",
    control:
      "No contact is automatically approved, and Velocity Vision does not guarantee deliverability, compliance, replies or revenue.",
  },
  {
    tag: "Agency workspaces",
    title: "Keep client activity isolated",
    objective:
      "Allow an agency or fractional team to operate separate software workspaces without mixing client data or sender decisions.",
    workflow:
      "Create one workspace per client → retain isolated data and drafts → apply per-workspace activation controls → use pooled account limits → review activity across the account.",
    control:
      "The agency must have client authority and remains responsible for each client's lawful data, content, sender and activation decisions.",
  },
];

const Work = () => (
  <>
    <SEO
      title="Illustrative Software Workflows — Velocity Vision"
      description="Illustrative ways customers can configure the self-serve Velocity Vision workspace for data review, AI-assisted drafts, governed activation, follow-up and early pipeline."
      path="/work"
    />
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              Illustrative workflows
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-4xl">
              Examples of how customers can configure the workspace
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-3xl leading-relaxed">
              These are hypothetical product workflows, not customer case studies, managed-service offers or performance claims. Actual use depends on the customer's data, configuration, permissions and decisions.
            </p>
            <p className="text-primary-foreground/70 text-sm max-w-3xl mt-5 leading-relaxed">
              Velocity Vision does not scrape or sell contact data, send automatically, guarantee compliance or promise replies, sales, deliverability, pipeline or revenue.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.article
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group bg-card border border-border/50 rounded-xl p-8 hover:shadow-elevated transition-all"
            >
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                {useCase.tag}
              </span>
              <h2 className="font-display font-semibold text-xl text-foreground mt-3 mb-5">
                {useCase.title}
              </h2>
              <div className="space-y-4 text-sm">
                <p>
                  <span className="font-semibold text-foreground">Operational objective. </span>
                  <span className="text-muted-foreground">{useCase.objective}</span>
                </p>
                <p>
                  <span className="font-semibold text-foreground">Software workflow. </span>
                  <span className="text-muted-foreground">{useCase.workflow}</span>
                </p>
                <p>
                  <span className="font-semibold text-accent">Customer control. </span>
                  <span className="text-muted-foreground">{useCase.control}</span>
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Work;
