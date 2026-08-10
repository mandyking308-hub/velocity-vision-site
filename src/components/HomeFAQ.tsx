import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What does Velocity Vision actually create?",
    a: "From one customer brief, the current complete campaign pack can prepare editable strategy, landing & offer copy, email sequences, a social pack, press release, video scripts, paid-ad copy and lead capture. Customers review and control every output before use.",
  },
  {
    q: "Is Velocity Vision AI-powered?",
    a: "Yes. AI helps prepare the complete editable campaign pack and can flag data-quality issues. Customers review, edit and control every output and activation decision. Velocity Vision does not guarantee replies, sales, deliverability, compliance, pipeline or revenue.",
  },
  {
    q: "Is this a self-serve workspace?",
    a: "Yes. Customers upload authorized data, review software flags, create the campaign pack, verify their sender where required, approve activation and manage follow-up from their own workspace. Velocity Vision does not provide managed campaigns.",
  },
  {
    q: "Does Velocity Vision scrape contacts or sell lists?",
    a: "No. Velocity Vision does not scrape contact data, sell lists or provide prospect databases. Customers supply their own lawfully obtained business data, maintain suppression and opt-out records, verify their sender and approve every activation.",
  },
  {
    q: "How does social publishing work?",
    a: "Connect your own Buffer account — Velocity never uses a shared Buffer account and never asks for your social-network passwords. After reviewing a generated social draft, you can hand approved text to your own Buffer channels as a draft, into your queue, or scheduled for later. Velocity never auto-publishes, and Buffer's own approval and channel settings still apply.",
  },
  {
    q: "What does activation mean?",
    a: "Activation is customer-controlled. Approved email can move through governed sending on eligible paid plans; approved social text can be handed to Buffer; the remaining campaign assets stay under customer control for use in the channels they choose. Mailbox readiness, unsubscribe handling and daily send limits are checked again when sending.",
  },
  {
    q: "What happens when Campaign Credits run out?",
    a: "Campaign Credits currently fund full campaign-pack generation. When the balance is insufficient for a credit-priced AI action, that generation pauses until eligible credits are added or the plan changes. Live sending is governed separately by paid-plan and sender safety limits; Campaign Credits are not charged per email or contact sent.",
  },
  {
    q: "Is Velocity Vision a CRM replacement?",
    a: "Velocity Vision records follow-up states and early opportunities but is not presented as a full CRM replacement. Customers can export records when a broader sales or CRM process is required.",
  },
  {
    q: "Is it for businesses or agencies?",
    a: "Both. Businesses can run complete customer-controlled campaigns in one workspace, while agencies can use isolated client workspaces, pooled Campaign Credits, cross-client outcome visibility and account-wide send-usage visibility. Agencies remain responsible for client authority, data, sender identity and activation decisions.",
  },
  {
    q: "Does it support international customers?",
    a: "The website provides supported display currencies and multilingual access. The final currency, tax treatment, payment provider and applicable terms are confirmed before purchase. Customers remain responsible for laws applying to their own data, recipients and activity.",
  },
];

const HomeFAQ = () => (
  <section className="section-padding bg-background relative overflow-hidden">
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-8">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Straight answers</h2>
      </motion.div>
      <Accordion type="single" collapsible className="mb-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.q} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-display text-sm md:text-base py-4">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button variant="cta" asChild><Link to="/pricing">Review pricing and billing terms <ArrowRight size={16} /></Link></Button>
    </div>
  </section>
);

export default HomeFAQ;
