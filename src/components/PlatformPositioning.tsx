import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layers, Users, Building2, BarChart3, Play } from "lucide-react";
import intelligenceVisual from "@/assets/intelligence-visual.jpg";

const blocks = [
  { icon: Layers, title: "Unified Campaign Engine", desc: "Manage email, outreach, paid media, and PR campaigns in one place." },
  { icon: Users, title: "Integrated CRM", desc: "Track leads, clients, and pipeline activity with full visibility." },
  { icon: Building2, title: "Agency Workspaces", desc: "Run campaigns for multiple clients under one account." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Monitor performance, ROI, and growth metrics instantly." },
];

const PlatformPositioning = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Platform Positioning</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          The platform behind the performance
        </h2>
        <p className="text-muted-foreground text-lg">
          More than an agency — Velocity Influence is a complete marketing operating system.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {blocks.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <b.icon className="text-accent" size={22} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
          <div className="pt-4">
            <Button variant="cta" size="lg" asChild>
              <Link to="/demo"><Play size={16} /> Explore the Platform</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <img
            src={intelligenceVisual}
            alt="Velocity Influence platform dashboard"
            className="rounded-2xl shadow-elevated w-full"
            loading="lazy"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

export default PlatformPositioning;
