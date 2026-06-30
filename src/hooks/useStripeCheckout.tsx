import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckoutInline } from "@/components/payments/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { paymentsConfigured } from "@/lib/stripe";
import { toast } from "sonner";

interface Options {
  priceId: string;
  refId?: string;
  workspaceId?: string;
  returnPath?: string; // e.g. "/app/billing?checkout=success"
  title?: string;
}

export function useStripeCheckout() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Options | null>(null);

  const openCheckout = useCallback((o: Options) => {
    if (!paymentsConfigured()) {
      toast.error("Checkout isn't configured yet", { description: "Payments go-live needs to be completed." });
      return;
    }
    setOpts(o);
    setOpen(true);
  }, []);

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
              priceId={opts.priceId}
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
