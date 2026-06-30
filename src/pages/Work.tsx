import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const campaigns = [
  { industry: "AI & Software", client: "Enterprise AI Platform", objective: "Category creation and market entry", strategy: "Integrated PR, analyst engagement, and thought leadership content programme", results: "450+ media placements · 12M impressions · 340% demo request increase" },
  { industry: "Healthcare", client: "Digital Health Platform", objective: "Brand repositioning for Series B fundraise", strategy: "Brand refresh, executive visibility, and investor-focused content strategy", results: "$42M raised · 8x media SOV · Top 10 health-tech ranking" },
  { industry: "Consumer", client: "Sustainable Fashion Label", objective: "Gen Z audience acquisition and brand awareness", strategy: "Influencer-led TikTok and Instagram campaign with UGC activation", results: "18M organic reach · 2.4M engagements · 180% sales lift" },
  { industry: "Finance", client: "Fintech Platform", objective: "Build brand awareness in competitive market", strategy: "Multi-channel campaign: paid social, content marketing, and PR", results: "40% unaided recall in 12 months · 320% lead increase" },
  { industry: "Technology", client: "SaaS Scale-up", objective: "Enterprise market penetration", strategy: "ABM campaign, executive thought leadership, and analyst relations", results: "$8M pipeline generated · 12 enterprise deals closed" },
  { industry: "Professional Services", client: "Global Consultancy", objective: "Inbound lead generation and brand positioning", strategy: "LinkedIn-first content strategy with executive visibility programme", results: "180% inbound lead growth · 4x content engagement" },
];

const Work = () => (
  <>
    <SEO title={"Case Studies & Client Work | Velocity Influence"} description={"Real campaigns, real outcomes. Explore Velocity Influence case studies across performance marketing, PR, and brand transformation."} path="/work" />
      <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Our Work</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">Campaigns that deliver</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Real results for real brands. Explore our portfolio of integrated marketing campaigns.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {campaigns.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-8 hover:shadow-elevated transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">{c.industry}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{c.client}</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-3">{c.objective}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{c.strategy}</p>
              <p className="text-accent text-sm font-semibold">{c.results}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Work;
