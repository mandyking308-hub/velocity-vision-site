import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isSafeDodoCheckoutLink } from "@/lib/dodoLinks";
import { CHECKOUT_ACTIVATING_COPY, type DodoProductKey } from "@/lib/dodoReadiness";

/**
 * Starts a Dodo hosted checkout for an allow-listed internal product key.
 * The client never sends a price, currency, product id or URL, and only ever
 * follows a validated Dodo-hosted HTTPS link. There is NO Stripe fallback.
 */
export function useDodoCheckout() {
  const [starting, setStarting] = useState(false);

  /**
   * `refId` is the only extra context allowed, and the server accepts it for
   * Human Review only. Never a price, currency, provider product id or URL.
   */
  const startCheckout = useCallback(async (productKey: DodoProductKey, refId?: string) => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("dodo-create-checkout", {
        body: refId ? { productKey, refId } : { productKey },
      });
      const url = (data as any)?.checkoutUrl;
      if (error || !isSafeDodoCheckoutLink(url)) {
        toast.info(CHECKOUT_ACTIVATING_COPY, {
          description: "No payment was taken. We'll get you set up manually.",
        });
        return false;
      }
      window.location.href = url;
      return true;
    } catch {
      toast.info(CHECKOUT_ACTIVATING_COPY, { description: "No payment was taken." });
      return false;
    } finally {
      setStarting(false);
    }
  }, []);

  return { startCheckout, starting };
}
