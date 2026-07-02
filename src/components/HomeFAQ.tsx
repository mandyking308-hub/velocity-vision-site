import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is Velocity Vision AI-powered?", a: "Yes. AI drafts outreach assets (email sequences, social posts, press releases, video scripts, follow-up copy), reviews data quality and suggests follow-ups. AI outputs are drafts — you review, edit and control what is activated or sent. We don't promise replies, sales, deliverability or legal compliance." },
  { q: "What does Velocity Vision actually replace?", a: "For most teams it replaces a stitched-together stack: a spreadsheet for contacts, a separate tool for email sequences, another for social, doc templates for press releases, an inbox-as-CRM for follow-up and a half-built pipeline tracker. All of that lives in one AI-powered workspace here." },
  { q: "Is this a self-serve workspace?", a: "Yes. You upload your data, review AI-flagged quality, generate AI-assisted outreach assets, activate safely and work the follow-up from your own workspace — entirely self-serve." },
  { q: "What outputs does it actually generate?", a: "From a single brief AI drafts: email sequences, social media posts and hooks, a press release, and a short-form video pack (scripts, hooks, shot list, captions). All editable, all ready to plug into governed sending — you approve every activation." },
  { q: "What does activation actually mean?", a: "Activation is the governed step where you connect and verify your sender, pick a safe segment from your Data Vault, set cadence and only then begin sending. Daily caps and risky-record limits are enforced by the platform — you remain in control." },
  { q: "Is Velocity Vision a CRM replacement?", a: "No. Velocity Vision is built for marketing-led growth and early pipeline visibility, not CRM bloat. Outreach, follow-up states and early pipeline movement live in the workspace. Export to your CRM at any time for full sales operations and sales handoff." },
  { q: "Is this for businesses or agencies?", a: "Both. Founders, agencies and lean growth teams use one workspace to run outreach and early pipeline. Agencies use one account with isolated workspaces per client, pooled credits and pooled sending governance." },
  { q: "What happens when credits run out?", a: "Your workspace stays accessible — data, pipeline, follow-up and reporting remain live. Only new AI-heavy generations pause until you top up or upgrade. You never lose state." },
  { q: "Does it work outside the UK?", a: "Yes. Multilingual AI outreach (English and Spanish today, French in rollout), multi-currency pricing and localised checkout for international teams." },
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
