import { useCurrency } from "@/hooks/useCurrency";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface Props {
  /** Alignment on desktop. Mobile is always full-width. */
  align?: "left" | "right" | "center";
  /** Optional label. Default "Prices shown in". Set to null to hide. */
  label?: string | null;
  className?: string;
}

/**
 * Segmented-pill currency selector for pricing surfaces.
 * - Right-aligned on desktop, full-width on mobile.
 * - Controls displayed prices and downstream Stripe checkout currency.
 * - Independent of GTranslate (language does not affect this).
 */
export function PricingCurrencySelector({ align = "right", label = "Prices shown in", className }: Props) {
  const { currency, setCurrency } = useCurrency();
  const alignClass =
    align === "right" ? "md:justify-end" : align === "center" ? "md:justify-center" : "md:justify-start";

  return (
    <div
      className={cn(
        "notranslate flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full",
        alignClass,
        className,
      )}
      translate="no"
      role="group"
      aria-label="Currency selector"
    >
      {label && (
        <span className="text-xs md:text-sm text-muted-foreground font-medium">{label}</span>
      )}
      <div
        className="inline-flex w-full md:w-auto rounded-full border border-border bg-card shadow-sm overflow-hidden"
        role="radiogroup"
      >
        {SUPPORTED_CURRENCIES.map((c) => {
          const active = c === currency;
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCurrency(c as Currency)}
              className={cn(
                "flex-1 md:flex-none px-3 md:px-3.5 py-1.5 text-xs md:text-sm font-medium transition-colors",
                "border-r border-border last:border-r-0",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-foreground/70 hover:bg-muted",
              )}
            >
              {CURRENCY_LABELS[c]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PricingCurrencySelector;
