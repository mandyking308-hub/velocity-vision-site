import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, Cpu, Landmark, Bot, Briefcase, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const industries = [
  {
    icon: Heart, title: "Healthcare",
    challenges: "Stringent regulations, patient trust requirements, and complex stakeholder landscapes.",
    opportunities: "Digital health adoption, telemedicine growth, and health-tech innovation create massive marketing potential.",
    approach: "Compliance-first creative strategies that build trust while driving patient and provider engagement.",
    campaign: "Repositioned a digital health platform, resulting in 340% increase in qualified leads and successful Series B raise.",
  },
  {
    icon: Cpu, title: "Technology",
    challenges: "Crowded markets, rapid innovation cycles, and increasingly technical buying committees.",
    opportunities: "Cloud adoption, AI integration, and digital transformation create enormous demand for differentiated positioning.",
    approach: "Thought leadership-led campaigns combining technical credibility with compelling brand narratives.",
    campaign: "Launched enterprise SaaS product achieving 12M impressions and 450+ media placements in 90 days.",
  },
  {
    icon: Landmark, title: "Finance",
    challenges: "Regulatory constraints, eroding trust, and fintech disruption challenging incumbent positioning.",
    opportunities: "Open banking, ESG investing, and embedded finance are reshaping how financial services are marketed.",
    approach: "Authority-building content and compliance-ready campaigns that drive consideration and conversion.",
    campaign: "Built fintech brand awareness from zero to 40% unaided recall in target segment within 12 months.",
  },
  {
    icon: Bot, title: "AI & Software",
    challenges: "Market saturation, hype fatigue, and the need to demonstrate real value over buzzwords.",
    opportunities: "Enterprise AI adoption is accelerating—buyers need trusted voices to guide purchase decisions.",
    approach: "Technical storytelling, product-led content, and analyst engagement that positions you as the category leader.",
    campaign: "Drove $8M pipeline for AI startup through integrated content and ABM campaign.",
  },
  {
    icon: Briefcase, title: "Professional Services",
    challenges: "Commoditisation, talent wars, and the shift from relationship-based to digital-first buying.",
    opportunities: "Expertise-driven content and personal branding can differentiate in a crowded B2B landscape.",
    approach: "Executive visibility programmes, thought leadership, and demand generation for professional services firms.",
    campaign: "Grew inbound leads by 180% for global consulting firm through LinkedIn-first content strategy.",
  },
  {
    icon: ShoppingBag, title: "Consumer Brands",
    challenges: "Fragmented attention, rising CAC, and the demand for authentic brand connections.",
    opportunities: "Creator economy, social commerce, and community-led growth are rewriting the consumer playbook.",
    approach: "Cultural marketing strategies that create brand love through authentic storytelling and creator partnerships.",
    campaign: "18M organic reach and 180% sales lift for sustainable fashion brand through influencer-led campaign.",
  },
];

const Industries = () => (
  <>
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Industries</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">Sector expertise that drives results</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Deep industry knowledge. Tailored strategies. Measurable outcomes.</p>
          </motion.div>
        </div>
      </section>

      {industries.map((ind, i) => (
        <section key={ind.title} className={`section-padding ${i % 2 === 0 ? "bg-background" : "bg-secondary"}`}>
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ind.icon className="text-accent" size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">{ind.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-1">Sector Challenges</h3><p className="text-muted-foreground text-sm leading-relaxed">{ind.challenges}</p></div>
                  <div><h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-1">Opportunities</h3><p className="text-muted-foreground text-sm leading-relaxed">{ind.opportunities}</p></div>
                </div>
                <div className="space-y-4">
                  <div><h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-1">Our Approach</h3><p className="text-muted-foreground text-sm leading-relaxed">{ind.approach}</p></div>
                  <div><h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider mb-1">Example Campaign</h3><p className="text-accent text-sm font-semibold leading-relaxed">{ind.campaign}</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">Your industry. Our expertise.</h2>
          <Button variant="hero" size="lg" asChild><Link to="/book-demo">Book a Demo <ArrowRight size={18} /></Link></Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Industries;
