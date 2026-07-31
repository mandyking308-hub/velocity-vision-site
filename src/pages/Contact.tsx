import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, ArrowRight, LifeBuoy, CreditCard, Building2, Handshake, MessageSquare, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const routes = [
  { icon: Building2, title: "Enterprise & agency volume", desc: "Multi-workspace rollouts, agency-scale send governance, custom commercial terms.", action: "Send a volume enquiry", to: "#contact-form" },
  { icon: LifeBuoy, title: "Product support", desc: "Help using the workspace — uploads, activation, sender setup, follow-up, pipeline.", action: "Open in-app support", to: "/app" },
  { icon: CreditCard, title: "Billing & account help", desc: "Plan changes, currency, invoices, top-ups, tax queries.", action: "Open billing help", to: "/app/billing" },
  { icon: Scale, title: "Legal & compliance", desc: "Terms, privacy, data processing, security and compliance questions.", action: "Open legal route", to: "#contact-form" },
  { icon: Handshake, title: "Partnerships & integrations", desc: "Integration partners, resellers, embedded use cases.", action: "Send a message", to: "#contact-form" },
  { icon: MessageSquare, title: "General enquiries", desc: "Anything else — press, hiring, or a question that doesn't fit above.", action: "Send a message", to: "#contact-form" },
];

const contactTopics = [
  { value: "general_support", label: "General support" },
  { value: "billing", label: "Billing & account" },
  { value: "privacy_data_request", label: "Privacy / data request" },
  { value: "security_report", label: "Security report" },
  { value: "abuse_acceptable_use", label: "Abuse / acceptable use" },
  { value: "marketing_compliance_complaint", label: "Marketing compliance complaint" },
  { value: "cookie_tracking", label: "Cookie / tracking question" },
  { value: "legal_notice", label: "Legal notice" },
  { value: "subprocessor_question", label: "Subprocessor question" },
  { value: "partnerships", label: "Partnerships & integrations" },
  { value: "enterprise_volume", label: "Enterprise / agency volume" },
  { value: "other", label: "Other" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", topic: "general_support" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("notify-contact", {
        body: {
          name: form.name.trim().slice(0, 200),
          email: form.email.trim().slice(0, 320),
          company: form.company.trim().slice(0, 200),
          message: form.message.trim().slice(0, 5000),
          route: form.topic,
        },
      });

      if (error) throw error;

      toast.success("Message sent. We'll normally acknowledge it within one business day.");
      setForm({ name: "", email: "", company: "", message: "", topic: "general_support" });
    } catch {
      toast.error("We could not send your message. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Contact Velocity Vision — Sales, Support, Billing" description="Reach the right route fast: sales for enterprise and agency volume, product support, billing, legal and compliance, partnerships, or general enquiries." path="/contact" />
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-hero">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Contact</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">Reach the right team fast</h1>
              <p className="text-primary-foreground/70 text-lg max-w-2xl">Most people don't need a demo to get started — the workspace is self-serve. Pick the route that matches what you need.</p>
              <p className="text-primary-foreground/60 text-sm max-w-2xl mt-3">Velocity Vision supports international founders, teams and agencies. Choose the route that matches your enquiry and we'll direct it internally.</p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {routes.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="bg-card border border-border/50 rounded-xl p-6 shadow-card flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <r.icon className="text-accent" size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{r.desc}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={r.to}>{r.action} <ArrowRight size={14} /></Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div id="contact-form" className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">Send us a message</h2>
                <p className="text-sm text-muted-foreground mb-8">For everything that doesn't fit a route above. Enquiries are normally acknowledged within one business day.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input name="name" aria-label="Your name" placeholder="Your name *" required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input name="email" aria-label="Email" placeholder="Email *" type="email" required maxLength={320} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <Input name="company" aria-label="Company" placeholder="Company" maxLength={200} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  <div>
                    <label htmlFor="contact-topic" className="block text-xs font-medium text-muted-foreground mb-1">Topic</label>
                    <select
                      id="contact-topic"
                      name="topic"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                      {contactTopics.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <Textarea name="message" aria-label="How can we help?" placeholder="How can we help? *" rows={5} required maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <Button variant="cta" size="lg" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send message"} <ArrowRight size={18} />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your information is used to respond to this enquiry as described in the <Link to="/legal/privacy-policy" className="underline underline-offset-4 hover:text-accent">Privacy Policy</Link>.
                  </p>
                </form>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-2"><MapPin className="text-accent" size={18} /><h3 className="font-display font-semibold text-foreground">Operating entity</h3></div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Global Solutions Management LLC</p>
                    <p>Delaware, United States</p>
                    <p>Velocity Vision operates at velocity-outreach.com</p>
                    <p>Used internationally · multi-currency · multilingual</p>
                  </div>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-2">Agency or volume enquiry?</h3>
                  <p className="text-muted-foreground text-sm mb-4">For larger workspaces, agency usage or custom billing questions, send a message and we'll route it internally.</p>
                  <Button variant="cta" size="default" asChild><Link to="#contact-form">Send a volume enquiry</Link></Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
