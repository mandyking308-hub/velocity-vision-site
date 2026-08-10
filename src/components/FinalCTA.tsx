import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => (
  <section className="section-padding bg-hero relative overflow-hidden">
    <div aria-hidden className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
    <div aria-hidden className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full bg-black/10 blur-3xl" />
    <div className="relative max-w-4xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5 leading-tight">
          One workspace instead of a stack of disconnected tools.
        </h2>
        <p className="text-primary-foreground/90 font-display font-semibold text-lg md:text-xl mb-4 tracking-wide">
          Data. Campaign. <span className="bg-white text-accent-warm px-2 rounded-lg">Activation.</span> Replies. Pipeline.
        </p>
        <p className="text-primary-foreground/75 text-sm mb-10 max-w-xl mx-auto leading-relaxed">
          Build the complete campaign from one brief, keep every activation under your control, and manage what comes back in the same workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-accent hover:bg-white/90 font-bold shadow-xl" asChild>
            <Link to="/auth">Start Free Preview <ArrowRight size={18} /></Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTA;
