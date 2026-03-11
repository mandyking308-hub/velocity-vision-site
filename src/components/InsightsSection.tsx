import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const articles = [
  { tag: "Marketing Trends", title: "The Death of the Funnel: Why Modern Marketing Demands a New Model", date: "Mar 2026" },
  { tag: "AI in Marketing", title: "How AI Is Reshaping Campaign Strategy in 2026", date: "Feb 2026" },
  { tag: "Performance", title: "From Vanity Metrics to Value Metrics: Measuring What Matters", date: "Jan 2026" },
  { tag: "Industry Insights", title: "Healthcare Marketing in a Post-Trust Era", date: "Dec 2025" },
];

const InsightsSection = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4"
      >
        <div>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Insights</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Thought leadership</h2>
        </div>
        <Link to="/insights" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-warm transition-colors">
          All articles <ArrowUpRight size={16} />
        </Link>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link to="/insights" className="group block bg-card border border-border/50 rounded-xl p-8 hover:shadow-elevated hover:border-accent/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">{a.tag}</span>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors">{a.title}</h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default InsightsSection;
