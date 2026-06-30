import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is this self-serve or done-for-you?", a: "Self-serve. You upload data, review quality, activate safely and run outreach from your own workspace. Optional Premium Human Review is available if you want expert eyes on a specific campaign." },
  { q: "What does activation actually mean?", a: "Activation is the governed step where you connect and verify your sender, pick a safe segment from your Data Vault, set cadence, and only then begin sending. Daily caps and risky-record limits are enforced by the platform." },
  { q: "Do I still need a CRM or email tool?", a: "Not for the core flow. The workspace covers data, sending, replies, follow-up states and pipeline movement in one place. You can export at any time." },
  { q: "Can agencies run multiple clients?", a: "Yes. Agency Workspace provides isolated workspaces per client, pooled credits and pooled sending governance across the account." },
  { q: "What happens when credits run out?", a: "Your workspace stays accessible — data, pipeline, replies and reporting remain live. Only new AI-heavy generations pause until you top up or upgrade." },
  { q: "Does it work outside the UK?", a: "Yes. Multilingual outreach (English and Spanish today, French in rollout), multi-currency pricing and localised checkout for international teams." },
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
