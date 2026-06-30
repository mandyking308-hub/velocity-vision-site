import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is this self-serve or done-for-you?", a: "Self-serve by design. You answer a guided brief and the platform generates your campaign pack. Optional Human Review is available if you want expert eyes on it." },
  { q: "Do I need to book a call?", a: "No. Pick a plan, sign up and launch. Calls are only for enterprise or large agency volume." },
  { q: "Can agencies use this for multiple clients?", a: "Yes. The Agency Workspace plan gives you separate client workspaces, reusable templates and branded reporting exports." },
  { q: "What happens after I pay?", a: "You go straight into onboarding, complete the guided brief and your first campaign pack is generated inside your workspace." },
  { q: "Does it include social and video assets?", a: "Yes. Every campaign pack includes a social media pack and a video pack (scripts, hooks, shot list, storyboard outline and captions)." },
  { q: "What happens when credits run out?", a: "Your workspace stays accessible. You can top up, upgrade or pause — nothing is deleted and your templates remain reusable." },
];

const HomeFAQ = () => (
  <section className="section-padding bg-background">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Quick answers</h2>
      </motion.div>

      <Accordion type="single" collapsible className="mb-10">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-display text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button variant="cta" asChild>
        <Link to="/pricing">See pricing and answers <ArrowRight size={16} /></Link>
      </Button>
    </div>
  </section>
);

export default HomeFAQ;
