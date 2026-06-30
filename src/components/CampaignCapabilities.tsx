import { motion } from "framer-motion";
import {
  FileText, LayoutTemplate, Tag, Mail, Megaphone, Share2, Newspaper, Video, FormInput, GitBranch, LineChart,
} from "lucide-react";

const cards = [
  { icon: FileText, title: "Campaign strategy summary", desc: "A clear plan you can act on — audience, message, channels, sequencing." },
  { icon: LayoutTemplate, title: "Landing page copy", desc: "Conversion-ready copy you can paste into any page builder." },
  { icon: Tag, title: "Offer copy", desc: "Headline, sub, bullets, CTA — written to move buyers, not impress writers." },
  { icon: Mail, title: "Email sequence", desc: "Multi-step nurture and follow-up emails that keep buyers warm." },
  { icon: Megaphone, title: "Ad variants", desc: "Multiple ad concepts so you can test what wins, not guess." },
  { icon: Share2, title: "Social media pack", desc: "Launch posts, follow-up posts, hooks, CTAs and platform variants — ready to schedule." },
  { icon: Newspaper, title: "Press release", desc: "Distribution-ready announcement to amplify launches and milestones." },
  { icon: Video, title: "Video pack", desc: "Scripts, hooks, shot list, storyboard outline, captions and CTA endings." },
  { icon: FormInput, title: "Lead capture", desc: "Every campaign has a clear way to collect interest and move it into the pipeline." },
  { icon: GitBranch, title: "Simple pipeline", desc: "Track leads from first contact to closed — no separate CRM required." },
  { icon: LineChart, title: "Monthly review", desc: "Auto-generated performance report so you see what worked and what to repeat." },
];

const CampaignCapabilities = () => (
  <section className="section-padding bg-background">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-14"
      >
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">What you get</p>
        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
          Everything you need to launch a real campaign
        </h2>
        <p className="text-muted-foreground text-lg">
          Generated from your brief. Editable in the workspace. Built around revenue, not output volume.
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
            <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CampaignCapabilities;
