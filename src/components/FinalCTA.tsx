import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => (
  <section className="section-padding bg-hero relative overflow-hidden">
    <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full w-[600px] h-[600px] -top-40 -right-40" />
    <div className="relative max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">Ready to accelerate your growth?</h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
          Let's build a marketing engine that drives real business outcomes. Book a demo or get in touch today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/book-demo">Book a Demo <ArrowRight size={18} /></Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
