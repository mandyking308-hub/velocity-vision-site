import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroAbstract from "@/assets/hero-abstract.jpg";

const HeroSection = () => (
  <section className="relative bg-hero min-h-[90vh] flex items-center overflow-hidden">
    {/* Background image with overlay */}
    <div className="absolute inset-0">
      <img
        src={heroAbstract}
        alt=""
        className="w-full h-full object-cover opacity-30"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/60" />
    </div>

    {/* Abstract decorative elements */}
    <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
    <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-accent-warm/5 blur-3xl" />

    <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-32 w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-6">Global Marketing & PR Agency</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.1] mb-6">
          Where influence meets{" "}
          <span className="text-gradient">velocity.</span>
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-10 leading-relaxed">
          We accelerate growth for the world's most ambitious brands through data-driven marketing, strategic PR, and AI-powered intelligence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="lg" asChild>
            <Link to="/book-demo">
              Book a Demo <ArrowRight size={18} />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/services">Explore Services</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
