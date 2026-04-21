import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
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
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-6">Marketing Platform + Full-Service Agency</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-[1.1] mb-6">
          One platform to run every marketing campaign, client, and{" "}
          <span text-gradient="" className="text-gradient">channel.</span>
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-10 leading-relaxed">
          Velocity Influence combines full-service marketing with a powerful campaign platform — giving businesses and agencies complete control over growth in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="lg" asChild>
            <Link to="/demo">
              <Play size={16} /> Explore the Platform
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/book-demo">
              Book a Demo <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-primary-foreground/50 mt-4 max-w-md">
          No setup required. Instant access to demo environment.
        </p>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
