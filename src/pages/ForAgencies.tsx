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
  Building2,
  ShieldCheck,
  Coins,
  Layers,
  Inbox,
  Eye,
  Mail,
  Share2,
  Newspaper,
  GitBranch,
  Users,
  CheckCircle2,
} from "lucide-react";

const workspaceControls = [
  {
    icon: Layers,
    title: "Isolated client workspaces",
    desc: "Keep each client's authorised data, draft content, sender settings, activation decisions and pipeline records in a separate workspace.",
  },
  {
    icon: Coins,
    title: "Pooled Campaign Credits",
    desc: "Allocate account-level Campaign Credits across client workspaces while preserving the product rules attached to each paid plan.",
  },
  {
    icon: ShieldCheck,
    title: "Pooled sending governance",
    desc: "Apply account-level and workspace-level limits without treating those controls as legal approval or a deliverability guarantee.",
  },
  {
    icon: Users,
    title: "Team access",
    desc: "Manage authorised users and keep client activity associated with the correct workspace and customer instruction.",
  },
  {
    icon: Inbox,
    title: "Client-specific follow-up",
    desc: "Record replies, follow-up states and next actions inside the relevant client workspace.",
  },
  {
    icon: Eye,
    title: "Cross-workspace visibility",
    desc: "Review operational activity across the agency account without combining client records or sender identities.",
  },
];

const softwareOutputs = [
  {
    icon: Mail,
    title: "Editable email drafts",
    desc: "Prepare client-specific email sequence drafts for review before any activation decision.",
  },
  {
    icon: Share2,
    title: "Editable social drafts",
    desc: "Generate posts, hooks and variants from an authorised client brief while keeping outputs in draft.",
  },
  {
    icon: Newspaper,
    title: "Editable press drafts",
    desc: "Create announcement drafts that the agency and client review before distribution through their chosen route.",
  },
  {
    icon: GitBranch,
    title: "Follow-up and early pipeline records",
    desc: "Record client-approved opportunities, stages and next actions without promising leads, replies, sales or revenue.",
  },
];

const responsibilities = [
  "The agency must have authority from each client to use the workspace and process the relevant data.",
  "Each client or authorised agency user must provide lawfully obtained business data and maintain suppression and opt-out records.",
  "The correct client sender must be connected and verified before activation.",
  "Every draft, segment and activation decision must be reviewed and approved by an authorised user.",
  "Velocity Vision does not scrape contacts, sell lists, operate managed campaigns or send automatically.",
  "Software controls do not guarantee legal compliance, deliverability, replies, pipeline or commercial outcomes.",
];

const ForAgencies = () => (
  <>
    <SEO
      title="For Agencies — Isolated client workspaces | Velocity Vision"
      description="A self-serve agency workspace with isolated client data, pooled Campaign Credits, governed activation controls, follow-up and early pipeline records."
      path="/for-agencies"
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
              For agencies
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              One agency account with a separate software workspace for each client
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-5 max-w-3xl leading-relaxed">
              Organise authorised client data, prepare editable AI-assisted drafts, apply governed activation controls and keep follow-up and early pipeline records separated by client.
            </p>
            <p className="text-primary-foreground/70 text-sm mb-8 max-w-3xl leading-relaxed">
              Velocity Vision supplies self-serve software, not agency delivery. The agency and its clients remain responsible for authority, lawful basis, data source, sender identity, content approval, suppression handling and every activation decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Start Agency Workspace <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Send an agency enquiry</Link>
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
                  Agency workspace controls
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Separate client activity while maintaining account-level oversight
                </h2>
                <p className="text-lg opacity-90">
                  The product helps structure workspace separation and approval steps; it does not transfer the agency's or client's legal and operational responsibility to Velocity Vision.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaceControls.map((item, index) => (
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
                  Software outputs
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Draft materials and operational records remain under agency and client control
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {softwareOutputs.map((item, index) => (
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
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Building2 className="text-accent" size={22} />
                </div>
                <div>
                  <p className="font-semibold text-sm uppercase tracking-widest opacity-80">
                    Agency and client responsibilities
                  </p>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">
                    Required controls for every client workspace
                  </h2>
                </div>
              </div>
              <div className="bg-white border border-white/40 rounded-xl p-7 shadow-card text-foreground">
                <ul className="space-y-4">
                  {responsibilities.map((responsibility) => (
                    <li key={responsibility} className="flex items-start gap-3 text-sm leading-relaxed">
                      <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                      <span className="opacity-90">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Review the Agency plan before purchase
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-3xl mx-auto">
            Published pricing explains the monthly billing cadence, pooled Campaign Credits, included workspace functionality and activation requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/pricing">
                See Agency pricing <ArrowRight size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/contact">Send an agency enquiry</Link>
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

export default ForAgencies;
