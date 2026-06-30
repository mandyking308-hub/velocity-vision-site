import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Layers, Gauge } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";

const About = () => (
  <>
    <SEO
      title="About Velocity Vision — A self-serve marketing launchpad"
      description="Velocity Vision is a self-serve campaign platform that compresses marketing launch from a quarter to a weekend — built so businesses and agencies don't need to hire one to grow."
      path="/about"
    />
    <Navbar />
    <main className="pt-20">
      <section className="relative section-padding bg-hero overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="" className="w-full h-full object-cover opacity-25" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">About</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Built to make campaign launch faster, simpler, and more commercial
            </h1>
            <p className="text-primary-foreground/75 text-lg leading-relaxed">
              Velocity Vision is a self-serve marketing launchpad. We exist because most small businesses and lean teams don't need another agency retainer — they need a system that helps them launch, capture and improve campaigns themselves.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Why we built it</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-12">
              Marketing breaks at the same three points for almost every small business: no time to plan, no consistent follow-up, no clarity on what worked. Agencies fix one of those — at a price most teams can't justify. We built the product that fixes all three, without making you hire anyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Compass, title: "Product, not service", desc: "The platform is the deliverable. Human help is optional and paid — it's never the core path." },
              { icon: Layers, title: "Built for repeatability", desc: "Templates, reusable assets and one workspace per business or per client — your next campaign should always be faster." },
              { icon: Gauge, title: "Built around revenue", desc: "Every output points back to lead capture, follow-up and reporting — not vanity engagement metrics." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-card border border-border/50 rounded-xl p-8 shadow-card">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <item.icon className="text-accent" size={24} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Who's behind it</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Velocity Vision is designed and operated by a small product team led by its founder — who built the system, not the delivery line. The product is intentionally self-serve so growth is not gated on any one person's time.</p>
            <p>Operated by Global Solutions Management LLC (Delaware, USA).</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">Launch your first campaign</h2>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Start your first campaign <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default About;
