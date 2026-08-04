import { motion } from "framer-motion";
import {
  Database,
  ShieldCheck,
  Send,
  Mail,
  Share2,
  Newspaper,
  Video,
  Inbox,
  GitBranch,
  BarChart3,
  Users,
} from "lucide-react";

const cards = [
  {
    icon: Database,
    title: "Data Vault",
    desc: "Upload customer-authorised CSV or spreadsheet records, map fields and organise companies, contacts and segments in one workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Quality review",
    desc: "Identify duplicates, missing fields and records requiring review. Software flags support customer assessment; they are not legal or compliance approval.",
  },
  {
    icon: Send,
    title: "Governed activation",
    desc: "Verify the customer's sender, apply plan limits and require an explicit authorised-user decision before activation.",
  },
  {
    icon: Mail,
    title: "Email drafts and cadence settings",
    desc: "Prepare editable sequence drafts and configure timing. The customer reviews the content, audience and activation settings.",
  },
  {
    icon: Share2,
    title: "Social content drafts",
    desc: "Generate editable posts, hooks and platform variants from a customer brief for review before scheduling or publishing.",
  },
  {
    icon: Newspaper,
    title: "Press release drafts",
    desc: "Create structured announcement drafts from the same customer brief for review and distribution through the customer's chosen route.",
  },
  {
    icon: Video,
    title: "Video content drafts",
    desc: "Prepare editable scripts, hooks, shot-list ideas, storyboard outlines and captions for customer review.",
  },
  {
    icon: Inbox,
    title: "Follow-up records",
    desc: "Record reply states, next actions, snoozes and customer-managed follow-up activity in one queue.",
  },
  {
    icon: GitBranch,
    title: "Early pipeline records",
    desc: "Move customer-selected warm contacts into early opportunity records and track stage, value and next action without promising an outcome.",
  },
  {
    icon: BarChart3,
    title: "Automated activity summary",
    desc: "Summarise recorded activation, reply and early-pipeline information. Reports describe workspace activity and do not guarantee performance.",
  },
  {
    icon: Users,
    title: "Agency workspaces",
    desc: "Use one agency account with isolated client workspaces, pooled Campaign Credits and account-level governance.",
  },
];

const CampaignCapabilities = () => (
  <section className="section-padding bg-splash-duo relative overflow-hidden">
    <div aria-hidden className="blob blob-blue w-80 h-80 -top-24 -left-20 animate-floaty" />
    <div aria-hidden className="blob blob-pink w-96 h-96 -bottom-32 -right-24 animate-drifty" />
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          Inside the workspace
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Customer-controlled software for data review, draft creation, activation, follow-up and early pipeline
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Velocity Vision organises customer-provided data, editable AI-assisted drafts, governed activation controls and operational records in one self-serve workspace.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed mt-4">
          Velocity Vision does not scrape contacts, sell lists, provide managed campaigns, send automatically or guarantee legal compliance, deliverability, replies, sales, pipeline or revenue.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card hover:border-accent/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <card.icon className="text-accent" size={20} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              {card.title}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CampaignCapabilities;
