import { siGmail, siGoogle, siIcloud } from "simple-icons";
import { Mail, Server, Plug, AtSign, Inbox } from "lucide-react";

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

interface Provider {
  label: string;
  note: string;
  icon: React.ReactNode;
}

const providers: Provider[] = [
  { label: "Google / Gmail", note: "Personal Gmail", icon: <BrandIcon icon={siGmail} /> },
  { label: "Google Workspace", note: "Workspace", icon: <BrandIcon icon={siGoogle} /> },
  { label: "Outlook", note: "Outlook.com", icon: <Inbox size={22} className="text-[#0078D4]" /> },
  { label: "Microsoft 365", note: "Microsoft 365", icon: <Mail size={22} className="text-[#D83B01]" /> },
  { label: "iCloud Mail", note: "Apple iCloud", icon: <BrandIcon icon={siIcloud} /> },
  { label: "IMAP mailboxes", note: "Any IMAP provider", icon: <AtSign size={22} className="text-accent" /> },
  { label: "Exchange / EWS", note: "On-prem / hosted", icon: <Server size={22} className="text-[#0078D4]" /> },
  { label: "Yahoo via SMTP", note: "SMTP now", icon: <Mail size={22} className="text-[#6001D2]" /> },
  { label: "Advanced SMTP", note: "Custom SMTP host", icon: <Plug size={22} className="text-accent" /> },
];

interface Props {
  variant?: "full" | "compact";
}

export default function EmailIntegrationsStrip({ variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <section className="py-10 border-y border-border/50 bg-splash-blue relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-5">
            Connects with Google, Microsoft, iCloud, IMAP, Exchange and SMTP
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {providers.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-2 opacity-90 hover:opacity-100 transition"
                title={p.label}
              >
                <div className="flex items-center justify-center h-6 w-6 shrink-0">{p.icon}</div>
                <span className="text-xs font-medium text-foreground/80">{p.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            Yahoo via SMTP today; native Yahoo connector coming next. Replies return to your connected inbox.
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
            Works with the inboxes your team already uses
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Connect your mailbox, send safely, and keep replies in your own inbox.
          </h2>
          <p className="text-muted-foreground">
            Velocity connects through Nylas and SMTP so campaigns can send from the mailbox your team already uses — with warm-up controls, legal gates and follow-up tracking built in. Replies return to your connected inbox.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {providers.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card"
            >
              <div className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-muted/40">
                {p.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.label}</p>
                <p className="text-[10px] text-muted-foreground">{p.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-2xl mx-auto text-center">
          Yahoo native connector is coming next; Yahoo can be connected through SMTP/app-password setup today.
          Logos shown for identification only; each provider is a trademark of its respective owner.
        </p>
      </div>
    </section>
  );
}
