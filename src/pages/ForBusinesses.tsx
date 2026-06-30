import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Database, ShieldCheck, Inbox, GitBranch, RefreshCw, Eye, Mail, Share2, Newspaper, Megaphone, Zap, CheckCircle2, XCircle, Clock, TrendingUp, Layers, Sparkles } from "lucide-react";

const cases = [
  { icon: Database, title: "Organise messy data", desc: "Upload spreadsheets and exports. Field-map once. See what's usable, what's duplicated, what's risky." },
  { icon: ShieldCheck, title: "Activate safely", desc: "Verify your sender, pick a safe segment and let governed activation handle daily caps and risky records." },
  { icon: Inbox, title: "Own follow-up", desc: "Replies land in one action queue. Snooze, mark stuck and follow up — nothing disappears into an inbox." },
  { icon: GitBranch, title: "Move pipeline", desc: "Promote warm contacts into opportunities, track value and progress without buying a separate CRM." },
  { icon: RefreshCw, title: "Repeat what works", desc: "Recurring cadence, reusable segments and templates. The next run starts from the last winner, not a blank page." },
  { icon: Eye, title: "See the whole picture", desc: "Data, sending, replies and pipeline in one workspace. No more guessing which tool holds the truth." },
];

const capabilities = [
  { icon: Mail, title: "Email sequences", desc: "Multi-step outreach with timing, follow-ups and recurring cadence built in." },
  { icon: Share2, title: "Social media content", desc: "Launch posts, hooks and platform variants generated alongside your outreach." },
  { icon: Newspaper, title: "Press releases", desc: "Distribution-ready announcements for launches, milestones and funding news." },
  { icon: Megaphone, title: "Campaigns", desc: "Brief once, generate the full asset pack, activate the right segment, track the result." },
  { icon: Inbox, title: "Follow-up", desc: "Action queue for replies. Snooze, stuck-deal alerts, nothing slipping through inboxes." },
  { icon: GitBranch, title: "Pipeline", desc: "Promote warm contacts into opportunities and track value — no separate CRM needed." },
];

const replaces = [
  { icon: Layers, title: "Spreadsheets for contact data", desc: "Replaced by the Data Vault — field-mapped, deduped, quality-scored." },
  { icon: XCircle, title: "Six disconnected tools", desc: "One workspace covers outreach, social, PR, replies and pipeline." },
  { icon: Clock, title: "Freelancer & agency overhead", desc: "Generate the assets in-house in minutes instead of waiting on a retainer." },
  { icon: Inbox, title: "Missed follow-up in inboxes", desc: "Every reply lands in a shared action queue with snooze and stuck-deal flags." },
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

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10 max-w-2xl">What lean teams actually need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <c.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default ForBusinesses;
