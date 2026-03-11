import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const articles = [
  { tag: "Marketing Trends", title: "The Death of the Funnel: Why Modern Marketing Demands a New Model", excerpt: "Linear funnels are broken. Today's buyers move fluidly across channels. Here's how to build a marketing engine that matches reality.", date: "Mar 2026", readTime: "6 min" },
  { tag: "AI in Marketing", title: "How AI Is Reshaping Campaign Strategy in 2026", excerpt: "From predictive audience modelling to automated creative optimisation—AI is no longer optional. It's the competitive baseline.", date: "Feb 2026", readTime: "8 min" },
  { tag: "Performance", title: "From Vanity Metrics to Value Metrics: Measuring What Matters", excerpt: "Impressions don't pay bills. Learn how leading brands are shifting measurement to revenue-attributed outcomes.", date: "Jan 2026", readTime: "5 min" },
  { tag: "Industry Insights", title: "Healthcare Marketing in a Post-Trust Era", excerpt: "Trust in healthcare brands is at an all-time low. How can marketers rebuild credibility in a sceptical world?", date: "Dec 2025", readTime: "7 min" },
  { tag: "PR Strategy", title: "Earned Media in 2026: Quality Over Quantity", excerpt: "The spray-and-pray era of PR is over. Strategic media relations now outperform volume-based approaches by 4x.", date: "Nov 2025", readTime: "6 min" },
  { tag: "Social Media", title: "The Creator Economy Playbook for Enterprise Brands", excerpt: "How B2B and enterprise brands are leveraging creator partnerships to drive awareness and demand.", date: "Oct 2025", readTime: "9 min" },
];

const Insights = () => (
  <>
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Insights</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">Thought leadership & analysis</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Expert perspectives on marketing, PR, and growth strategy.</p>
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
