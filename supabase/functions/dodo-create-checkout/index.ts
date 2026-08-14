/**
 * Dodo Payments checkout session creation.
 *
 * Security model:
 *  - Requires an authenticated Supabase user (bearer token).
 *  - Accepts ONLY an allow-listed internal product key. Never a Dodo product
 *    id, amount, currency or arbitrary URL from the browser.
 *  - Resolves the Dodo product id server-side.
 *  - Free Preview cannot create a credit-top-up checkout, even by calling this
 *    function directly instead of using the UI.
 *  - return_url / cancel_url are built from an allow-listed origin.
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
  type DodoProductKey,
} from "../_shared/dodo.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

/**
 * Two historical fallback IDs differed only by lowercase-l / uppercase-I.
 * Production normally uses DODO_PRODUCT_MAP, but fail safe if an old compiled
 * fallback or stale override contains exactly one of those known bad values.
 * Any genuinely different future override is left untouched.
 */
export function canonicalDodoProductId(productKey: DodoProductKey, mappedId: string): string {
  if (productKey === "vv_growth_monthly" && mappedId === "pdt_0Nl9s5l0TK2OPTMHCqwSs") {
    return "pdt_0Nl9s5I0TK2OPTMHCqwSs";
  }
  if (productKey === "vv_agency_monthly" && mappedId === "pdt_0Nl9sTQjA4USAN3YTR6lU") {
    return "pdt_0Nl9sTQjA4USAN3YTR6IU";
  }
  return mappedId;
}

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
    const entry = DODO_PRODUCT_CATALOG[productKey];

    // No active launch product accepts a campaign reference. Keep the legacy
    // shape guards fail-closed for compatibility with older clients/tests.
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

    // Free Preview cannot buy top-ups. Enforce this server-side before any
    // provider request so a direct API call cannot bypass the customer UI.
    if (entry.kind.startsWith("topup_")) {
      const { data: effectivePlan, error: planErr } = await supabase.rpc("effective_plan_for_actions", { _user_id: user.id });
      if (planErr) {
        console.error("dodo-create-checkout topup entitlement check failed", { message: planErr.message });
        return json({ error: "entitlement_check_failed" }, 500);
      }
      if (!(["starter", "growth", "agency"] as string[]).includes(String(effectivePlan ?? ""))) {
        return json({ error: "paid_plan_required", message: "Credit top-ups are available only on eligible paid plans." }, 403);
      }
    }

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
    const mappedProductId = cfg.config.productMap[productKey];
    if (!mappedProductId) {
      return json({ error: "payments_not_configured", reason: "product_not_mapped" }, 503);
    }
    const dodoProductId = canonicalDodoProductId(productKey, mappedProductId);

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

    const { return_url, cancel_url } = dodoReturnUrls(req.headers.get("origin"), productKey);

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
    if (!isSafeDodoCheckoutLink(checkoutUrl)) {
      console.error("dodo-create-checkout rejected an unsafe checkout link");
      return json({ error: "unsafe_checkout_url" }, 502);
    }
    return json({
      checkoutUrl,
      sessionId: session.session_id ?? null,
    });
  } catch (e) {
    console.error("dodo-create-checkout error:", e);
    return json({ error: "checkout_failed" }, 500);
  }
});
