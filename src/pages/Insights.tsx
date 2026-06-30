import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const articles = [
  { tag: "Activation", title: "Safe activation: what 'ready to send' actually means", excerpt: "Why activation readiness — verified sender, clean data, plan-tier caps — is the difference between pipeline and a deliverability problem.", date: "Jun 2026", readTime: "6 min" },
  { tag: "Data quality", title: "The three states every record should have before activation", excerpt: "Valid, risky, blocked. How to triage a list so you only activate what is genuinely safe to contact.", date: "May 2026", readTime: "5 min" },
  { tag: "Reply handling", title: "Reply queues beat inboxes for outbound teams", excerpt: "Why a structured follow-up queue with snooze, warm, dormant, and stuck-deal states outperforms a shared inbox.", date: "May 2026", readTime: "7 min" },
  { tag: "Cadence", title: "Weekly, monthly, quarterly: choosing a cadence that compounds", excerpt: "A practical model for choosing send cadence based on list size, sender reputation, and offer maturity.", date: "Apr 2026", readTime: "6 min" },
  { tag: "Pipeline discipline", title: "Moving conversations into pipeline without losing the thread", excerpt: "Why every reply should resolve to one of four states — and how that single decision protects pipeline integrity.", date: "Apr 2026", readTime: "5 min" },
  { tag: "Operator workflows", title: "30 minutes a day: a founder-led outreach workflow", excerpt: "A repeatable daily loop for founders running their own outreach: queue, replies, follow-ups, pipeline movement.", date: "Mar 2026", readTime: "6 min" },
];

const Insights = () => (
  <>
    <SEO
      title="Playbooks & Thinking | Velocity Vision"
      description="Playbooks on activation, data quality, replies, cadence, and pipeline discipline — from a product built to run commercial workflows."
      path="/insights"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Velocity Vision Playbooks",
        "description": "Playbooks and operator thinking on activation, data quality, outreach, and pipeline.",
        "url": "https://velocity-outreach.com/insights",
        "publisher": { "@type": "Organization", "name": "Velocity Vision" },
      }}
    />
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Playbooks</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">Operator thinking from inside the workspace</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Activation, data quality, replies, cadence, and pipeline discipline — written from a product built to run real commercial workflows.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((a, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-elevated transition-all"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">{a.tag}</span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-3 group-hover:text-accent transition-colors">{a.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{a.excerpt}</p>
                <span className="text-xs text-muted-foreground">{a.readTime} read</span>
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
