import { siLinkedin, siX, siFacebook, siInstagram, siGoogleads, siMeta } from "simple-icons";
import { Mail, Newspaper, LayoutTemplate, Repeat2 } from "lucide-react";

type BrandProps = { icon: { path: string; hex: string; title: string }; size?: number };
const BrandIcon = ({ icon, size = 22 }: BrandProps) => (
  <svg
    role="img"
    aria-label={icon.title}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={`#${icon.hex}`}
  >
    <path d={icon.path} />
  </svg>
);

interface Channel {
  label: string;
  note: string;
  icon: React.ReactNode;
}

const channels: Channel[] = [
  { label: "Email campaigns", note: "Sequences & one-offs", icon: <Mail size={22} className="text-accent" /> },
  { label: "LinkedIn posts", note: "Company & personal", icon: <BrandIcon icon={siLinkedin} /> },
  { label: "X / Twitter posts", note: "Short-form", icon: <BrandIcon icon={siX} /> },
  { label: "Facebook posts", note: "Page updates", icon: <BrandIcon icon={siFacebook} /> },
  { label: "Instagram captions", note: "Feed & reels copy", icon: <BrandIcon icon={siInstagram} /> },
  { label: "Google Ads", note: "Search & display copy", icon: <BrandIcon icon={siGoogleads} /> },
  { label: "Meta Ads", note: "Facebook & Instagram", icon: <BrandIcon icon={siMeta} /> },
  { label: "PR / press outreach", note: "Pitches & releases", icon: <Newspaper size={22} className="text-[#0B1B3B]" /> },
  { label: "Landing page copy", note: "Lead capture & offer", icon: <LayoutTemplate size={22} className="text-accent" /> },
  { label: "Follow-up sequences", note: "Nurture & re-engage", icon: <Repeat2 size={22} className="text-[#0078D4]" /> },
];

interface Props {
  variant?: "full" | "compact";
}

export default function CampaignChannelsStrip({ variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <section className="py-10 border-y border-border/50 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">
            Campaign-ready assets for email, social, PR and paid channels
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {channels.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2 opacity-90 hover:opacity-100 transition"
                title={c.label}
              >
                <div className="flex items-center justify-center h-6 w-6 shrink-0">{c.icon}</div>
                <span className="text-xs font-medium text-foreground/80">{c.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            Velocity Vision prepares social and paid-channel content. Publishing remains under your control.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background border-b border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">
            One workspace, every channel
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Generate campaign-ready assets for email, social, PR and paid channels.
          </h2>
          <p className="text-muted-foreground">
            Velocity Vision drafts on-brand copy for every channel your team runs — with review gates before anything goes live. Publishing remains under your control.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
          {channels.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card"
            >
              <div className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-muted/40">
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-2xl mx-auto text-center">
          Logos shown for identification only; each platform is a trademark of its respective owner. Velocity Vision does not post to third-party social or ad accounts on your behalf.
        </p>
      </div>
    </section>
  );
}
