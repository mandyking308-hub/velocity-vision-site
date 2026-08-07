import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sections = [
  { title: "Getting started", items: [
    ["How do I start?", "Create a workspace, upload authorised business data, review the workspace flags, create a campaign pack, record human approval and prepare eligible records as campaign leads. Free Preview cannot send live outreach."],
    ["Do I need perfectly formatted data?", "No. The workspace can surface duplicates, missing fields, invalid formats and records requiring review. Those labels support customer assessment and are not legal approval."],
    ["What is a sensible first test?", "Use a small set of business records your organisation is authorised to process, confirm source and suppression status, and review the first workflow before any paid live sending."],
  ]},
  { title: "Data Vault", items: [
    ["What does ‘eligible under checks’ mean?", "It means a record passed the current workspace-format, duplicate, blocking and quality checks. It does not establish lawful basis, consent, recipient suitability, deliverability or legal compliance."],
    ["What happens after upload?", "Records are mapped and can be checked for duplicates, missing fields, invalid formats and other review issues. The customer decides whether records remain, are corrected, suppressed or excluded."],
  ]},
  { title: "Campaign packs and Campaign Credits", items: [
    ["What does AI generate?", "The full campaign-pack generator prepares editable email, social, press and video drafts from the customer brief. Outputs remain drafts until the customer reviews them."],
    ["What uses Campaign Credits today?", "The current live credit-priced action is full campaign-pack generation. Data review, activation preparation and individual email/contact sends are not charged as Campaign Credits."],
    ["Can I regenerate a Free Preview pack?", "Free Preview is capped at one full campaign pack. It cannot generate a second full pack and does not accept credit top-ups. Compare paid plans to continue full-pack generation."],
  ]},
  { title: "Activation preparation and sending", items: [
    ["What does Activate do?", "Activation preparation creates campaign leads from customer-selected records after the campaign, legal and human-approval checks. It does not send email and does not spend Campaign Credits."],
    ["When is sender readiness checked?", "Mailbox state, unsubscribe handling, the eligible paid plan and the current daily safety allowance are checked again before a real send."],
    ["What are the normal send ceilings?", "Free Preview 0/day, Starter 20/day, Growth 50/day and Agency 100/day for the sending account. Warm-up, sender health and other safety controls can reduce those ceilings but never increase them."],
  ]},
  { title: "Replies, meetings and pipeline", items: [
    ["Where do replies go?", "Reply records available to the workspace appear in Follow-Up. Completeness depends on the connected sender/provider, so check the connected inbox when it matters."],
    ["How does reply intent work?", "The Reply Intent Command Centre groups recorded replies for review. Unsubscribe and bounce wording takes precedence over a sales-positive label, and referrals/OOO dates remain reviewable rather than triggering automatic outreach."],
    ["Does Velocity connect to my calendar?", "No calendar connection or sync is claimed. You can use your own booking link and manually record a meeting as booked when confirmed."],
    ["Does the Outcome Funnel attribute revenue?", "No. It reports Contacted → Replied → Interested/Referral → Meeting booked → Opportunity → Won from stored records only. No automated attribution or A/B testing is performed."],
  ]},
  { title: "Plans, billing and add-ons", items: [
    ["What plans are available?", "Free Preview is £0. Starter is £149 one-off for 30 days. Growth is £249/month. Agency Workspace is £499/month. Review Pricing for the current included Campaign Credits and plan limits."],
    ["Can Free Preview buy top-ups?", "No. Credit top-ups are only for eligible paid workspaces. Free Preview remains capped at one full campaign pack."],
    ["What is Premium Human Review?", "Where available, it is a separate £199 one-off add-on: senior-strategist review of the submitted campaign pack, written recommendations and one asynchronous revision pass. It is not legal advice, compliance sign-off, managed delivery or a result guarantee."],
    ["How do payment problems get resolved?", "Payment fulfilment is driven by the configured provider webhook. If Billing does not update after a successful payment, contact support with the date, amount and account email. Never send card numbers, API keys or other credentials."],
  ]},
  { title: "Agency Workspace", items: [
    ["How are clients kept separate?", "Each client workspace keeps its authorised records, drafts, sender settings, replies and pipeline records isolated. Plan billing and pooled Campaign Credits remain account-level."],
    ["What does Agency account-wide sending mean?", "Agency shows account-wide daily send usage across client workspaces and has a normal 100/day plan ceiling for the sending account. It does not claim seat management or cross-seat pooled-send enforcement."],
  ]},
];

export default function Help() {
  return <>
    <SEO title="Velocity Vision Help Centre" description="Product guidance for Velocity Vision data review, campaign packs, activation preparation, governed sending, replies, billing and Agency Workspace." path="/help" />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero"><div className="max-w-4xl mx-auto"><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}><p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Product guidance</p><h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4">Velocity Vision Help Centre</h1><p className="text-primary-foreground/75 text-lg">Current guidance for the customer-controlled workflow, plan limits, Campaign Credits, sending and support.</p></motion.div></div></section>
      <div className="panel-wrap"><div className="panel-pink"><section className="section-padding"><div className="max-w-4xl mx-auto space-y-6">{sections.map((section) => <div key={section.title} className="bg-white rounded-xl border border-white/40 shadow-card p-6 md:p-8 text-foreground"><h2 className="text-2xl font-display font-bold mb-2">{section.title}</h2><Accordion type="single" collapsible>{section.items.map(([q, a], index) => <AccordionItem key={q} value={`${section.title}-${index}`}><AccordionTrigger className="text-left font-display">{q}</AccordionTrigger><AccordionContent className="text-foreground/80 leading-relaxed">{a}</AccordionContent></AccordionItem>)}</Accordion></div>)}</div></section></div></div>
      <section className="section-padding bg-hero"><div className="max-w-3xl mx-auto text-center"><h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Need account, billing or compliance support?</h2><p className="text-primary-foreground/75 text-lg mb-8">Use the Contact page and select the route that matches the enquiry. Never include passwords, API keys, app passwords or webhook secrets.</p><Button variant="hero" size="lg" asChild><Link to="/contact">Open Contact page <ArrowRight size={18} /></Link></Button></div></section>
    </main><Footer />
  </>;
}
