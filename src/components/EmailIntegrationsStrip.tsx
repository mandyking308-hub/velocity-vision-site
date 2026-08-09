import { siGmail, siGoogle, siIcloud } from "simple-icons";
import { Mail, Server, Plug, AtSign, Inbox } from "lucide-react";

type BrandProps = {
  icon: { path: string; hex: string; title: string };
  size?: number;
};

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
  { label: "IMAP mailboxes", note: "Compatible IMAP provider", icon: <AtSign size={22} className="text-accent" /> },
  { label: "Exchange / EWS", note: "On-premises or hosted", icon: <Server size={22} className="text-[#0078D4]" /> },
  { label: "Yahoo via SMTP", note: "SMTP connection", icon: <Mail size={22} className="text-[#6001D2]" /> },
  { label: "Advanced SMTP", note: "Custom SMTP host", icon: <Plug size={22} className="text-accent" /> },
];

interface Props {
  variant?: "full" | "compact";
}

export default function EmailIntegrationsStrip({ variant = "full" }: Props) {
  if (variant === "compact") {
    return (
      <div className="panel-wrap">
        <div className="panel-blue">
          <section className="section-padding">
            <div className="max-w-6xl mx-auto px-4">
              <p className="text-center text-xs uppercase tracking-widest mb-5 opacity-90">
                Mailbox connection options for Google, Microsoft, iCloud, IMAP, Exchange and SMTP
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {providers.map((provider) => (
                  <div
                    key={provider.label}
                    className="flex items-center gap-2 rounded-xl border border-white/40 bg-white px-4 py-2 shadow-card"
                    title={provider.label}
                  >
                    <div className="flex items-center justify-center h-6 w-6 shrink-0">
                      {provider.icon}
                    </div>
                    <span className="text-xs font-medium text-foreground/90">
                      {provider.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/80 mt-5 text-center">
                Connection availability depends on the customer's provider, account permissions and configuration. Replies return through the connected mailbox route.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <section className="section-padding bg-splash-blue relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">
            Customer mailbox connections
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Connect an authorized mailbox and keep replies in the customer's inbox
          </h2>
          <p className="text-muted-foreground">
            Supported connection routes use Nylas or SMTP configuration. Before activation, the customer verifies the sender, reviews the selected records and approves the cadence and content. Connection controls do not guarantee deliverability, inbox placement or legal compliance.
          </p>
        </div>

        <div
          className="relative overflow-hidden max-w-5xl mx-auto"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex gap-3 w-max animate-[providers-marquee_34s_linear_infinite] hover:[animation-play-state:paused]">
            {[...providers, ...providers].map((provider, index) => (
              <div
                key={`${provider.label}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card shrink-0 w-[230px]"
              >
                <div className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-muted/40">
                  {provider.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {provider.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {provider.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes providers-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

        <p className="text-xs text-muted-foreground mt-6 max-w-3xl mx-auto text-center">
          Provider compatibility and connection availability may change and can depend on account type, permissions, app-password requirements and third-party provider rules. Logos are shown for identification only; each provider is a trademark of its respective owner.
        </p>
      </div>
    </section>
  );
}
