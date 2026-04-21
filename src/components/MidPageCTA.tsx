import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const MidPageCTA = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Live Demo</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">See it in action</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Explore the platform with real campaign data, dashboards, and workflows — no setup required.
        </p>
        <Button variant="cta" size="lg" asChild>
          <Link to="/demo"><Play size={16} /> Explore the Platform</Link>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default MidPageCTA;
