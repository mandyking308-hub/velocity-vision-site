/**
 * Dodo Payments checkout session creation — INERT until server secrets exist.
 *
 * This function is intentionally separate from `create-checkout` (Stripe) and
 * does not modify or share any of its code. No frontend CTA is wired to it.
 *
 * Security model:
 *  - Requires an authenticated Supabase user (bearer token).
 *  - Accepts ONLY an allow-listed internal product key. Never a Dodo product
 *    id, never an amount, never a currency, never a URL.
 *  - Resolves the Dodo product id server-side from DODO_PRODUCT_MAP.
 *  - return_url / cancel_url are built from an allow-listed origin.
 *  - Returns `payments_not_configured` without any external call when the API
 *    key, environment or product mapping is absent.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  DODO_PRODUCT_CATALOG,
  dodoReturnUrls,
  isAllowedProductKey,
  isSafeDodoCheckoutLink,
  loadDodoConfig,
} from "../_shared/dodo.ts";


const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const productKey = (body as Record<string, unknown>).productKey;
    if (!isAllowedProductKey(productKey)) {
      return json({ error: "invalid_product_key" }, 400);
    }

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    if (!user) return json({ error: "unauthorized" }, 401);

    // Config gate — no external request when anything is missing.
    const cfg = loadDodoConfig((k) => Deno.env.get(k));
    if (!cfg.ok) {
      return json({ error: "payments_not_configured", reason: cfg.reason }, 503);
    }
    const dodoProductId = cfg.config.productMap[productKey];
    if (!dodoProductId) {
      return json({ error: "payments_not_configured", reason: "product_not_mapped" }, 503);
    }

    // Customer identity comes from the authenticated account only.
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("user_id", user.id)
      .maybeSingle();
    const email = (profile?.email as string | undefined) || user.email;
    if (!email) return json({ error: "missing_customer_email" }, 400);
    const name = [profile?.first_name, profile?.last_name]
      .filter(Boolean).join(" ").trim() || email.split("@")[0];

    const { return_url, cancel_url } = dodoReturnUrls(req.headers.get("origin"));
    const entry = DODO_PRODUCT_CATALOG[productKey];

    const response = await fetch(`${cfg.config.baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: dodoProductId, quantity: 1 }],
        customer: { email, name },
        return_url,
        cancel_url,
        // Safe internal identifiers only — no PII, no free text.
        metadata: {
          userId: user.id,
          productKey,
          productKind: entry.kind,
          provider: "dodo",
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`dodo-create-checkout provider error [${response.status}]: ${detail}`);
      return json({ error: "provider_error", status: response.status }, 502);
    }

    const session = await response.json();
    const checkoutUrl = session.checkout_url;
    // Never hand the browser anything other than an official Dodo HTTPS link.
    if (!isSafeDodoCheckoutLink(checkoutUrl)) {
      console.error("dodo-create-checkout rejected an unsafe checkout link");
      return json({ error: "unsafe_checkout_url" }, 502);
    }
    return json({
      checkoutUrl,
      sessionId: session.session_id ?? null,
      mode: cfg.config.mode,
    });

  } catch (e) {
    console.error("dodo-create-checkout error:", e);
    return json({ error: "checkout_failed" }, 500);
  }
});
