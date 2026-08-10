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
  Megaphone,
  Layers,
  CheckCircle2,
  ListChecks,
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
    desc: "View data preparation, complete campaign assets, approved activation, follow-up and early pipeline in the same customer-controlled software environment.",
  },
];

const outputs = [
  {
    icon: Megaphone,
    title: "Complete campaign pack",
    desc: "Create strategy, landing & offer copy, email sequences, social content, a press release, video scripts, paid-ad copy and lead capture from one brief.",
  },
  {
    icon: Mail,
    title: "Governed email activation",
    desc: "Review and approve email sequences before eligible paid-plan sending, with sender and send-safety checks applied at activation and send time.",
  },
  {
    icon: Share2,
    title: "Social handoff through Buffer",
    desc: "Review social drafts, then hand approved text to your own Buffer account as a draft, into your queue or scheduled for later.",
  },
  {
    icon: ListChecks,
    title: "Lead capture",
    desc: "Keep the campaign's lead-capture form structure and thank-you copy connected to the same brief and campaign workspace.",
  },
  {
    icon: Inbox,
    title: "Follow-up records",
    desc: "Maintain reply, next-action and follow-up states without treating software suggestions as guaranteed sales opportunities.",
  },
  {
    icon: GitBranch,
    title: "Pipeline and Outcome Funnel",
    desc: "Record customer-selected opportunities and review stored progression from contacted through reply, meeting, opportunity and won states.",
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
    desc: "Separate campaign generation, data review, sender verification and customer activation approval.",
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
      title="For Businesses — Complete customer-controlled campaigns | Velocity Vision"
      description="A self-serve campaign workspace for businesses to organize approved data, create a complete campaign pack, choose controlled activation routes, manage replies and track early pipeline."
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
              Build the complete campaign without stitching together the workflow
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl leading-relaxed">
              Start with your approved business data and one campaign brief. Create the strategy and working assets, review everything, activate through the right channels, then manage replies and early pipeline from one workspace.
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
                  From data to campaign to response, your team stays in control
                </h2>
                <p className="text-lg opacity-90">
                  Velocity Vision connects the work in one system. Your team still reviews the data, approves the assets and decides what is activated.
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
                  Create the campaign, activate it, then manage what comes back
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
