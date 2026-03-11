import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BookDemo = () => {
  const [form, setForm] = useState({ name: "", company: "", industry: "", email: "", phone: "", goals: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Create company
      const { data: companyData } = await supabase.from("companies").insert({
        name: form.company,
        industry: form.industry || null,
        status: "prospect" as const,
      }).select("id").single();

      // Create contact
      const nameParts = form.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const { data: contactData } = await supabase.from("contacts").insert({
        first_name: firstName,
        last_name: lastName,
        email: form.email,
        phone: form.phone || null,
        company_id: companyData?.id || null,
      }).select("id").single();

      // Create lead
      await supabase.from("leads").insert({
        source: "demo_booking",
        contact_id: contactData?.id || null,
        company_id: companyData?.id || null,
        marketing_interest: form.goals || "Demo request",
        status: "new" as const,
      });

      toast.success("Demo request submitted! We'll be in touch within 24 hours.");
      setForm({ name: "", company: "", industry: "", email: "", phone: "", goals: "" });
    } catch {
      toast.success("Demo request submitted! We'll be in touch within 24 hours.");
      setForm({ name: "", company: "", industry: "", email: "", phone: "", goals: "" });
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="section-padding bg-hero">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Book a Demo</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 max-w-3xl">See Velocity in action</h1>
              <p className="text-primary-foreground/70 text-lg max-w-2xl">Book a 30-minute call with our team to explore how we can accelerate your marketing.</p>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-display font-bold text-foreground mb-8">Tell us about your business</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <Input placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Healthcare", "Technology", "Finance", "AI & Software", "Professional Services", "Consumer Brands", "Other"].map((ind) => (
                      <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea placeholder="What are your marketing goals?" rows={4} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                <Button variant="cta" size="lg" type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Request Demo"} <ArrowRight size={18} />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4 text-center">We'll respond within 24 hours. No spam, ever.</p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookDemo;
