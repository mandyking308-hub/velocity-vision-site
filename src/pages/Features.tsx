import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const groups = [
  { label: "Data Vault and record review", features: [
    ["Upload and field mapping", "Upload customer-authorised CSV or spreadsheet records, map fields and organise companies and contacts."],
    ["Quality and duplicate flags", "Surface missing fields, invalid formats, duplicates and records requiring customer review. These labels are operational aids, not legal approval."],
    ["Customer-reviewed segments", "Create segments from reviewed records without treating a software label as lawful-basis or recipient-suitability approval."],
  ]},
  { label: "Guided first campaign", features: [
    ["First-Campaign Copilot", "Answer a short brief and prepare a complete editable campaign pack from the customer-provided goal, audience, offer and tone."],
    ["First Campaign Launchpad", "See campaign-specific progress across brief, data, content, human approval, activation preparation and follow-up."],
    ["Full campaign-pack generation", "Campaign Credits currently fund the live full campaign-pack generator. Sending and data review are governed separately."],
  ]},
  { label: "Activation preparation", features: [
    ["Campaign preparation preflight", "Check selected campaign, content, eligible records, current legal acceptance, human approval and sample-data status before preparing leads."],
    ["Lead preparation, not sending", "Activation preparation creates campaign leads. It does not send email and does not consume Campaign Credits."],
    ["Customer-controlled overrides", "Records needing review or carrying risk remain visible for customer assessment; blocked or suppressed records remain excluded by current platform rules."],
  ]},
  { label: "Live sending controls", features: [
    ["Paid-plan send ceilings", "Normal ceilings are 20/day Starter, 50/day Growth and 100/day Agency; Free Preview has zero live sending."],
    ["Mailbox and safety checks", "Before a real send, the product rechecks the eligible paid plan, mailbox state, unsubscribe handling and current daily allowance."],
    ["Safety can only reduce", "Warm-up, sender health and other operational safety controls can reduce the daily allowance; they never increase the plan ceiling or guarantee deliverability."],
  ]},
  { label: "Reply Intent Command Centre", features: [
    ["Reply triage", "Group recorded replies by interested, not now, not interested, referral, out of office, unsubscribe, bounce and other intent states."],
    ["Compliance-first precedence", "Unsubscribe and bounce wording takes precedence over sales-positive classifications. This is an operational safeguard, not legal advice."],
    ["Referrals and OOO dates", "Surface referral details for review and record detected out-of-office return dates without auto-creating contacts or auto-sending follow-up."],
  ]},
  { label: "Meetings, pipeline and outcomes", features: [
    ["Meeting handoff", "Move an interested reply into handoff with notes and your own configurable booking link. No calendar connection or sync is claimed."],
    ["Early opportunity records", "Customer-selected warm contacts can become opportunity records with stage, value and next action."],
    ["Outcome Funnel", "Report Contacted → Replied → Interested/Referral → Meeting booked → Opportunity → Won from stored records only. No automated attribution or A/B testing."],
  ]},
  { label: "Cadence and reusable work", features: [
    ["One-off campaigns", "Starter, Growth and Agency support one-off customer-controlled campaigns."],
    ["Recurring cadence", "Growth and Agency add weekly, monthly or custom recurring cadence and reusable recurring templates/segments."],
    ["No automatic sending", "Cadence dates organise recurring work. Every run remains customer-controlled and still passes the applicable send-time checks."],
  ]},
  { label: "Agency Workspace", features: [
    ["Isolated client workspaces", "Keep authorised client data, drafts, sender settings, replies and pipeline records separated by workspace."],
    ["Pooled Campaign Credits", "Use the Agency plan's 250 monthly Campaign Credits across isolated client workspaces."],
    ["Account-wide visibility", "Review account-wide daily send usage plus cross-client pipeline and Outcome Funnel records. No seat management or cross-seat pooled-send enforcement is claimed."],
  ]},
  { label: "Billing and optional review", features: [
    ["Published plans", "Free Preview £0; Starter £149 one-off; Growth £249/month; Agency £499/month, with the current included credits and send ceilings shown on Pricing."],
    ["Paid-workspace top-ups", "Credit top-ups are only for eligible paid workspaces. Free Preview cannot buy top-ups and remains capped at one full campaign pack."],
    ["Premium Human Review", "Where available, the £199 one-off add-on provides senior-strategist review, written recommendations and one asynchronous revision pass. It is separate from complimentary onboarding/setup guidance."],
  ]},
];

export default function Features() {
  return <>
    <SEO title="Features — Customer-controlled B2B software | Velocity Vision" description="Velocity Vision features for authorised business data review, full campaign-pack generation, activation preparation, governed sending, reply intent, meetings, pipeline, Outcome Funnel and agency workspaces." path="/features" />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero"><div className="max-w-5xl mx-auto"><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}><p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Features</p><h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">One customer-controlled workspace from authorised data to recorded outcomes</h1><p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl">Prepare editable AI-assisted drafts, record approvals, prepare campaign leads, use governed paid-plan sending, triage replies and track stored outcomes.</p><p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl">Velocity Vision does not scrape contacts, sell lists, provide managed campaigns, send automatically, run A/B experiments or guarantee compliance, deliverability, replies, sales, pipeline or revenue.</p><Button variant="hero" size="lg" asChild><Link to="/auth">Start Free Preview <ArrowRight size={18} /></Link></Button></motion.div></div></section>
      <div className="panel-wrap"><div className="panel-blue"><section className="section-padding"><div className="max-w-7xl mx-auto space-y-14">{groups.map((group, index) => <motion.div key={group.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.02 }}><p className="font-semibold text-sm uppercase tracking-widest mb-4 opacity-90">{group.label}</p><div className="grid grid-cols-1 md:grid-cols-3 gap-5">{group.features.map(([title, value]) => <div key={title} className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"><h2 className="font-display font-semibold mb-2">{title}</h2><p className="text-sm leading-relaxed opacity-90">{value}</p></div>)}</div></motion.div>)}</div></section></div></div>
      <section className="section-padding bg-hero text-center"><div className="max-w-3xl mx-auto"><h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5">Review the exact service level before purchase</h2><p className="text-primary-foreground/75 text-lg mb-8">Pricing shows the current plan limits, Campaign Credits, billing cadence, sending ceilings and optional Premium Human Review.</p><Button variant="hero" size="lg" asChild><Link to="/pricing">See pricing <ArrowRight size={18} /></Link></Button></div></section>
    </main>
    <EmailIntegrationsStrip variant="compact" /><CampaignChannelsStrip variant="compact" /><Footer />
  </>;
}
