import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isSafeDodoCheckoutLink } from "@/lib/dodoLinks";
import { type DodoProductKey } from "@/lib/dodoReadiness";

/** Honest failure copy: checkout failed, no manual-onboarding implication. */
const CHECKOUT_UNAVAILABLE_COPY = "Checkout is temporarily unavailable.";
const CHECKOUT_UNAVAILABLE_DETAIL = "No payment was taken. Please try again in a moment or contact support.";

/**
 * Starts a Dodo hosted checkout for an allow-listed internal product key.
 * The client never sends a price, currency, product id or URL, and only ever
 * follows a validated Dodo-hosted HTTPS link. There is NO Stripe fallback.
 */
export function useDodoCheckout() {
  const [starting, setStarting] = useState(false);

  /**
   * No active launch product accepts a `refId`; the server rejects any
   * supplied value. Never send a price, currency, provider product id or URL.
   */
  const startCheckout = useCallback(async (productKey: DodoProductKey, refId?: string) => {
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("dodo-create-checkout", {
        body: refId ? { productKey, refId } : { productKey },
      });
      const url = (data as any)?.checkoutUrl;
      if (error || !isSafeDodoCheckoutLink(url)) {
        toast.info(CHECKOUT_UNAVAILABLE_COPY, { description: CHECKOUT_UNAVAILABLE_DETAIL });
        return false;
      }
      window.location.href = url;
      return true;
    } catch {
      toast.info(CHECKOUT_UNAVAILABLE_COPY, { description: CHECKOUT_UNAVAILABLE_DETAIL });
      return false;
    } finally {
      setStarting(false);
    }
  }, []);

  return { startCheckout, starting };
}
