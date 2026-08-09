import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const articles = [
  {
    tag: "Data source",
    title: "Why customer-provided data needs a recorded source",
    excerpt:
      "A practical overview of source records, customer authority, lawful basis and why software quality checks do not replace legal review.",
    date: "Jun 2026",
    readTime: "6 min",
  },
  {
    tag: "Data review",
    title: "Using valid, risky and blocked record states",
    excerpt:
      "How record states can support customer review, suppression handling and safer segmentation before any activation decision.",
    date: "May 2026",
    readTime: "5 min",
  },
  {
    tag: "Activation",
    title: "What governed activation means inside the workspace",
    excerpt:
      "The difference between an editable draft, an approved segment, a verified sender and an explicit customer activation decision.",
    date: "May 2026",
    readTime: "7 min",
  },
  {
    tag: "Suppression",
    title: "Keeping opt-outs and blocked records outside activation",
    excerpt:
      "Why suppression status and customer-maintained opt-out records must remain part of every repeatable commercial workflow.",
    date: "Apr 2026",
    readTime: "6 min",
  },
  {
    tag: "AI drafts",
    title: "Why AI-assisted outputs remain drafts",
    excerpt:
      "How customer review, editing and approval preserve responsibility for content, claims, recipients and activation decisions.",
    date: "Apr 2026",
    readTime: "5 min",
  },
  {
    tag: "Follow-up records",
    title: "Separating follow-up activity from guaranteed pipeline",
    excerpt:
      "How software can organize reply states, next actions and early opportunity records without promising replies, sales or revenue.",
    date: "Mar 2026",
    readTime: "6 min",
  },
];

const Insights = () => (
  <>
    <SEO
      title="Product Guidance & Governance Notes | Velocity Vision"
      description="Educational notes on customer-provided data, record review, governed activation, suppression handling, AI-assisted drafts and early pipeline records."
      path="/insights"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Velocity Vision Product Guidance",
        description:
          "Educational product guidance on customer-provided data, governed activation, suppression handling, AI-assisted drafts and follow-up records.",
        url: "https://velocity-outreach.com/insights",
        publisher: { "@type": "Organization", name: "Velocity Vision" },
      }}
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
              Product guidance
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-4xl">
              Practical notes on governed use of the workspace
            </h1>
            <p className="text-primary-foreground/75 text-lg max-w-3xl leading-relaxed">
              Educational summaries covering data source, record review, customer-controlled activation, suppression handling, editable AI drafts and follow-up records.
            </p>
            <p className="text-primary-foreground/70 text-sm max-w-3xl mt-5 leading-relaxed">
              These materials are general product guidance, not legal advice, compliance approval, customer case studies or promises of deliverability, replies, sales, pipeline or revenue.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-elevated transition-all"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                    {article.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{article.date}</span>
                </div>
                <h2 className="font-display font-semibold text-lg text-foreground mb-3 group-hover:text-accent transition-colors">
                  {article.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {article.excerpt}
                </p>
                <span className="text-xs text-muted-foreground">{article.readTime} read</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Insights;
