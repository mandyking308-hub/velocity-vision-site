import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Users, Zap, Target, TrendingUp, Clock } from "lucide-react";

const cases = [
  { icon: Briefcase, title: "Founders", desc: "Run real marketing without hiring a CMO or signing an agency retainer." },
  { icon: Users, title: "Small businesses", desc: "Launch campaigns consistently even with a 1-person marketing function." },
  { icon: Zap, title: "Service businesses", desc: "Turn enquiries into pipeline with clear lead capture and follow-up." },
  { icon: Target, title: "Coaches & consultants", desc: "Launch offers, fill cohorts and re-engage past clients on repeat." },
  { icon: TrendingUp, title: "Internal marketers", desc: "One platform to plan, ship and report — without juggling 6 tools." },
  { icon: Clock, title: "Lean teams", desc: "Compress weeks of agency back-and-forth into a single weekend." },
];

const ForBusinesses = () => (
  <>
    <SEO
      title="For Businesses — Self-serve marketing platform | Velocity Vision"
      description="Structured marketing for founders, operators and lean teams. Plan, launch and improve revenue-focused campaigns without an agency."
      path="/for-businesses"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Businesses</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Structured marketing for businesses that need traction, not agency overhead
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Skip the retainer. Skip the strategy calls. Launch real, revenue-focused campaigns from one self-serve workspace.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10 max-w-2xl">Built for the people doing the work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <c.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default ForBusinesses;
