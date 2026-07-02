import { Cloud, Mail, Server, Plug } from "lucide-react";

const Initial = ({ children }: { children: string }) => (
  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-foreground shrink-0">
    {children}
  </div>
);

interface Provider {
  label: string;
  note: string;
  icon: React.ReactNode;
}

const providers: Provider[] = [
  { label: "Google / Gmail", note: "Personal Gmail", icon: <Initial>G</Initial> },
  { label: "Google Workspace", note: "Workspace", icon: <Initial>G</Initial> },
  { label: "Outlook", note: "Outlook.com", icon: <Initial>M</Initial> },
  { label: "Microsoft 365", note: "Microsoft 365", icon: <Initial>M</Initial> },
  { label: "iCloud Mail", note: "Apple iCloud", icon: <Cloud size={18} className="text-accent" /> },
  { label: "IMAP mailboxes", note: "Any IMAP provider", icon: <Mail size={18} className="text-accent" /> },
  { label: "Exchange / EWS", note: "On-prem / hosted", icon: <Server size={18} className="text-accent" /> },
  { label: "Yahoo via SMTP", note: "SMTP until native connector", icon: <Initial>Y</Initial> },
  { label: "Advanced SMTP", note: "Custom SMTP host", icon: <Plug size={18} className="text-accent" /> },
];

export default function EmailIntegrationsStrip() {
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
            Velocity connects through Nylas and SMTP so campaigns can send from the mailbox your team already uses — with warm-up controls, legal gates and reply tracking built in.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {providers.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card"
            >
              <div className="flex items-center justify-center h-8 w-8 shrink-0">{p.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.label}</p>
                <p className="text-[10px] text-muted-foreground">{p.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-2xl mx-auto text-center">
          Yahoo native connector is coming next; Yahoo can be connected through SMTP/app-password setup today.
        </p>
      </div>
    </section>
  );
}
