import { Globe2, Languages, CreditCard, Scale, ShieldCheck, Users } from "lucide-react";

const badges = [
  { icon: Languages, label: "100+ language options" },
  { icon: CreditCard, label: "Multi-currency pricing" },
  { icon: Scale, label: "International legal stack" },
  { icon: Globe2, label: "Global workspace access" },
  { icon: ShieldCheck, label: "English legal version controls" },
  { icon: Users, label: "Built for founders, teams and agencies" },
];

interface Props {
  variant?: "home" | "compact";
}

const GlobalStrip = ({ variant = "home" }: Props) => {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><CreditCard size={14} className="text-accent" /> Multi-currency pricing</span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5"><Languages size={14} className="text-accent" /> Multilingual access</span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5"><Scale size={14} className="text-accent" /> Global legal stack</span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent" /> Customer-controlled activation</span>
      </div>
    );
  }

  return (
    <section className="bg-background border-t border-border/50 px-6 md:px-12 lg:px-20 py-14 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-3">
              <Globe2 size={14} /> Global from day one
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground max-w-2xl">
              Built for global teams
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm md:text-base leading-relaxed">
              Velocity Vision supports international teams with multilingual site access, multi-currency pricing, global legal documents, Data Vault workflows and governed activation across markets.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 shadow-card">
              <b.icon size={18} className="text-accent shrink-0" />
              <span className="text-sm text-foreground font-medium">{b.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 max-w-3xl leading-relaxed">
          Customers can view the public website and legal centre through the translation selector, supported by automated translation technology. Pricing supports multiple currencies, and the legal document stack is designed for international SaaS use. Automated translations are provided for convenience only — the English version of legal documents controls where translations differ. Customers remain responsible for local laws and lawful use in their markets.
        </p>
      </div>
    </section>
  );
};

export default GlobalStrip;
