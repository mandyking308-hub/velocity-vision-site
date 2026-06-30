import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckoutInline } from "@/components/payments/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { priceIdFor, type Currency } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface Options {
  priceId: string;          // base price id (USD default); GBP/EUR resolved automatically
  refId?: string;
  workspaceId?: string;
  returnPath?: string;
  title?: string;
  currency?: Currency;      // override the user's currency selection
}

export function useStripeCheckout() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<(Options & { resolvedPriceId: string }) | null>(null);
  const { currency } = useCurrency();

  const openCheckout = useCallback(
    (o: Options) => {
      if (!paymentsConfigured()) {
        toast.error("Checkout isn't configured yet", { description: "Payments go-live needs to be completed." });
        return;
      }
      const useCurrency = o.currency || currency;
      const resolvedPriceId = priceIdFor(o.priceId, useCurrency);
      setOpts({ ...o, resolvedPriceId });
      setOpen(true);
    },
    [currency],
  );

  const returnUrl = opts
    ? `${window.location.origin}${opts.returnPath || "/app/billing?checkout=success"}&session_id={CHECKOUT_SESSION_ID}`.replace("?&", "?")
    : "";

  const element = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{opts?.title || "Checkout"}</DialogTitle>
        </DialogHeader>
        <PaymentTestModeBanner />
        <div className="p-4">
          {opts && (
            <StripeEmbeddedCheckoutInline
              priceId={opts.resolvedPriceId}
              refId={opts.refId}
              workspaceId={opts.workspaceId}
              returnUrl={returnUrl}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return { openCheckout, element, isOpen: open };
}
