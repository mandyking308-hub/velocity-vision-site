import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { number: "01", title: "Connect", desc: "Bring your approved data and verify your sender." },
  { number: "02", title: "Create", desc: "Generate a complete campaign pack from one brief — strategy, email, landing & offer, PR, social, video, ads and lead capture." },
  { number: "03", title: "Review", desc: "Edit every asset before it leaves draft." },
  { number: "04", title: "Activate", desc: "Send approved email through governed sending, hand social to your Buffer account, and use the other assets in your chosen channels." },
  { number: "05", title: "Respond", desc: "Triage replies, record follow-ups and hand off meetings." },
  { number: "06", title: "Learn", desc: "Watch the Outcome Funnel record what happened and inform the next campaign." },
];

const SixSteps = () => (
  <section className="section-padding relative">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
      >
        <div className="max-w-2xl">
          <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-90">The workflow</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
            From brief to campaign to response.
          </h2>
        </div>
        <Button asChild className="bg-white text-accent hover:bg-white/90 font-bold self-start md:self-auto shadow-lg">
          <Link to="/how-it-works">See the full workflow <ArrowRight size={16} /></Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
            className="bg-white rounded-2xl p-6 shadow-elevated hover:-translate-y-1 transition-transform"
          >
            <p className="text-accent-warm font-display font-bold text-3xl mb-3">{step.number}</p>
            <h3 className="font-display font-semibold text-xl mb-1.5">{step.title}</h3>
            <p className="text-sm opacity-75 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SixSteps;
