import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Target, Megaphone, Users, BarChart3, Palette, BrainCircuit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import servicesHero from "@/assets/services-hero.jpg";

const services = [
  {
    icon: Target,
    title: "Marketing Strategy",
    overview: "We build go-to-market strategies that align brand, product, and audience for maximum impact.",
    capabilities: ["Market analysis & positioning", "Competitive intelligence", "Go-to-market planning", "Growth roadmaps"],
    process: "Discover → Analyse → Strategise → Execute → Optimise",
    results: "Average 3.2x ROI across strategy engagements",
  },
  {
    icon: Megaphone,
    title: "PR & Media Relations",
    overview: "Earned media campaigns that build trust, shape narratives, and drive awareness at scale.",
    capabilities: ["Media strategy & outreach", "Crisis communications", "Executive visibility", "Analyst relations"],
    process: "Narrative Development → Media Mapping → Outreach → Coverage Amplification",
    results: "2,400+ tier-1 media placements in 2025",
  },
  {
    icon: Users,
    title: "Social Media Marketing",
    overview: "Social strategies that create community, drive engagement, and convert followers into customers.",
    capabilities: ["Platform strategy", "Content creation", "Influencer partnerships", "Community management"],
    process: "Audit → Strategy → Content Calendar → Execution → Reporting",
    results: "Average 240% engagement lift for clients",
  },
  {
    icon: BarChart3,
    title: "Paid Advertising",
    overview: "Performance marketing across every channel, optimised in real-time for maximum return.",
    capabilities: ["Search & shopping ads", "Paid social", "Programmatic display", "Connected TV"],
    process: "Audience Modelling → Creative Development → Launch → Optimise → Scale",
    results: "£180M+ in managed media spend",
  },
  {
    icon: Palette,
    title: "Brand & Creative",
    overview: "Brand identities and creative campaigns that differentiate, resonate, and endure.",
    capabilities: ["Brand strategy & identity", "Visual design systems", "Campaign creative", "Video production"],
    process: "Discovery → Concept → Design → Production → Launch",
    results: "40+ brand launches and refreshes",
  },
  {
    icon: BrainCircuit,
    title: "Marketing Intelligence",
    overview: "AI-powered analytics that transform data into decisive competitive advantage.",
    capabilities: ["Audience intelligence", "Predictive analytics", "Attribution modelling", "Competitive benchmarking"],
    process: "Data Integration → Analysis → Insight Generation → Action Recommendations",
    results: "Real-time dashboards serving 200+ enterprise clients",
  },
];

const Services = () => (
  <>
    <SEO title={"Marketing Services — Strategy, Performance & Creative | Velocity Influence"} description={"Integrated marketing services: brand strategy, performance media, PR, AI intelligence, and creative production for global enterprise clients."} path="/services" />
      <Navbar />
    <main className="pt-20">
      {/* Hero with image */}
      <section className="relative section-padding bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={servicesHero}
            alt=""
            className="w-full h-full object-cover opacity-20"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Our Services</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">Full-spectrum marketing, one integrated team</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">Six core disciplines working as one. From strategy to execution, we cover every channel and audience.</p>
          </motion.div>
        </div>
      </section>

      {/* Service Details */}
      {services.map((s, i) => (
        <section key={s.title} className={`section-padding ${i % 2 === 0 ? "bg-background" : "bg-secondary"}`}>
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <s.icon className="text-accent" size={24} />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{s.overview}</p>
                <p className="text-sm font-semibold text-accent">{s.results}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">Capabilities</h3>
                  <ul className="space-y-2">
                    {s.capabilities.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-2">Our Process</h3>
                  <p className="text-sm text-muted-foreground">{s.process}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">Ready to get started?</h2>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Services;
