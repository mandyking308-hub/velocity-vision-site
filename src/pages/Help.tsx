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
        a: "Create a workspace, add your contact data to the Data Vault, review the quality report, verify your sender, choose a template, then activate a safe cadence when the segment is ready. The core workflow is self-serve from inside the workspace.",
      },
      {
        q: "Do I need clean data before I start?",
        a: "No. Velocity Vision is built for messy commercial data. Upload a CSV, paste records, or import a spreadsheet. The Data Vault flags duplicates, missing fields, risky formats and blocked records so you can clean and segment the list before activation.",
      },
      {
        q: "What should I do first?",
        a: "Start with one small audience. Upload it, review the quality statuses, fix obvious issues, verify your sender, and generate one template output. That gives you a safe test path before you activate a larger segment.",
      },
    ],
  },
  {
    title: "Data Vault & quality review",
    items: [
      {
        q: "What can I upload?",
        a: "You can upload or paste structured contact data. Common fields include name, email, company, job title, location, sector, language preference, source and custom tags. The workspace uses those fields for segmentation, templates, activation and follow-up.",
      },
      {
        q: "What happens after upload?",
        a: "Each row is mapped, checked, deduplicated and placed into a quality status. You receive a summary of what is ready, what needs review, what is risky, what is blocked and what appears duplicated before anything is activated.",
      },
      {
        q: "What do valid, needs review, risky, blocked and duplicate mean?",
        a: "Valid records are ready for safe use. Needs review records have missing or uncertain fields you may want to fix. Risky records have deliverability or formatting concerns. Blocked records cannot be activated until the issue is resolved. Duplicate records appear to repeat an existing or newly uploaded contact.",
      },
    ],
  },
  {
    title: "AI, templates & outreach assets",
    items: [
      {
        q: "Are outputs AI-generated?",
        a: "Yes. Velocity Vision uses AI to help draft and structure outreach assets, quality checks and follow-up suggestions. You review and control what is activated or sent. AI outputs are drafts and should be reviewed before use. Velocity Vision does not guarantee replies, sales, deliverability, revenue or legal compliance.",
      },
      {
        q: "What is inside a template?",
        a: "A template is a reusable, AI-assisted commercial workflow. It can produce outreach emails, follow-up steps, social copy, hooks, press copy, landing page copy and lead capture copy, depending on the use case. Templates connect back to the chosen segment, cadence and pipeline path.",
      },
      {
        q: "Can I edit the outputs?",
        a: "Yes. AI outputs are drafts until you approve them. You can edit tone, subject lines, calls to action, body copy, sequence steps and supporting assets before anything is scheduled or sent.",
      },
      {
        q: "Can I regenerate part of an output pack?",
        a: "Yes. You can regenerate a single email, one social post, one follow-up step or another individual asset without rebuilding the whole workflow.",
      },
    ],
  },
  {
    title: "Safe activation",
    items: [
      {
        q: "Why do I need to verify a sender?",
        a: "Sender verification is required before activation. It protects your domain, supports deliverability and prevents accidental sending from an unapproved identity. If the sender is not verified, Velocity Vision blocks activation.",
      },
      {
        q: "What happens if a segment contains risky records?",
        a: "Risky records are flagged before activation. You can fix them, remove them from the segment, or keep them held back. The safety engine applies plan limits, send controls and audit checks so activation stays governed.",
      },
      {
        q: "Can I schedule sends instead of activating immediately?",
        a: "Yes. You can set a start date, cadence and sending window. You can also pause, edit or reschedule the cadence before the next send step runs.",
      },
    ],
  },
  {
    title: "Replies, follow-up & pipeline",
    items: [
      {
        q: "Where do replies go?",
        a: "Replies from connected sending accounts are organised into the follow-up workspace. From there you can reply, snooze, mark done, assign a next action or move a warm contact into pipeline.",
      },
      {
        q: "How do follow-up states work?",
        a: "Follow-up states help you separate new replies, warm conversations, snoozed items, dormant contacts and stuck opportunities. The aim is to stop useful replies disappearing into a normal inbox.",
      },
      {
        q: "When should I move someone into pipeline?",
        a: "Move a contact into pipeline when they show intent: asking for details, requesting pricing, booking a call, asking for a proposal or showing clear commercial interest. Pipeline is for live opportunities, not every contact in the vault.",
      },
    ],
  },
  {
    title: "Billing & credits",
    items: [
      {
        q: "What plans are available?",
        a: "Velocity Vision has Starter, Growth and Agency Workspace options. Plans are designed around workspace access, governed activation, templates, credits and scale. See the pricing page for the current plan details.",
      },
      {
        q: "What happens when credits run out?",
        a: "Your workspace and stored data remain in place. New asset generation, top-up actions or activation may pause until you add credits or move to a plan that fits your usage.",
      },
      {
        q: "Can I top up or upgrade?",
        a: "Yes. You can add credits or upgrade from billing settings. The model is designed so you can store data generously and pay when you activate, generate or scale usage.",
      },
    ],
  },
  {
    title: "Agency workspaces",
    items: [
      {
        q: "How are clients kept separate?",
        a: "Each client runs in its own workspace with isolated data, templates, activation, replies and pipeline. Agency users can switch between client workspaces without mixing lists, senders or opportunities.",
      },
      {
        q: "Can I reuse templates across clients?",
        a: "Yes. Agencies can reuse proven templates and workflows across client workspaces, while each client still uses its own data, sender settings, segmentation and pipeline.",
      },
      {
        q: "How do pooled credits work?",
        a: "Agency Workspace credits are pooled at account level so they can be used where the work lands. Client workspaces remain separate, while billing and usage visibility stay centralised.",
      },
    ],
  },
  {
    title: "Reports & exports",
    items: [
      {
        q: "What can I export?",
        a: "Depending on your workspace and permissions, you can export contact data, quality review results, generated assets, follow-up information, pipeline data and reports in common formats such as CSV or PDF.",
      },
      {
        q: "Are seeded demo assets real downloads?",
        a: "Seeded walkthrough data is there to help you review the product experience. Some seeded qa-seed:// asset pointers are placeholders, not real binary downloads. For a true export test, generate a fresh real asset in the workspace and export that file.",
      },
      {
        q: "How do I test a real export?",
        a: "Use a small real test segment, generate one new asset or report, then download it from the relevant workspace screen. That confirms the real export path, rather than only checking seeded demo data.",
      },
    ],
  },
];

const Help = () => (
  <>
    <SEO
      title="Velocity Vision Help Centre"
      description="User guide for Velocity Vision: workspaces, Data Vault, sender verification, campaigns, billing, activation and support tickets."
      path="/help"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">User guide</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-4">Velocity Vision Help Centre</h1>
            <p className="text-primary-foreground/75 text-lg">
              Use this guide to understand workspaces, Data Vault, sender verification, campaigns, billing, activation and support tickets.
            </p>
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
            Open your workspace and start moving data into safe outreach, replies, follow-up and pipeline.
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
