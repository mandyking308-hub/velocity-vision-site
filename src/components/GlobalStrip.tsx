import { Globe2, Languages, CreditCard, Scale, ShieldCheck, Users } from "lucide-react";

const badges = [
  { icon: Languages, label: "Automated translation where available" },
  { icon: CreditCard, label: "Supported display currencies" },
  { icon: Scale, label: "Published legal document stack" },
  { icon: Globe2, label: "Web-based workspace access" },
  { icon: ShieldCheck, label: "English legal version controls" },
  { icon: Users, label: "Business and agency workspace options" },
];

interface Props {
  variant?: "home" | "compact";
}

const GlobalStrip = ({ variant = "home" }: Props) => {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CreditCard size={14} className="text-accent" /> Supported display currencies
        </span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Languages size={14} className="text-accent" /> Automated translation where available
        </span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Scale size={14} className="text-accent" /> Published legal documents
        </span>
        <span className="hidden md:inline text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-accent" /> Customer-controlled activation
        </span>
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
              <Globe2 size={14} /> International access
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
              Web-based access, automated translation and supported display currencies for business customers working across markets
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-card"
            >
              <badge.icon size={18} className="text-accent shrink-0" />
              <span className="text-sm text-foreground font-medium">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mt-8 max-w-3xl leading-relaxed">
          The public website and Legal Centre may be viewed through automated translation where available. Translations are provided for convenience only and the English legal documents control. Display currencies do not replace checkout disclosure: the final currency, tax treatment, payment provider and applicable terms are confirmed before purchase. Customers remain responsible for laws applying to their organisation, data, recipients and activity in each relevant market.
        </p>
      </div>
    </section>
  );
};

export default GlobalStrip;
