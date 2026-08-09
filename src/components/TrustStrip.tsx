import { Server, Database, KeyRound, FileCheck, Scale, ShieldCheck, type LucideIcon } from "lucide-react";

type Variant = "pricing" | "legal";

const pricingItems: { icon: LucideIcon; label: string }[] = [
  { icon: Server, label: "Secure Cloud Infrastructure" },
  { icon: Database, label: "Workspace Separation" },
  { icon: KeyRound, label: "Encrypted Secret Handling" },
  { icon: FileCheck, label: "DPA Available" },
  { icon: Scale, label: "GDPR / CCPA Privacy Framework" },
];

const legalItems: { icon: LucideIcon; label: string }[] = [
  { icon: Scale, label: "Legal Centre live" },
  { icon: FileCheck, label: "DPA available" },
  { icon: ShieldCheck, label: "Security Policy available" },
  { icon: Database, label: "Subprocessor List available" },
  { icon: KeyRound, label: "Contact routes available" },
];

const TrustStrip = ({ variant = "pricing" }: { variant?: Variant }) => {
  const items = variant === "legal" ? legalItems : pricingItems;
  return (
    <div className="rounded-2xl border border-border/60 bg-card px-5 py-4 md:px-6 md:py-5 shadow-card">
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {items.map((it) => (
          <li key={it.label} className="inline-flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <it.icon size={16} className="text-accent shrink-0" />
            <span className="font-medium text-foreground/90">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrustStrip;
