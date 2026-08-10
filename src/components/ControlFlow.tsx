import { motion } from "framer-motion";
import { ArrowRight, Database, Sparkles, Eye, Send, FileCheck } from "lucide-react";

const steps = [
  { icon: Database, label: "Your data + brief", note: "You upload approved data and own it" },
  { icon: Sparkles, label: "AI prepares the full pack", note: "Strategy and every asset as editable drafts" },
  { icon: Eye, label: "You review & approve", note: "Nothing leaves draft alone" },
  { icon: Send, label: "You activate per channel", note: "Governed email send, Buffer handoff, your distribution" },
  { icon: FileCheck, label: "Replies & outcomes recorded", note: "Approvals and activity stay visible" },
];

const ControlFlow = () => (
  <section className="section-padding bg-splash-blue relative overflow-hidden">
    <div aria-hidden className="blob blob-pink w-72 h-72 -top-24 -right-16 animate-floaty" />
    <div aria-hidden className="blob blob-blue w-80 h-80 -bottom-32 -left-24 animate-drifty" />
    <div className="max-w-7xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-12"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">How control works</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          One self-serve product. Clear responsibility at every step.
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          From approved data to a complete campaign pack to replies and pipeline — nothing sends or publishes automatically. Every activation is an authorized human decision.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className="flex items-center gap-3 flex-1"
          >
            <div className="flex-1 bg-card border border-border/50 rounded-2xl p-5 shadow-card h-full">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <step.icon size={20} className="text-accent" />
              </div>
              <p className="font-display font-semibold text-foreground text-sm md:text-base mb-1">{step.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.note}</p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight size={18} className="text-accent shrink-0 rotate-90 lg:rotate-0 mx-auto lg:mx-0" aria-hidden />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ControlFlow;
