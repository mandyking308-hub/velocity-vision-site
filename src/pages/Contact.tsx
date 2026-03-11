import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Message sent! We'll be in touch shortly.");
    setForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-hero">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Contact</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">Let's talk growth</h1>
              <p className="text-primary-foreground/70 text-lg max-w-2xl">Ready to accelerate? Get in touch and we'll respond within 24 hours.</p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-display font-bold text-foreground mb-8">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <Textarea placeholder="How can we help? *" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <Button variant="cta" size="lg" type="submit">Send Message <ArrowRight size={18} /></Button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-2"><Mail className="text-accent" size={18} /><h3 className="font-display font-semibold text-foreground">Email</h3></div>
                <p className="text-muted-foreground text-sm">hello@velocityinfluence.com</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><MapPin className="text-accent" size={18} /><h3 className="font-display font-semibold text-foreground">Global Offices</h3></div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>London, United Kingdom</p>
                  <p>New York, United States</p>
                  <p>Dubai, United Arab Emirates</p>
                  <p>Singapore</p>
                </div>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-2">Prefer a live conversation?</h3>
                <p className="text-muted-foreground text-sm mb-4">Book a 30-minute demo with our team.</p>
                <Button variant="cta" size="default" asChild><Link to="/book-demo">Book a Demo</Link></Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
