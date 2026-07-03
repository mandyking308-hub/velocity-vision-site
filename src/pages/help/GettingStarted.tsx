import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, Upload, Rocket, Send, ShieldCheck, TrendingUp, Coins } from "lucide-react";

const topics = [
  { icon: Sparkles, title: "How Campaign Credits work", body: "Credits power AI-heavy actions — full campaign packs, social packs, press releases, video scripts, follow-up assets. Data storage, uploads, review, follow-up and pipeline are always free." },
  { icon: Upload, title: "How to upload data safely", body: "Use CSV upload. Only include contacts you have a lawful basis to reach. The Data Vault scores every row for deliverability risk before you spend credits." },
  { icon: Rocket, title: "How to prepare your first campaign", body: "Pick a goal, choose an audience segment, then generate a campaign pack. Free Preview supports 1 full pack and up to 25 contacts." },
  { icon: ShieldCheck, title: "How to review AI outputs", body: "Every asset is a draft. Read for tone, factual accuracy and compliance. Edit freely — you control what is activated or sent." },
  { icon: Send, title: "Why sending is gated", body: "Live sending is only enabled once your plan, mailbox connection and compliance gates are ready. This protects deliverability and your legal position." },
  { icon: TrendingUp, title: "Moving from Free Preview to Growth", body: "When credits run low or you're ready for continuous outreach, top up credits or upgrade to Growth for recurring cadence, larger caps and follow-up automation." },
  { icon: Coins, title: "Buying credits without subscribing", body: "You can top up credits at any time — no subscription required. Top-up credits are usable as soon as your Stripe payment clears." },
];

export default function GettingStarted() {
  return (
    <>
      <SEO title="Getting started — Velocity Vision" description="Short guides for your first workspace, first upload, first campaign, and understanding Campaign Credits." path="/help/getting-started" />
      <Navbar />
      <main className="pt-24 pb-16 px-6 md:px-12 lg:px-20 bg-background">
        <div className="max-w-4xl mx-auto">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Training centre</p>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">Getting started with Velocity Vision</h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
            Practical guides for your first session. Start with Free Preview, upload a small dataset, generate a campaign pack, then decide whether to top up credits or upgrade.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {topics.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-accent" />
                    <div className="font-semibold">{title}</div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-xl border border-border bg-card">
            <div className="font-semibold mb-1">Need more help?</div>
            <p className="text-sm text-muted-foreground">
              Use the Help widget at the bottom-right of any page to send a question or share feedback. Real replies come back to the email you provide — usually within one business day.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Want a walkthrough? <Link to="/contact" className="text-accent underline">Contact us</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
