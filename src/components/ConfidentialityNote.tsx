import { ShieldCheck } from "lucide-react";

type Props = { className?: string; variant?: "card" | "inline" };

const ConfidentialityNote = ({ className = "", variant = "card" }: Props) => {
  const body =
    "We do not publish customer names, campaign data, account details or results without explicit written permission. Velocity Vision is built for confidential commercial work — your strategy, targeting, pipeline activity and customer data stay private by default.";

  if (variant === "inline") {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        <span className="font-medium text-foreground">Confidential by default. </span>
        {body}
      </p>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 md:p-7 flex items-start gap-4 ${className}`}
    >
      <div className="shrink-0 rounded-xl bg-accent/10 p-2.5">
        <ShieldCheck className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">
          Why we don't publish customer case studies
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
};

export default ConfidentialityNote;
