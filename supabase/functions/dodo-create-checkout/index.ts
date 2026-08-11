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
  isRefIdEligibleProduct,
  isSafeDodoCheckoutLink,
  isValidCampaignRefId,
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

    // refId is accepted ONLY for Human Review, and only as a canonical UUID.
    // Any refId on another product is rejected to keep the contract tight.
    const rawRefId = (body as Record<string, unknown>).refId;
    const hasRefId = rawRefId !== undefined && rawRefId !== null && rawRefId !== "";
    if (hasRefId && !isRefIdEligibleProduct(productKey)) {
      return json({ error: "ref_not_allowed" }, 400);
    }
    if (isRefIdEligibleProduct(productKey) && !isValidCampaignRefId(rawRefId)) {
      return json({ error: "invalid_ref" }, 400);
    }
    const refId = hasRefId ? (rawRefId as string).trim() : null;

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    if (!user) return json({ error: "unauthorized" }, 401);

    // Ownership is derived from the validated bearer token only — never from
    // anything the client sent. No Dodo call happens before this passes.
    if (refId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("id", refId)
        .or(`owner_id.eq.${user.id},created_by.eq.${user.id}`)
        .maybeSingle();
      if (!campaign) return json({ error: "forbidden_ref" }, 403);
    }

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

    // The return URL carries only the safe internal purchase-result flag for
    // this allow-listed productKey — never price, PII, product id or secret.
    const { return_url, cancel_url } = dodoReturnUrls(req.headers.get("origin"), productKey);
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
          ...(refId ? { refId } : {}),
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
    // Never expose environment/mode details to the browser — only the
    // validated hosted link and the session id the customer just created.
    return json({
      checkoutUrl,
      sessionId: session.session_id ?? null,
    });

  } catch (e) {
    console.error("dodo-create-checkout error:", e);
    return json({ error: "checkout_failed" }, 500);
  }
});
