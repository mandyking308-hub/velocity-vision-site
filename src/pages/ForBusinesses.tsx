import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Database,
  ShieldCheck,
  Inbox,
  GitBranch,
  RefreshCw,
  Eye,
  Mail,
  Share2,
  Newspaper,
  Megaphone,
  Layers,
  CheckCircle2,
} from "lucide-react";

const essentials = [
  {
    icon: Database,
    title: "Organize customer-owned data",
    desc: "Upload authorized business records, map fields, identify duplicates and separate records that need review before use.",
  },
  {
    icon: ShieldCheck,
    title: "Apply governed activation controls",
    desc: "Verify the customer's sender, review the selected segment and apply plan-level limits before the customer approves activation.",
  },
  {
    icon: Inbox,
    title: "Manage follow-up",
    desc: "Record reply and follow-up states, snooze next actions and keep customer-managed activity visible in one workspace.",
  },
  {
    icon: GitBranch,
    title: "Track early pipeline",
    desc: "Move customer-selected warm contacts into opportunities and record stage, value and next action without promising a commercial outcome.",
  },
  {
    icon: RefreshCw,
    title: "Reuse approved structures",
    desc: "Save editable templates, segments and cadence settings so future customer-led work starts from a reviewed structure.",
  },
  {
    icon: Eye,
    title: "Keep activity visible",
    desc: "View data preparation, approved activation, follow-up and early pipeline in the same customer-controlled software environment.",
  },
];

const outputs = [
  {
    icon: Mail,
    title: "Email sequence drafts",
    desc: "Prepare editable multi-step email drafts for customer review before any activation decision.",
  },
  {
    icon: Share2,
    title: "Social content drafts",
    desc: "Generate editable social posts, hooks and platform variants from a customer brief.",
  },
  {
    icon: Newspaper,
    title: "Press release drafts",
    desc: "Create structured announcement drafts that the customer reviews, edits and distributes through its chosen route.",
  },
  {
    icon: Megaphone,
    title: "Campaign workspace",
    desc: "Keep the brief, approved segment, draft assets and activation settings together for customer review.",
  },
  {
    icon: Inbox,
    title: "Follow-up records",
    desc: "Maintain next-action and reply states without treating software suggestions as guaranteed sales opportunities.",
  },
  {
    icon: GitBranch,
    title: "Opportunity records",
    desc: "Record customer-selected opportunities and export them when a fuller CRM process is required.",
  },
];

const replaces = [
  {
    icon: Layers,
    title: "Disconnected spreadsheets",
    desc: "Use one structured Data Vault instead of multiple ungoverned copies of the same contact data.",
  },
  {
    icon: CheckCircle2,
    title: "Unclear approval steps",
    desc: "Separate draft generation, data review, sender verification and customer activation approval.",
  },
  {
    icon: Inbox,
    title: "Follow-up held only in inboxes",
    desc: "Record customer-managed follow-up states and next actions in the workspace.",
  },
  {
    icon: RefreshCw,
    title: "Repeated setup work",
    desc: "Reuse reviewed templates and segment structures without automatically reactivating previous activity.",
  },
];

const ForBusinesses = () => (
  <>
    <SEO
      title="For Businesses — Customer-controlled commercial workspace | Velocity Vision"
      description="A self-serve software workspace for businesses to organize their own data, prepare AI-assisted drafts, approve governed activation, manage follow-up and track early pipeline."
      path="/for-businesses"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
              For businesses
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              A self-serve workspace for customer-controlled commercial activity
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl leading-relaxed">
              Organize your own business data, prepare editable AI-assisted drafts, review safe segments, approve governed activation and keep follow-up and early pipeline in one software workspace.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl leading-relaxed">
              Velocity Vision does not scrape contact data, sell lists, provide managed campaigns or send automatically. Your organization remains responsible for lawful basis, sender identity, content, suppression handling and every activation decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Start your workspace <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap">
        <div className="panel-pink">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  Core software workflow
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Structure the work without transferring customer responsibility
                </h2>
                <p className="text-lg opacity-90">
                  Velocity Vision provides software controls and editable drafts. Your team reviews the data, approves the content and decides what is activated.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {essentials.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <item.icon className="text-accent" size={20} />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-90">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="panel-wrap">
        <div className="panel-blue">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  Inside the workspace
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Editable outputs and operational records
                </h2>
                <p className="text-lg opacity-90">
                  AI-assisted outputs remain drafts until your team reviews them. Recorded activity is operational information, not a promise of replies, sales or revenue.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outputs.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <item.icon className="text-accent" size={20} />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-90">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="panel-wrap">
        <div className="panel-pink">
          <section className="section-padding">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-3xl mb-10">
                <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">
                  Operational clarity
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Reduce fragmented admin without claiming automatic outcomes
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {replaces.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white border border-white/40 rounded-xl p-6 shadow-card text-foreground"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <item.icon className="text-accent" size={20} />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm leading-relaxed opacity-90">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Review the product and choose the appropriate plan
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-3xl mx-auto">
            Published pricing explains the plans, billing cadence, Campaign Credits, access periods and activation requirements before purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">
                Start your workspace <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <CampaignChannelsStrip variant="compact" />
    <Footer />
  </>
);

export default ForBusinesses;
