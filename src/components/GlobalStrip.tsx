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
    <section className="section-padding bg-splash-pink relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent-warm/5 blur-3xl translate-y-1/2 -translate-x-1/4" />
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-widest mb-4">
              <Globe2 size={14} /> Global by default
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Global by default: multilingual access, multi-currency pricing and international legal documents for teams working across markets.
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-card">
              <b.icon size={18} className="text-accent shrink-0" />
              <span className="text-sm text-foreground font-medium">{b.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mt-8 max-w-3xl leading-relaxed">
          Customers can view the public website and legal centre through the translation selector, supported by automated translation technology. Pricing supports multiple currencies, and the legal document stack is designed for international SaaS use. Automated translations are provided for convenience only — the English version of legal documents controls where translations differ. Customers remain responsible for local laws and lawful use in their markets.
        </p>
      </div>
    </section>
  );
};

export default GlobalStrip;
