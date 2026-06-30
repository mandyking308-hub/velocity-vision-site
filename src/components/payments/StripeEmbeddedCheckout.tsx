import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  priceId: string;
  refId?: string;
  workspaceId?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckoutInline({ priceId, refId, workspaceId, returnUrl }: Props) {
  const fetchClientSecret = async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, refId, workspaceId, returnUrl, environment: getStripeEnvironment() },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  };

  return (
    <div id="checkout" className="min-h-[600px]">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
