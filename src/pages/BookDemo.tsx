import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";

const industries = ["Healthcare", "Technology", "Finance", "AI & Software", "Professional Services", "Consumer Brands", "Other"];
const budgetRanges = ["Under £2,000/mo", "£2,000 – £5,000/mo", "£5,000 – £15,000/mo", "£15,000 – £50,000/mo", "£50,000+/mo"];

// Generate available time slots for next 10 business days
const generateSlots = () => {
  const slots: { date: Date; label: string }[] = [];
  let d = new Date();
  let count = 0;
  while (count < 10) {
    d = addDays(d, 1);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    for (const hour of [10, 11, 14, 15, 16]) {
      const slot = setMinutes(setHours(new Date(d), hour), 0);
      slots.push({ date: slot, label: `${format(slot, "EEE, MMM d")} at ${format(slot, "h:mm a")}` });
    }
    count++;
  }
  return slots;
};

const BookDemo = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: "", company: "", industry: "", email: "", phone: "",
    website: "", budget: "", goals: "", accountType: "business",
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const slots = generateSlots();

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Route through the notify-contact edge function (service role) so the
      // public form doesn't need anon RLS on companies/contacts/leads.
      await supabase.functions.invoke("notify-contact", {
        body: {
          name: form.name,
          email: form.email,
          company: form.company,
          message: [
            form.goals || "Demo request",
            selectedSlot ? `Preferred slot: ${selectedSlot}` : null,
            form.budget ? `Budget: ${form.budget}` : null,
            form.industry ? `Industry: ${form.industry}` : null,
            form.website ? `Website: ${form.website}` : null,
            form.phone ? `Phone: ${form.phone}` : null,
            `Account type: ${form.accountType}`,
          ].filter(Boolean).join("\n"),
          route: "demo_booking",
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title={"Book a Demo — See the Velocity Influence Platform"} description={"Book a personalised demo of the Velocity Influence marketing platform and agency services."} path="/book-demo" />
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
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold text-foreground mb-3">Demo Booked!</h2>
                <p className="text-muted-foreground text-lg mb-2">Thank you, {form.name.split(" ")[0]}. We'll be in touch within 24 hours.</p>
                {selectedSlot && <p className="text-foreground font-medium mt-4 flex items-center justify-center gap-2"><CalendarDays size={18} className="text-accent" /> {selectedSlot}</p>}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                {/* Progress steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                        step >= s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                      )}>{s}</div>
                      {s < 3 && <div className={cn("w-12 h-0.5 transition-colors", step > s ? "bg-accent" : "bg-border")} />}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  {step === 1 && "Tell us about your business"}
                  {step === 2 && "Your marketing needs"}
                  {step === 3 && "Choose a time slot"}
                </p>

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      <Input placeholder="Company name *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      <Input placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input placeholder="Company website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                      <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>{industries.map((ind) => <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Account Type</p>
                      <div className="flex gap-3">
                        {[{ value: "business", label: "Business" }, { value: "agency", label: "Agency / Consultant" }].map((opt) => (
                          <button key={opt.value} onClick={() => setForm({ ...form, accountType: opt.value })}
                            className={`flex-1 p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                              form.accountType === opt.value ? "border-accent bg-accent/10 text-foreground" : "border-border/50 text-muted-foreground hover:border-accent/30"
                            }`}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                    <Button variant="cta" className="w-full" onClick={() => {
                      if (!form.name || !form.email || !form.company) { toast.error("Please fill required fields"); return; }
                      setStep(2);
                    }}>Continue <ArrowRight size={16} /></Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
                      <SelectTrigger><SelectValue placeholder="Monthly marketing budget" /></SelectTrigger>
                      <SelectContent>{budgetRanges.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                    <Textarea placeholder="What are your marketing goals? What challenges are you facing?" rows={5} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                      <Button variant="cta" className="flex-1" onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-auto pr-1">
                      {slots.map((slot) => (
                        <button key={slot.label} onClick={() => setSelectedSlot(slot.label)}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm text-left transition-colors",
                            selectedSlot === slot.label
                              ? "border-accent bg-accent/10 text-foreground font-medium"
                              : "border-border/50 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                          )}>
                          <Clock size={14} className="shrink-0 text-accent" />
                          {slot.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                      <Button variant="cta" className="flex-1" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Booking..." : "Book Demo"} <ArrowRight size={16} />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">You can skip time selection — we'll contact you to arrange.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookDemo;
