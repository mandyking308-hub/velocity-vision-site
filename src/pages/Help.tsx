import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sections = [
  {
    title: "Getting started",
    items: [
      {
        q: "How do I start using Velocity Vision?",
        a: "Sign up for a workspace, upload your audience into the Data Vault, choose or build a template, review the generated assets, and activate a safe outreach cadence. Everything is self-serve inside your workspace.",
      },
      {
        q: "Do I need clean data before I start?",
        a: "No. Velocity Vision is built for messy contact data. Upload a CSV, paste records, or import a spreadsheet. The Data Vault will flag duplicates, missing fields, risky formats and quality issues so you can clean it as you go.",
      },
      {
        q: "What should I do first?",
        a: "Add your data, review the quality flags, and run one template against a small test segment. This lets you see the output quality and sender verification flow before activating a larger cadence.",
      },
    ],
  },
  {
    title: "Data Vault & quality review",
    items: [
      {
        q: "What can I upload?",
        a: "Contact lists from CSV, spreadsheet paste, or a structured import. The Data Vault maps common fields such as name, email, company, title, location, sector and any custom tags you want to segment by.",
      },
      {
        q: "What happens after upload?",
        a: "Each row is validated, deduplicated, scored and placed into a quality bucket. You get a summary plus a recommended action list, and you can fix rows before they are activated.",
      },
      {
        q: "What do valid, needs review, risky, blocked and duplicate mean?",
        a: "Valid rows are ready to use. Needs review rows have minor issues like missing optional fields. Risky rows have formatting or deliverability concerns. Blocked rows are missing required contact data or violate safety rules. Duplicate rows are already in your vault or in another workspace.",
      },
    ],
  },
  {
    title: "Templates & outreach assets",
    items: [
      {
        q: "What is inside a template?",
        a: "A template is a reusable workflow that generates outreach assets for your segment: email sequences, social posts, hooks, press releases, landing page copy and lead capture copy. You can start from a blank template or use a proven one.",
      },
      {
        q: "Can I edit the outputs?",
        a: "Yes. Every asset is editable inside the workspace. You can change tone, copy, subject lines, CTAs and any other generated content before you activate it.",
      },
      {
        q: "Can I regenerate part of an output pack?",
        a: "Yes. You can regenerate a single email, one social post, or any other asset without rebuilding the whole template or campaign.",
      },
    ],
  },
  {
    title: "Safe activation",
    items: [
      {
        q: "Why do I need to verify a sender?",
        a: "Sender verification proves you own the domain and protects deliverability. Without it, the platform blocks activation to keep your sending reputation safe and your domain out of spam filters.",
      },
      {
        q: "What happens if a segment contains risky records?",
        a: "Risky records are flagged before activation. You can either fix them, remove them, or override the flag with a clear audit trail. The safety engine also caps send volume and limits how many risky records can go live in a single batch.",
      },
      {
        q: "Can I schedule sends instead of activating immediately?",
        a: "Yes. You can set a start date, recurrence and time window. The cadence runs automatically and you can pause, edit or reschedule it at any time.",
      },
    ],
  },
  {
    title: "Replies, follow-up & pipeline",
    items: [
      {
        q: "Where do replies go?",
        a: "Replies from your connected email address land in the follow-up queue inside the workspace. You can respond, snooze, mark as done, or move the contact into the pipeline.",
      },
      {
        q: "How do follow-up states work?",
        a: "Replies are automatically grouped into states such as new, warm, snoozed, or needs action. You can add manual notes, set a custom snooze date, and see which contacts are going stale so nothing falls through the cracks.",
      },
      {
        q: "When should I move someone into pipeline?",
        a: "Move a contact into pipeline when they show buying intent, book a call, or ask for a proposal. The workspace tracks opportunity value and stage, so you can see live revenue movement without switching systems.",
      },
    ],
  },
  {
    title: "Billing & credits",
    items: [
      {
        q: "What plans are available?",
        a: "Starter, Growth and Agency Workspace plans. Each plan includes a base number of campaign credits, access to the Data Vault, templates and the workspace. See the pricing page for current limits and included features.",
      },
      {
        q: "What happens when credits run out?",
        a: "Your workspace, data, templates and assets remain intact. Activation and new asset generation are paused until you add more credits or upgrade your plan.",
      },
      {
        q: "Can I top up or upgrade?",
        a: "Yes. You can buy a top-up credit pack at any time, or upgrade your plan to a higher tier. Both happen inside your workspace billing settings.",
      },
    ],
  },
  {
    title: "Agency workspaces",
    items: [
      {
        q: "How are clients kept separate?",
        a: "Each client gets its own workspace with isolated data, activation, templates, replies and pipeline. You switch between workspaces from one agency account and nothing is shared unless you choose to share it.",
      },
      {
        q: "Can I reuse templates across clients?",
        a: "Yes. Save a template at the agency level and deploy it inside any client workspace. Each deployment still uses that client's own data and sender settings.",
      },
      {
        q: "How do pooled credits work?",
        a: "Agency Workspace credits are pooled across the account. Use them where the work lands, set internal limits per client, and keep a single billing rhythm for your whole book.",
      },
    ],
  },
  {
    title: "Reports & exports",
    items: [
      {
        q: "What can I export?",
        a: "You can export contact lists, campaign assets, pipeline data, send audit logs and follow-up reports. Exports are available in common formats such as CSV and PDF.",
      },
      {
        q: "Are seeded demo assets real downloads?",
        a: "Demo assets are realistic sample data designed for testing. They show you what the workspace looks like with live inputs, but they are not tied to real contacts or real sending.",
      },
      {
        q: "How do I test a real export?",
        a: "Upload your own data or generate a small real test segment, then use the export button from any report, asset list or pipeline view. This confirms the formatting matches your workflow before a full send.",
      },
    ],
  },
];

const Help = () => (
  <>
    <SEO
      title="Help — Velocity Vision knowledge base"
      description="Practical answers for Velocity Vision: getting started, Data Vault, templates, safe activation, follow-up, billing, agency workspaces and exports."
      path="/help"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Help</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4">Knowledge base</h1>
            <p className="text-primary-foreground/75 text-lg">Practical answers to the questions users actually ask.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-3xl mx-auto space-y-12">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">{s.title}</h2>
              <Accordion type="single" collapsible>
                {s.items.map((it, i) => (
                  <AccordionItem key={i} value={`${s.title}-${i}`}>
                    <AccordionTrigger className="text-left font-display">{it.q}</AccordionTrigger>
                    <AccordionContent className="text-foreground/80 leading-relaxed">{it.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-hero">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Ready to put your workspace to work?</h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl mx-auto">
            Open your workspace and start moving data into outreach, replies and pipeline.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/auth">Open your workspace <ArrowRight size={18} /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Help;
