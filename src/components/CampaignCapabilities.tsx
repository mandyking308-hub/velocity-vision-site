import { motion } from "framer-motion";
import {
  Database, ShieldCheck, Send, Mail, Share2, Newspaper, Video, Inbox, GitBranch, BarChart3, Users,
} from "lucide-react";

const cards = [
  { icon: Database, title: "Data Vault", desc: "Upload CSVs or paste rows. Field-map once. Store companies, contacts and segments in one place." },
  { icon: ShieldCheck, title: "Quality review", desc: "See duplicates, missing fields, risky records and what's safe to activate — before you send a thing." },
  { icon: Send, title: "Safe activation", desc: "Sender verification, daily caps and risky-record limits. Activation only proceeds when it's safe." },
  { icon: Mail, title: "Outreach email & cadence", desc: "Build sequences, set timing, schedule recurring runs. Stop, pause or refresh assets at any time." },
  { icon: Share2, title: "Social pack", desc: "Launch posts, hooks and platform variants ready to schedule alongside outreach." },
  { icon: Newspaper, title: "Press release", desc: "Distribution-ready announcement for launches and milestones — generated from the same brief." },
  { icon: Video, title: "Video pack", desc: "Scripts, hooks, shot list, storyboard outline and captions for short-form video." },
  { icon: Inbox, title: "Follow-up & action queue", desc: "Action queue for follow-up actions, snooze, reply states and stuck-deal alerts." },
  { icon: GitBranch, title: "Pipeline movement", desc: "Move warm contacts into early pipeline, track value and prepare for sales handoff — pipeline visibility, not CRM bloat." },
  { icon: BarChart3, title: "Performance review", desc: "Reply rates, pipeline value and activation health summarised every cycle." },
  { icon: Users, title: "Agency workspaces", desc: "One account, multiple isolated client workspaces with pooled governance and credits." },
];

const CampaignCapabilities = () => (
  <section className="section-padding bg-splash-duo relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">What's inside the workspace</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Everything you need for marketing-led growth, outreach and early pipeline
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Data Vault, quality review, email sequences, social pack, press releases, video pack, follow-up inbox, early pipeline movement — all in one workspace for founders, agencies and lean growth teams.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-card hover:border-accent/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <c.icon className="text-accent" size={20} />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">{c.title}</h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CampaignCapabilities;
