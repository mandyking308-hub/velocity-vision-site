import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Upload, Rocket, Send, ShieldCheck, TrendingUp, Coins } from "lucide-react";

const topics = [
  { icon: Sparkles, title: "How Campaign Credits work", body: "Campaign Credits are non-cashable product-usage units for credit-priced AI generation. The current live credit-priced action is full campaign-pack generation. Data review, activation preparation and individual email/contact sends are not charged as Campaign Credits." },
  { icon: Upload, title: "Upload authorized data", body: "Use CSV or spreadsheet upload only for business records your organization is authorized to process. Workspace quality flags support customer review and do not establish lawful basis, recipient suitability, deliverability or compliance." },
  { icon: Rocket, title: "Prepare the first campaign pack", body: "Use the Copilot or campaign builder to set the goal, audience, offer and tone, then generate and review the editable full campaign pack. Free Preview is capped at one full pack." },
  { icon: ShieldCheck, title: "Review and approve the campaign", body: "Check factual accuracy, claims, recipients, tone and applicable legal requirements. Record human approval before activation preparation. Premium Human Review is a separate paid add-on where available; ordinary human approval remains the customer's responsibility." },
  { icon: Send, title: "Prepare leads, then send separately", body: "Activation preparation creates campaign leads and does not send email or spend Campaign Credits. Before a real send, the product rechecks the eligible paid plan, mailbox state, unsubscribe handling and current daily allowance." },
  { icon: TrendingUp, title: "Choose the right paid service level", body: "Starter is $189 one-off with 30 days and a normal 20/day send ceiling. Growth is $315/month with recurring cadence and 50/day. Agency is $629/month with isolated client workspaces, pooled credits and a 100/day normal ceiling." },
  { icon: Coins, title: "Additional Campaign Credits", body: "Credit top-ups are only for eligible paid workspaces. Free Preview cannot buy top-ups and remains capped at one full campaign pack. The final amount, currency, tax treatment, payment provider and terms are confirmed before payment." },
];

export default function GettingStarted() {
  return <>
    <SEO title="Getting started — Velocity Vision" description="Start with authorised business data, build and review a campaign pack, prepare campaign leads, understand Campaign Credits and move to governed paid-plan sending." path="/help/getting-started" />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero"><div className="max-w-4xl mx-auto"><motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}><p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Getting started</p><h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">From Free Preview to customer-controlled paid sending</h1><p className="text-primary-foreground/75 text-lg max-w-3xl">Start with a small authorised record set and one full preview campaign pack. Free Preview has no live sending, no top-ups and no automatic paid upgrade.</p></motion.div></div></section>
      <div className="panel-wrap"><div className="panel-blue"><section className="section-padding"><div className="max-w-5xl mx-auto"><div className="grid gap-4 md:grid-cols-2">{topics.map(({ icon: Icon, title, body }, index) => <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"><div className="flex items-center gap-2 mb-2"><Icon className="h-5 w-5 text-accent" /><h2 className="font-display font-semibold">{title}</h2></div><p className="text-sm text-foreground/75 leading-relaxed">{body}</p></motion.div>)}</div><div className="mt-10 p-6 rounded-xl bg-white border border-white/40 shadow-card text-foreground"><h2 className="font-display font-semibold mb-1">Need more help?</h2><p className="text-sm text-foreground/75">Use the <Link to="/help" className="text-accent underline">Help Centre</Link> for current product guidance or the <Link to="/contact" className="text-accent underline">Contact page</Link> for account, billing, privacy, security or legal inquiries. Never send passwords, API keys or other credentials.</p></div></div></section></div></div>
    </main><Footer />
  </>;
}
