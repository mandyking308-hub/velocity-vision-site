import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  compact?: boolean;
}

/**
 * Plain-English billing disclosure shown above any paid checkout,
 * subscription confirm, or credit top-up CTA. Firm wording — does not
 * promise refunds, service credits or reversal of past charges.
 */
export default function BillingTermsSummary({ className, compact = false }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/40 p-4 md:p-5 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={16} className="text-accent shrink-0" />
        <h4 className="font-semibold text-foreground text-sm">Billing terms before you continue</h4>
      </div>
      <p className={cn("leading-relaxed", compact ? "text-xs" : "text-sm")}>
        Subscriptions renew automatically unless cancelled before the next billing period.
        Taxes are calculated at checkout based on billing details. Credits, top-ups and
        one-off purchases may be non-refundable except where required by law or expressly
        stated in the Customer Agreement. Cancellation stops future renewal but does not
        reverse charges already incurred. Payment processing is handled by our payment
        provider and the Customer Agreement applies.
      </p>
      <p className={cn("mt-3 flex flex-wrap gap-x-4 gap-y-1", compact ? "text-xs" : "text-xs")}>
        <Link to="/legal/client-services-agreement" className="text-accent hover:underline font-medium">
          Customer Agreement
        </Link>
        <Link to="/legal/terms-of-service" className="text-accent hover:underline font-medium">
          Terms of Service
        </Link>
        <Link to="/legal/privacy-policy" className="text-accent hover:underline font-medium">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
