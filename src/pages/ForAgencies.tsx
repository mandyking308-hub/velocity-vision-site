import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ShieldCheck, Coins, Layers, Inbox, Eye, Mail, Share2, Newspaper, Megaphone, GitBranch, RefreshCw, Zap, Sparkles, CheckCircle2, TrendingUp, XCircle, Clock, Users, BarChart3 } from "lucide-react";

const benefits = [
  { icon: Layers, title: "One workspace per client", desc: "Isolated data, isolated activation, isolated pipeline. No cross-client contamination, no context-switching tax." },
  { icon: Coins, title: "Pooled credits across the account", desc: "Agency Workspace credits flow across all client workspaces — use them where the work lands that month." },
  { icon: ShieldCheck, title: "Pooled sending governance", desc: "Shared send limits and account-level safety controls protect deliverability across every client." },
  { icon: Inbox, title: "Follow-up & pipeline per client", desc: "Reply follow-up, follow-up states and opportunity movement, tracked per client — without bolting on another system." },
  { icon: Eye, title: "Cross-client visibility", desc: "See what's active, what's stuck and where pipeline is moving across your whole book of clients." },
  { icon: Building2, title: "Repeatable delivery", desc: "Reusable templates, segments and cadences. Operators ship the work; they don't reinvent the workflow each time." },
];

const ForAgencies = () => (
  <>
    <SEO
      title="For Agencies — Multi-client commercial workspace | Velocity Vision"
      description="Run every client from one account: isolated workspaces, pooled credits, pooled sending governance and cross-client pipeline visibility."
      path="/for-agencies"
    />
    <Navbar />
    <main className="pt-24">
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">For Agencies</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              One account. One workspace per client. No tool sprawl.
            </h1>
            <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl">
              Manage data, activation, follow-up and pipeline per client — with pooled credits, pooled sending governance and clear visibility across the whole book.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start Agency Workspace <ArrowRight size={18} /></Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">Send a volume enquiry</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-10 max-w-2xl">How agencies operationalise delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <b.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical capabilities */}
      <section className="section-padding bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">What agencies can do</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Run the whole client delivery cycle from one login</h2>
            <p className="text-foreground/75 text-lg">
              Client data, activation, content, follow-up and pipeline — managed per account, visible across the book.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Mail, title: "Email sequences per client", desc: "Build and run multi-step outreach without mixing lists or messaging between accounts." },
              { icon: Share2, title: "Social content at scale", desc: "Generate posts, hooks and platform variants alongside each client's campaign." },
              { icon: Newspaper, title: "Press releases", desc: "Draft distribution-ready announcements for launches, wins and funding news." },
              { icon: Megaphone, title: "Safe segment activation", desc: "Verify the sender, cap daily sends and flag risky records before anything goes live." },
              { icon: Inbox, title: "Follow-up per client", desc: "Follow-up actions, snoozes and stuck-deal alerts stay in the right workspace — no crossed wires." },
              { icon: GitBranch, title: "Pipeline tracking", desc: "Move warm contacts into opportunities and track value without adding another sales system seat." },
              { icon: RefreshCw, title: "Reusable templates", desc: "Save cadences, segments and asset packs. Onboard new clients faster." },
              { icon: Users, title: "Team clarity", desc: "Everyone works in the same system with clear client separation and shared templates." },
              { icon: BarChart3, title: "Cross-account visibility", desc: "See what's active, what's stuck and where the revenue is moving across the whole portfolio." },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <c.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What this replaces */}
      <section className="section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Why agencies switch</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Stop stitching tools together across every client</h2>
            <p className="text-foreground/75 text-lg">
              One workspace replaces the spreadsheet sprawl, the disconnected tool stack and the messy handoffs between team members.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: XCircle, title: "Spreadsheets per client", desc: "Replace scattered contact lists with field-mapped, deduplicated data vaults for each account." },
              { icon: XCircle, title: "Disconnected sales / email / content tools", desc: "Outreach, social, PR, follow-up and pipeline live in one connected workspace." },
              { icon: XCircle, title: "Messy handoffs", desc: "Every client has its own workspace. No more guessing which list or thread belongs to whom." },
              { icon: Clock, title: "Unclear follow-up ownership", desc: "Follow-up actions land in a single action queue per client with clear states and snooze logic." },
              { icon: Layers, title: "Tool sprawl across the team", desc: "One platform, one login, one billing rhythm. Reduce seats, reduce context switching." },
              { icon: RefreshCw, title: "Duplicated work across accounts", desc: "Reusable templates and segments mean you build the workflow once, deploy it many times." },
            ].map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <r.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{r.title}</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="section-padding bg-secondary/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Agency outcomes</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Deliver faster, scale cleaner, keep clients separate</h2>
            <p className="text-foreground/75 text-lg">
              Less overhead per client, more repeatable delivery, and a clearer view of where the work is moving.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Faster delivery", desc: "Brief to live campaign in minutes, not weeks. Ship more clients with the same team." },
              { icon: ShieldCheck, title: "Better client separation", desc: "Isolated data, activation and pipeline mean no cross-client contamination." },
              { icon: Sparkles, title: "More repeatable work", desc: "Templates and cadences turn ad-hoc delivery into a repeatable process." },
              { icon: Users, title: "Clearer team workflows", desc: "Everyone works in the same system with shared assets and per-client context." },
              { icon: TrendingUp, title: "Easier scaling", desc: "Add clients without multiplying tools, logins or admin overhead." },
              { icon: Eye, title: "Visibility across accounts", desc: "See performance, stuck deals and pipeline across the whole portfolio at a glance." },
            ].map((o, i) => (
              <motion.div key={o.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }} className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <o.icon className="text-accent" size={20} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{o.title}</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-hero">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            One account. Every client. Less tool sprawl.
          </h2>
          <p className="text-primary-foreground/75 text-lg mb-8 max-w-2xl mx-auto">
            Start your Agency Workspace today and see how multi-client delivery looks when everything lives in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Start Agency Workspace <ArrowRight size={18} /></Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/contact">Send a volume enquiry</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">See pricing</Link>
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

export default ForAgencies;
