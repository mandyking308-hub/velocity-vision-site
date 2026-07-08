import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import ConfidentialityNote from "@/components/ConfidentialityNote";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Database, ShieldCheck, Inbox, GitBranch, RefreshCw, Eye, Mail, Share2, Newspaper, Megaphone, Zap, CheckCircle2, XCircle, Clock, TrendingUp, Layers, Sparkles } from "lucide-react";

const cases = [
  { icon: Database, title: "Organise messy data", desc: "Upload spreadsheets and exports. Field-map once. See what's usable, what's duplicated, what's risky." },
  { icon: ShieldCheck, title: "Activate safely", desc: "Verify your sender, pick a safe segment and let governed activation handle daily caps and risky records." },
  { icon: Inbox, title: "Own follow-up", desc: "Replies return to your connected inbox. Add follow-up actions, snooze, mark stuck and follow up — nothing disappears into a task list." },
  { icon: GitBranch, title: "Move pipeline", desc: "Promote warm contacts into opportunities, track value and progress without buying a separate CRM." },
  { icon: RefreshCw, title: "Repeat what works", desc: "Recurring cadence, reusable segments and templates. The next run starts from the last winner, not a blank page." },
  { icon: Eye, title: "See the whole picture", desc: "Data, sending, follow-up and pipeline in one workspace. No more guessing which tool holds the truth." },
];

const capabilities = [
  { icon: Mail, title: "Email sequences", desc: "Multi-step outreach with timing, follow-ups and recurring cadence built in." },
  { icon: Share2, title: "Social media content", desc: "Launch posts, hooks and platform variants generated alongside your outreach." },
  { icon: Newspaper, title: "Press releases", desc: "Distribution-ready announcements for launches, milestones and funding news." },
  { icon: Megaphone, title: "Campaigns", desc: "Brief once, generate the full asset pack, activate the right segment, track the result." },
  { icon: Inbox, title: "Follow-up", desc: "Action queue for follow-up and reply states. Snooze, stuck-deal alerts, nothing slipping through inboxes." },
  { icon: GitBranch, title: "Pipeline", desc: "Promote warm contacts into opportunities and track value — no separate CRM needed." },
];

const replaces = [
  { icon: Layers, title: "Spreadsheets for contact data", desc: "Replaced by the Data Vault — field-mapped, deduped, quality-scored." },
  { icon: XCircle, title: "Six disconnected tools", desc: "One workspace covers outreach, social, PR, follow-up and pipeline." },
  { icon: Clock, title: "Freelancer & agency overhead", desc: "Generate the assets in-house in minutes instead of waiting on a retainer." },
  { icon: Inbox, title: "Missed follow-up in inboxes", desc: "Every follow-up action lands in a shared action queue with snooze and stuck-deal flags." },
  { icon: RefreshCw, title: "Manual coordination", desc: "Recurring cadence and reusable segments mean the next run runs itself." },
];

const outcomes = [
  { icon: Zap, title: "Faster outreach", desc: "Brief to live campaign in minutes, not weeks." },
  { icon: Sparkles, title: "Cleaner execution", desc: "Sender verification, daily caps and risky-record limits keep activation safe." },
  { icon: CheckCircle2, title: "Less admin", desc: "One login, one source of truth — no copy-pasting between tools." },
  { icon: Inbox, title: "Consistent follow-up", desc: "Snooze, states and stuck-deal alerts keep every warm contact moving." },
  { icon: TrendingUp, title: "Pipeline movement", desc: "Visible opportunity value and progress, updated as you work." },
];

const ForBusinesses = () => (
  <>
    <SEO
      title="For Businesses — Commercial workspace for lean teams | Velocity Vision"
      description="One workspace for founders and lean teams to organise data, activate safely, own follow-up and move opportunities into pipeline — without agency overhead."
      path="/for-businesses"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Businesses</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              A commercial workspace for teams that need structure, not overhead
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Upload your data, activate the right contacts safely, create outreach quickly and keep follow-up moving — all from one login. No retainer. No tool sprawl.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="panel-wrap"><div className="panel-pink">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">The essentials</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What lean teams actually need</h2>
            <p className="text-lg opacity-90">
              Clean data, safe outreach, faster output, follow-up that doesn't get missed, visible pipeline — and one system instead of six.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                  <c.icon size={20} />
                </div>
                <h3 className="font-display font-semibold mb-2">{c.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div></div>

      {/* Practical capabilities */}
      <div className="panel-wrap"><div className="panel-blue">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">Inside the workspace</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What your team can actually do</h2>
            <p className="text-lg opacity-90">
              Real outputs your buyers recognise — generated, sent and tracked from one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                  <c.icon size={20} />
                </div>
                <h3 className="font-display font-semibold mb-2">{c.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div></div>

      {/* What this replaces */}
      <div className="panel-wrap"><div className="panel-pink">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">Why teams choose this</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What you stop paying for and patching together</h2>
            <p className="text-lg opacity-90">
              One workspace replaces the spreadsheet stack, the disconnected tools and the freelancer dependency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {replaces.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                  <r.icon size={20} />
                </div>
                <h3 className="font-display font-semibold mb-2">{r.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div></div>

      {/* Outcomes */}
      <div className="panel-wrap"><div className="panel-blue">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="font-semibold text-sm uppercase tracking-widest mb-3 opacity-80">Outcomes</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">What lean teams get out of it</h2>
            <p className="text-lg opacity-90">
              Less admin. Cleaner execution. Pipeline that actually moves.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((o, i) => (
              <motion.div key={o.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                  <o.icon size={20} />
                </div>
                <h3 className="font-display font-semibold mb-2">{o.title}</h3>
                <p className="text-sm leading-relaxed opacity-90">{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </div></div>

      {/* Final CTA */}
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            One workspace. Less overhead. Visible pipeline.
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl mx-auto">
            Start your workspace today, see exactly what the platform does, and pick a plan when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start your workspace <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-background px-6 md:px-12 lg:px-20 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <ConfidentialityNote />
        </div>
      </section>
    </main>
    <EmailIntegrationsStrip variant="compact" />
    <CampaignChannelsStrip variant="compact" />
    <Footer />
  </>
);

export default ForBusinesses;
