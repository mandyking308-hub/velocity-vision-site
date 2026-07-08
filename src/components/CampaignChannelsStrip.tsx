import { siX, siFacebook, siInstagram, siGoogleads, siMeta } from "simple-icons";
import { Mail, Newspaper, LayoutTemplate, Repeat2, Linkedin } from "lucide-react";

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
  { label: "LinkedIn posts", note: "Company & personal", icon: <Linkedin size={22} className="text-[#0A66C2]" /> },
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
      <div className="panel-wrap"><div className="panel-pink">
        <section className="section-padding">
          <div className="max-w-6xl mx-auto px-4">
            <p className="text-center text-xs uppercase tracking-widest mb-5 opacity-90">
              Campaign-ready assets for email, social, PR and paid channels
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {channels.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-2 rounded-xl border border-white/40 bg-white px-4 py-2 shadow-card"
                  title={c.label}
                >
                  <div className="flex items-center justify-center h-6 w-6 shrink-0">{c.icon}</div>
                  <span className="text-xs font-medium text-foreground/90">{c.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/80 mt-5 text-center">
              Velocity Vision prepares social and paid-channel content. Publishing remains under your control.
            </p>
          </div>
        </section>
      </div></div>
    );
  }

  return (
    <section className="section-padding bg-splash-pink relative overflow-hidden">
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

        <div
          className="relative overflow-hidden max-w-5xl mx-auto"
          style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
        >
          <div className="flex gap-3 w-max animate-[channels-marquee_38s_linear_infinite] hover:[animation-play-state:paused]">
            {[...channels, ...channels].map((c, i) => (
              <div
                key={`${c.label}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card shrink-0 w-[230px]"
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
        </div>
        <style>{`@keyframes channels-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

        <p className="text-xs text-muted-foreground mt-6 max-w-2xl mx-auto text-center">
          Logos shown for identification only; each platform is a trademark of its respective owner. Velocity Vision does not post to third-party social or ad accounts on your behalf.
        </p>
      </div>
    </section>
  );
}
