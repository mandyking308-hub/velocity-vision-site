import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Velocity Vision AI-powered?",
    a: "Yes. AI helps prepare editable email, social, press, video and follow-up drafts and can flag data-quality issues. Customers review, edit and control every output and activation decision. Velocity Vision does not guarantee replies, sales, deliverability, compliance, pipeline or revenue.",
  },
  {
    q: "What workflow can Velocity Vision bring together?",
    a: "The workspace can bring customer-provided contact data, AI-assisted drafts, sender verification, activation controls, follow-up records and early opportunity records into one product. Customers should decide which existing tools or processes, if any, are genuinely replaced in their organisation.",
  },
  {
    q: "Is this a self-serve workspace?",
    a: "Yes. Customers upload authorised data, review software flags, prepare editable drafts, verify their sender, approve activation and manage follow-up from their own workspace. Velocity Vision does not provide managed campaigns.",
  },
  {
    q: "Does Velocity Vision scrape contacts or sell lists?",
    a: "No. Velocity Vision does not scrape contact data, sell lists or provide prospect databases. Customers supply their own lawfully obtained business data, maintain suppression and opt-out records, verify their sender and approve every activation.",
  },
  {
    q: "What outputs does it generate?",
    a: "From a customer brief, AI can prepare editable email sequences, social posts, press-release drafts, video scripts, hooks, shot-list ideas, captions and follow-up copy. Outputs remain drafts until reviewed and approved by the customer.",
  },
  {
    q: "What does activation mean?",
    a: "Activation preparation is a separate customer-controlled step involving campaign content, eligible records, legal acceptance and human approval. Mailbox readiness, unsubscribe handling and daily send limits are checked again when sending. Operational safeguards are not legal approval or a deliverability guarantee.",
  },
  {
    q: "Is Velocity Vision a CRM replacement?",
    a: "Velocity Vision records follow-up states and early opportunities but is not presented as a full CRM replacement. Customers can export records when a broader sales or CRM process is required.",
  },
  {
    q: "Is it for businesses or agencies?",
    a: "Both. Businesses can use a customer-controlled workspace, while agencies can use one account with isolated client workspaces, pooled Campaign Credits, cross-client outcome visibility and account-wide send-usage visibility. Agencies remain responsible for client authority, data, sender identity and activation decisions.",
  },
  {
    q: "What happens when Campaign Credits run out?",
    a: "Campaign Credits currently fund full campaign-pack generation. When the balance is insufficient for a credit-priced AI action, that generation pauses until eligible credits are added or the plan changes. Live sending is governed separately by paid-plan and sender safety limits; Campaign Credits are not charged per email or contact sent.",
  },
  {
    q: "Does it support international customers?",
    a: "The website provides supported display currencies and multilingual access. The final currency, tax treatment, payment provider and applicable terms are confirmed before purchase. Customers remain responsible for laws applying to their own data, recipients and activity.",
  },
];

const HomeFAQ = () => (
  <section className="section-padding bg-splash-pink relative overflow-hidden">
    <div aria-hidden className="blob blob-blue w-80 h-80 -top-20 -left-24 animate-floaty" />
    <div aria-hidden className="blob blob-pink w-72 h-72 -bottom-28 -right-16 animate-drifty" />
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">Product, activation and billing answers</h2>
      </motion.div>
      <Accordion type="single" collapsible className="mb-10">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.q} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-display text-base">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button variant="cta" asChild><Link to="/pricing">Review pricing and billing terms <ArrowRight size={16} /></Link></Button>
    </div>
  </section>
);

export default HomeFAQ;
