// Founder-only bootstrap: applies Stripe tax codes to existing products
// and creates currency-variant prices (USD/EUR/CAD/AUD/MXN) for each SKU.
// Idempotent — safe to call multiple times.
//
// POST (with Authorization: Bearer <founder JWT>)
//
// Response: { products: [...], prices: [{lookup_key, status}], errors: [...] }

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type Currency = "USD" | "EUR" | "CAD" | "AUD" | "MXN";

interface SkuDef {
  base: string;            // GBP lookup_key (already exists in Stripe)
  taxCode: string;         // Stripe txcd_…
  type: "recurring" | "one_time";
  interval?: "month";
  prices: Record<Currency, number>;  // major units
}

const CATALOGUE: SkuDef[] = [
  {
    base: "vv_starter_oneoff", taxCode: "txcd_10103001", type: "one_time",
    prices: { USD: 189, EUR: 175, CAD: 259, AUD: 289, MXN: 3490 },
  },
  {
    base: "vv_growth_monthly", taxCode: "txcd_10103001", type: "recurring", interval: "month",
    prices: { USD: 315, EUR: 289, CAD: 429, AUD: 479, MXN: 5790 },
  },
  {
    base: "vv_agency_monthly", taxCode: "txcd_10103001", type: "recurring", interval: "month",
    prices: { USD: 629, EUR: 579, CAD: 859, AUD: 959, MXN: 11590 },
  },
  {
    base: "vv_human_review_oneoff", taxCode: "txcd_20030000", type: "one_time",
    prices: { USD: 249, EUR: 229, CAD: 339, AUD: 379, MXN: 4590 },
  },
  {
    base: "vv_topup_small", taxCode: "txcd_10103001", type: "one_time",
    prices: { USD: 59, EUR: 55, CAD: 79, AUD: 89, MXN: 1090 },
  },
  {
    base: "vv_topup_medium", taxCode: "txcd_10103001", type: "one_time",
    prices: { USD: 149, EUR: 139, CAD: 199, AUD: 219, MXN: 2690 },
  },
  {
    base: "vv_topup_large", taxCode: "txcd_10103001", type: "one_time",
    prices: { USD: 349, EUR: 329, CAD: 469, AUD: 529, MXN: 6290 },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    // Founder/admin gate
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "unauthorized" }, 401);
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isPrivileged = (roles || []).some((r: any) => ["founder", "admin"].includes(r.role));
    if (!isPrivileged) return json({ error: "forbidden" }, 403);

    const env = (new URL(req.url).searchParams.get("env") === "live" ? "live" : "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    const productsTouched: any[] = [];
    const pricesCreated: any[] = [];
    const errors: any[] = [];

    for (const sku of CATALOGUE) {
      try {
        // 1. Locate base price → product
        const baseList = await stripe.prices.list({ lookup_keys: [sku.base], limit: 1 });
        if (!baseList.data.length) {
          errors.push({ sku: sku.base, error: "base GBP price not found" });
          continue;
        }
        const productId = typeof baseList.data[0].product === "string"
          ? baseList.data[0].product
          : baseList.data[0].product.id;

        // 2. Apply tax code (idempotent)
        const product = await stripe.products.retrieve(productId);
        if (product.tax_code !== sku.taxCode) {
          await stripe.products.update(productId, { tax_code: sku.taxCode });
          productsTouched.push({ id: productId, lookup: sku.base, tax_code: sku.taxCode });
        } else {
          productsTouched.push({ id: productId, lookup: sku.base, tax_code: "already-set" });
        }

        // 3. Create currency variants if missing
        for (const [ccy, amount] of Object.entries(sku.prices) as [Currency, number][]) {
          const lookup = `${sku.base}_${ccy.toLowerCase()}`;
          const existing = await stripe.prices.list({ lookup_keys: [lookup], limit: 1 });
          if (existing.data.length) {
            pricesCreated.push({ lookup, status: "already-exists" });
            continue;
          }
          const created = await stripe.prices.create({
            product: productId,
            currency: ccy.toLowerCase(),
            unit_amount: amount * 100,
            nickname: product.name,
            lookup_key: lookup,
            transfer_lookup_key: true,
            tax_behavior: "exclusive",
            ...(sku.type === "recurring" && { recurring: { interval: sku.interval || "month" } }),
          });
          pricesCreated.push({ lookup, status: "created", id: created.id });
        }
      } catch (skuErr) {
        console.error(`SKU ${sku.base} failed:`, skuErr);
        errors.push({ sku: sku.base, error: (skuErr as Error).message });
      }
    }

    return json({
      ok: true,
      environment: env,
      products: productsTouched,
      prices: pricesCreated,
      errors,
    });
  } catch (e) {
    console.error("setup-international-payments error:", e);
    return json({ error: "Setup failed. See server logs." }, 500);
  }
});

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
