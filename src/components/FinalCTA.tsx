import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => (
  <section className="section-padding bg-hero relative overflow-hidden">
    <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full w-[600px] h-[600px] -top-40 -right-40" />
    <div className="relative max-w-4xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
          Stop running outreach, follow-up and pipeline across six tools
        </h2>
        <p className="text-primary-foreground/75 text-lg mb-4 max-w-xl mx-auto">
          Bring data, assets, activation, follow-up and early pipeline into one governed workspace.
        </p>
        <p className="text-primary-foreground/80 text-sm mb-10 max-w-xl mx-auto">
          Launch support includes complimentary onboarding and setup guidance. Premium Human Review, where offered, is a separate paid add-on.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild><Link to="/auth">Start your workspace <ArrowRight size={18} /></Link></Button>
          <Button variant="hero-outline" size="lg" asChild><Link to="/pricing">See pricing</Link></Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
