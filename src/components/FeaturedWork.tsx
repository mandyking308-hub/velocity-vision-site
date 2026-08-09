import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import campaignVisual from "@/assets/campaign-visual.jpg";

const caseStudies = [
  {
    industry: "AI & Software",
    objective: "Launch a category-defining AI platform to enterprise buyers",
    strategy: "Integrated PR campaign with tier-1 media placements, analyst briefings, and thought leadership content",
    results: "450+ media placements · 12M impressions · 340% increase in demo requests",
  },
  {
    industry: "Healthcare",
    objective: "Reposition a health-tech brand for Series B fundraise",
    strategy: "Brand refresh, executive visibility program, and investor-focused content strategy",
    results: "$42M raised · 8x media share of voice · Top 10 health-tech ranking",
  },
  {
    industry: "Consumer Brands",
    objective: "Drive Gen Z engagement for a sustainable fashion label",
    strategy: "Influencer-led social campaign across TikTok and Instagram with UGC activation",
    results: "18M organic reach · 2.4M engagements · 180% sales lift in 90 days",
  },
];

const FeaturedWork = () => (
  <section className="section-padding bg-primary">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Featured Work</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">Campaigns that moved markets</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:block"
        >
          <img
            src={campaignVisual}
            alt="Campaign analytics dashboard visualization"
            className="rounded-2xl shadow-elevated w-full max-w-md ml-auto opacity-80"
            loading="lazy"
          />
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {caseStudies.map((cs, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-xl p-8 hover:border-accent/40 transition-all group"
          >
            <span className="text-accent text-xs font-semibold uppercase tracking-wider">{cs.industry}</span>
            <h3 className="font-display font-semibold text-primary-foreground text-lg mt-3 mb-4">{cs.objective}</h3>
            <p className="text-primary-foreground/60 text-sm mb-4 leading-relaxed">{cs.strategy}</p>
            <p className="text-accent text-sm font-semibold">{cs.results}</p>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link to="/work" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-warm transition-colors">
          View all campaigns <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

export default FeaturedWork;
