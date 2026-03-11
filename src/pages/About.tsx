import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, BrainCircuit, TrendingUp } from "lucide-react";

const About = () => (
  <>
    <Navbar />
    <main className="pt-20">
      <section className="section-padding bg-hero">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">About Velocity</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">Marketing at the speed of business</h1>
            <p className="text-primary-foreground/70 text-lg leading-relaxed">
              Velocity Influence Agency is a global marketing and PR firm built for the pace of modern business. We combine strategic rigour, creative firepower, and data intelligence to drive measurable growth for the world's most ambitious brands.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-12">
              To be the most effective marketing partner in the world. We exist to help brands grow faster, communicate more clearly, and compete more intelligently. Every campaign we run, every strategy we build, ladders up to one outcome: growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Global Reach", desc: "Offices in London, New York, Dubai, and Singapore. Teams across 12 markets. Campaigns that transcend borders." },
              { icon: BrainCircuit, title: "AI-First Approach", desc: "Proprietary AI tools for audience intelligence, campaign optimisation, and predictive analytics. Technology as a force multiplier." },
              { icon: TrendingUp, title: "Growth Obsessed", desc: "We measure everything against business outcomes. Vanity metrics don't survive here—only real impact." },
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
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Leadership Philosophy</h2>
            <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
              <p>We believe that great marketing starts with great thinking. Our leadership team brings decades of experience from the world's top agencies, consulting firms, and technology companies.</p>
              <p>We operate with radical transparency, move at startup speed, and hold ourselves accountable to the same growth metrics we set for our clients. No layers. No politics. Just brilliant people doing brilliant work.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-hero text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">Join the velocity</h2>
          <Button variant="hero" size="lg" asChild><Link to="/book-demo">Book a Demo <ArrowRight size={18} /></Link></Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default About;
