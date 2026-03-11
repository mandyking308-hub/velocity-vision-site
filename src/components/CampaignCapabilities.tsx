import { motion } from "framer-motion";
import { Crosshair, Users, Layers, Handshake, Newspaper, TrendingUp } from "lucide-react";

const capabilities = [
  { icon: Crosshair, title: "Campaign Strategy", desc: "Bespoke campaign blueprints built around your growth goals and competitive landscape." },
  { icon: Users, title: "Audience Targeting", desc: "Precision segmentation powered by first-party data and AI-driven insights." },
  { icon: Layers, title: "Multi-channel Marketing", desc: "Orchestrated campaigns across digital, traditional, and experiential channels." },
  { icon: Handshake, title: "Influencer Partnerships", desc: "Authentic collaborations with creators who move your target audience." },
  { icon: Newspaper, title: "Media Placements", desc: "Tier-1 media coverage and strategic placements that amplify your narrative." },
  { icon: TrendingUp, title: "Performance Optimisation", desc: "Continuous optimization through real-time analytics and A/B testing." },
];

const CampaignCapabilities = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-16"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Campaign Capabilities</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">How we drive growth</h2>
        <p className="text-muted-foreground">From strategy to execution to optimisation—our capabilities span the full campaign lifecycle.</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <cap.icon className="text-accent" size={20} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-1">{cap.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{cap.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CampaignCapabilities;
