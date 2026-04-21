import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, BarChart3, Layers } from "lucide-react";

const features = [
  { icon: Layers, title: "Multiple Client Campaigns", desc: "Run campaigns for all your clients from a single agency account." },
  { icon: BarChart3, title: "Centralised Analytics", desc: "Track performance across every client workspace in one dashboard." },
  { icon: Building2, title: "Scale Without Limits", desc: "Add unlimited clients and campaigns as your agency grows." },
];

const AgencySection = () => (
  <section className="section-padding bg-secondary">
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">For Agencies & Consultants</p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Power campaigns for every client on one platform
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Built for businesses and agencies managing multiple clients at scale.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border/50 shadow-card text-center">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <f.icon className="text-accent" size={24} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="cta" size="lg" asChild>
          <Link to="/for-agencies">Start Agency Plan <ArrowRight size={16} /></Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/for-agencies">Learn More</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default AgencySection;
