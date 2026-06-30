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
      title="About Velocity Vision — A commercial workspace for modern teams"
      description="Velocity Vision is a commercial operating workspace: upload data, review quality, activate safely, create outreach assets, work replies, and move opportunities into pipeline."
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
              Built to turn messy commercial activity into structured growth
            </h1>
            <p className="text-primary-foreground/75 text-lg leading-relaxed">
              Velocity Vision is a commercial workspace for founders, lean teams, and agencies. It brings data, safe outreach, assets, replies, and pipeline into one governed product — so growth runs as a system, not as a series of one-off projects.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Why we built it</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-12">
              Most teams don't need more agency overhead. They need a system to organise their data, decide what's safe to activate, create the outreach assets that go with it, work the replies that come back, and move real opportunities into pipeline. That loop is the product — and it runs without depending on any one person's time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Compass, title: "Product, not service", desc: "The platform is the deliverable. Human help is optional and paid — it is never the core path to value." },
              { icon: Layers, title: "Built for repeatability", desc: "One workspace per business or per client. Data, assets, cadences, and pipeline live in one structured place you can reuse." },
              { icon: Gauge, title: "Governed by design", desc: "Safe sending, sender verification, plan-tier limits, and audit logging are built into the workflow — not bolted on." },
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Who operates it</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Velocity Vision is built and operated by a small product team. The founder built the system, not a delivery line — so the product is intentionally self-serve and not dependent on any single person to deliver value.</p>
            <p>The platform is used internationally, supports multiple currencies, and ships with multilingual output for English and Spanish today.</p>
            <p>Operated by Global Solutions Management LLC, incorporated in Delaware, United States.</p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">See the workspace</h2>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Open your workspace <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default About;
