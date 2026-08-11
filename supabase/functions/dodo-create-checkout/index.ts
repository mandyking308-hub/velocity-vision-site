/**
 * Dodo Payments checkout session creation — fail closed until server secrets exist.
 *
 * Security model:
 *  - authenticated Supabase user required;
 *  - allow-listed internal product keys only (never product ids/prices/URLs);
 *  - product mapping resolved only server-side;
 *  - return/cancel URLs are allow-listed;
 *  - top-ups require a currently entitled paid workspace;
 *  - checkout return never fulfils a product — webhook only.
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
import { isEntitlementActive } from "../_shared/entitlements.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TOPUP_KEYS = new Set(["vv_topup_small", "vv_topup_medium", "vv_topup_large"]);

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
    if (!isAllowedProductKey(productKey)) return json({ error: "invalid_product_key" }, 400);

    const rawRefId = (body as Record<string, unknown>).refId;
    const hasRefId = rawRefId !== undefined && rawRefId !== null && rawRefId !== "";
    if (hasRefId && !isRefIdEligibleProduct(productKey)) return json({ error: "ref_not_allowed" }, 400);
    if (isRefIdEligibleProduct(productKey) && !isValidCampaignRefId(rawRefId)) return json({ error: "invalid_ref" }, 400);
    const refId = hasRefId ? (rawRefId as string).trim() : null;

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    if (!user) return json({ error: "unauthorized" }, 401);

    if (TOPUP_KEYS.has(productKey)) {
      const { data: plan } = await supabase
        .from("user_plans")
        .select("plan, status, period_end")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!isEntitlementActive(plan) || plan?.plan === "free_preview") {
        return json({ error: "topup_requires_active_paid_plan" }, 403);
      }
    }

    if (refId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("id", refId)
        .or(`owner_id.eq.${user.id},created_by.eq.${user.id}`)
        .maybeSingle();
      if (!campaign) return json({ error: "forbidden_ref" }, 403);
    }

    const cfg = loadDodoConfig((k) => Deno.env.get(k));
    if (!cfg.ok) return json({ error: "payments_not_configured", reason: cfg.reason }, 503);
    const dodoProductId = cfg.config.productMap[productKey];
    if (!dodoProductId) return json({ error: "payments_not_configured", reason: "product_not_mapped" }, 503);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("user_id", user.id)
      .maybeSingle();
    const email = (profile?.email as string | undefined) || user.email;
    if (!email) return json({ error: "missing_customer_email" }, 400);
    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() || email.split("@")[0];

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
    return json({ checkoutUrl, sessionId: session.session_id ?? null });
  } catch (e) {
    console.error("dodo-create-checkout error:", e);
    return json({ error: "checkout_failed" }, 500);
  }
});
