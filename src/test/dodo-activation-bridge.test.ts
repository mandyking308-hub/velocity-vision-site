import { describe, expect, it } from "vitest";
import {
  computeDodoReadiness,
  isSafeDodoCheckoutLink as isSafeCheckoutLinkEdge,
} from "../../supabase/functions/_shared/dodo";
import { isSafeDodoCheckoutLink } from "@/lib/dodoLinks";
import {
  DODO_READINESS_OFFLINE,
  isProductLiveReady,
  parseDodoReadiness,
  PLAN_SLUG_TO_PRODUCT,
} from "@/lib/dodoReadiness";
import { authNextForPlan, parseBuyParam, safeNextPath } from "@/lib/safeNext";

const env = (o: Record<string, string>) => (k: string) => o[k];

const FULL_MAP = JSON.stringify({
  vv_starter_oneoff: "pdt_1",
  vv_growth_monthly: "pdt_2",
  vv_agency_monthly: "pdt_3",
  vv_topup_small: "pdt_4",
  vv_topup_medium: "pdt_5",
  vv_topup_large: "pdt_6",
});

describe("computeDodoReadiness", () => {
  it("is not ready with no config at all", () => {
    const r = computeDodoReadiness(env({}));
    expect(r.live).toBe(false);
    expect(r.ready).toBe(false);
    expect(Object.values(r.products).every((v) => v === false)).toBe(true);
  });

  it("is not ready in test_mode even with a full product map", () => {
    const r = computeDodoReadiness(env({ DODO_API_KEY: "k", DODO_ENVIRONMENT: "test_mode", DODO_PRODUCT_MAP: FULL_MAP }));
    expect(r.live).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.products.vv_growth_monthly).toBe(false);
  });

  it("is not ready when the environment is missing or unknown", () => {
    for (const e of [undefined, "", "prod", "LIVE_MODE"]) {
      const vars: Record<string, string> = { DODO_API_KEY: "k", DODO_PRODUCT_MAP: FULL_MAP };
      if (e !== undefined) vars.DODO_ENVIRONMENT = e;
      expect(computeDodoReadiness(env(vars)).live).toBe(false);
    }
  });

  it("is not ready in live_mode with no product map", () => {
    const r = computeDodoReadiness(env({ DODO_API_KEY: "k", DODO_ENVIRONMENT: "live_mode" }));
    expect(r.ready).toBe(false);
  });

  it("is not ready without an api key", () => {
    expect(computeDodoReadiness(env({ DODO_ENVIRONMENT: "live_mode", DODO_PRODUCT_MAP: FULL_MAP })).ready).toBe(false);
  });

  it("fails closed on a partial live map: ready stays false until ALL six launch products are mapped", () => {
    const r = computeDodoReadiness(env({
      DODO_API_KEY: "k",
      DODO_ENVIRONMENT: "live_mode",
      DODO_PRODUCT_MAP: JSON.stringify({ vv_growth_monthly: "pdt_2", vv_topup_small: " " }),
    }));
    // live connection detected, per-product booleans exposed safely...
    expect(r.live).toBe(true);
    expect(r.products.vv_growth_monthly).toBe(true);
    expect(r.products.vv_starter_oneoff).toBe(false);
    expect(r.products.vv_topup_small).toBe(false);
    // ...but the generic launch-ready flag must NOT flip on a partial map.
    expect(r.ready).toBe(false);
    // Five of six is still not launch-ready.
    const five = JSON.parse(FULL_MAP);
    delete five.vv_topup_large;
    const r5 = computeDodoReadiness(env({
      DODO_API_KEY: "k", DODO_ENVIRONMENT: "live_mode", DODO_PRODUCT_MAP: JSON.stringify(five),
    }));
    expect(r5.ready).toBe(false);
    expect(Object.values(r5.products).filter(Boolean)).toHaveLength(5);
  });

  it("is fully ready with a live full map", () => {
    const r = computeDodoReadiness(env({ DODO_API_KEY: "k", DODO_ENVIRONMENT: "live_mode", DODO_PRODUCT_MAP: FULL_MAP }));
    expect(r.live && r.ready).toBe(true);
    expect(Object.values(r.products).every(Boolean)).toBe(true);
  });

  it("never leaks anything beyond safe booleans", () => {
    const r = computeDodoReadiness(env({ DODO_API_KEY: "sk_live_secret", DODO_ENVIRONMENT: "live_mode", DODO_PRODUCT_MAP: FULL_MAP }));
    const serialised = JSON.stringify(r);
    expect(serialised).not.toContain("sk_live_secret");
    expect(serialised).not.toContain("pdt_1");
    expect(Object.keys(r).sort()).toEqual(["live", "products", "provider", "ready"]);
  });
});

describe("isSafeDodoCheckoutLink", () => {
  const good = [
    "https://checkout.dodopayments.com/buy/abc",
    "https://live.dodopayments.com/checkouts/xyz",
    "https://test.dodopayments.com/checkouts/xyz",
    "https://dodopayments.com/c/1",
  ];
  const bad = [
    "",
    "   ",
    null,
    undefined,
    42,
    "not a url",
    "http://checkout.dodopayments.com/buy/abc",
    "javascript:alert(1)",
    "//checkout.dodopayments.com/buy",
    "https://evil.com/checkout.dodopayments.com",
    "https://dodopayments.com.evil.com/buy",
    "https://user:pass@checkout.dodopayments.com/buy",
    "data:text/html,hi",
  ];

  it("accepts official Dodo HTTPS links", () => {
    for (const link of good) {
      expect(isSafeDodoCheckoutLink(link)).toBe(true);
      expect(isSafeCheckoutLinkEdge(link)).toBe(true);
    }
  });

  it("rejects malformed, non-HTTPS and non-Dodo links", () => {
    for (const link of bad) {
      expect(isSafeDodoCheckoutLink(link)).toBe(false);
      expect(isSafeCheckoutLinkEdge(link)).toBe(false);
    }
  });
});

describe("parseDodoReadiness / isProductLiveReady", () => {
  it("collapses junk payloads to offline", () => {
    for (const junk of [null, undefined, 1, "x", {}, { provider: "stripe" }]) {
      expect(parseDodoReadiness(junk)).toEqual(DODO_READINESS_OFFLINE);
    }
  });

  it("only treats explicit true as ready", () => {
    const parsed = parseDodoReadiness({
      provider: "dodo",
      live: "true",
      ready: 1,
      products: { vv_growth_monthly: "yes" },
    });
    expect(parsed.live).toBe(false);
    expect(parsed.products.vv_growth_monthly).toBe(false);
  });

  it("requires live + ready + mapped product", () => {
    const base = parseDodoReadiness({
      provider: "dodo",
      live: true,
      ready: true,
      products: { vv_growth_monthly: true },
    });
    expect(isProductLiveReady(base, "vv_growth_monthly")).toBe(true);
    expect(isProductLiveReady(base, "vv_starter_oneoff")).toBe(false);
    expect(isProductLiveReady(null, "vv_growth_monthly")).toBe(false);
    expect(isProductLiveReady({ ...base, live: false }, "vv_growth_monthly")).toBe(false);
    expect(isProductLiveReady({ ...base, ready: false }, "vv_growth_monthly")).toBe(false);
  });

  it("maps plan slugs to internal product keys only", () => {
    expect(PLAN_SLUG_TO_PRODUCT.starter).toBe("vv_starter_oneoff");
    expect(PLAN_SLUG_TO_PRODUCT.growth).toBe("vv_growth_monthly");
    expect(PLAN_SLUG_TO_PRODUCT.agency).toBe("vv_agency_monthly");
    expect(PLAN_SLUG_TO_PRODUCT.evil).toBeUndefined();
  });
});

describe("safeNextPath", () => {
  it("accepts the allow-listed billing return path", () => {
    expect(safeNextPath("/app/billing")).toBe("/app/billing");
    expect(safeNextPath("/app/billing?buy=starter")).toBe("/app/billing?buy=starter");
    expect(safeNextPath("%2Fapp%2Fbilling%3Fbuy%3Dgrowth")).toBe("/app/billing?buy=growth");
  });

  it("rejects malicious or unlisted values", () => {
    const bad = [
      null,
      undefined,
      "",
      "   ",
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "data:text/html,x",
      "%2F%2Fevil.com",
      "/app/billing?buy=<script>",
      "/app/billing?buy=admin",
      "/crm",
      "/app/settings",
      "app/billing",
      "\\/\\/evil.com",
    ];
    for (const v of bad) expect(safeNextPath(v as any)).toBeNull();
  });

  it("builds only allow-listed auth links", () => {
    expect(authNextForPlan("growth")).toBe(`/auth?next=${encodeURIComponent("/app/billing?buy=growth")}`);
    expect(authNextForPlan("evil")).toBe(`/auth?next=${encodeURIComponent("/app/billing")}`);
    expect(safeNextPath(decodeURIComponent(authNextForPlan("agency").split("next=")[1]))).toBe("/app/billing?buy=agency");
  });
});

describe("parseBuyParam", () => {
  it("accepts the three plans only", () => {
    expect(parseBuyParam("starter")).toBe("starter");
    expect(parseBuyParam("GROWTH")).toBe("growth");
    expect(parseBuyParam("agency")).toBe("agency");
  });
  it("ignores anything else", () => {
    for (const v of [null, undefined, "", "free_preview", "admin", "1", "starter;drop"]) {
      expect(parseBuyParam(v as any)).toBeNull();
    }
  });
});

// ── Source invariants: provider selection must never fall back to Stripe ──
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("new-purchase provider wiring", () => {
  const billing = read("src/pages/app/AppBilling.tsx");
  const topup = read("src/components/app/TopUpModal.tsx");

  it("AppBilling never opens Stripe checkout for a new purchase", () => {
    expect(billing).not.toContain("useStripeCheckout");
    expect(billing).not.toContain("openCheckout(");
    expect(billing).toContain("isProductLiveReady");
    expect(billing).toContain("startCheckout");
  });

  it("AppBilling keeps Stripe subscription management intact", () => {
    expect(billing).toContain("resolveBillingPortalFunction");
    expect(billing).toContain("stripe_subscriptions");
  });

  it("AppBilling gates every purchase behind the legal gate", () => {
    expect(billing).toContain("LegalComplianceGate");
    expect(billing).toContain("parseBuyParam");
    // the buy param may only preselect the gate
    expect(billing).toMatch(/setPendingPlan\((?:plan|requested) as PlanId\)/);
  });

  it("top-ups use Dodo or the safe onboarding state", () => {
    expect(topup).not.toContain("useStripeCheckout");
    expect(topup).toContain("isProductLiveReady");
    expect(topup).toContain("CHECKOUT_ACTIVATING_COPY");
    expect(topup).toContain("LegalComplianceGate");
  });
});

describe("public pricing CTA switching", () => {
  const pricing = read("src/pages/Pricing.tsx");

  it("keeps the onboarding CTA as the default branch", () => {
    expect(pricing).toContain("Request Starter onboarding");
    expect(pricing).toContain("Request Growth onboarding");
    expect(pricing).toContain("Request Agency onboarding");
    expect(pricing).toContain("/contact?plan=${planSlug(plan.sku)}");
  });

  it("only switches to purchase CTAs when the product is live-ready", () => {
    expect(pricing).toContain("isProductLiveReady(readiness, plan.sku as DodoProductKey)");
    expect(pricing).toContain("Buy Starter");
    expect(pricing).toContain("Start Growth");
    expect(pricing).toContain("Start Agency Workspace");
    expect(pricing).toContain("authNextForPlan");
  });

  it("leaves Free Preview free and card-free", () => {
    expect(pricing).toContain("Start Free Preview");
    expect(pricing).toContain("No card required.");
  });
});

describe("checkout return truth", () => {
  it("fulfilment is never granted from query params", () => {
    const billing = read("src/pages/app/AppBilling.tsx");
    expect(billing).not.toMatch(/credit_ledger[^\n]*insert/i);
    expect(billing).toContain("classifyCheckoutReturn");
  });
});

// ── Checkout reference (refId) contract ──────────────────────────────────
// Human Review is cancelled: no active launch product may carry a refId.
import { isRefIdEligibleProduct, isValidCampaignRefId } from "../../supabase/functions/_shared/dodo";

describe("checkout refId contract", () => {
  it("no active launch product may carry a refId", () => {
    for (const k of [
      "vv_starter_oneoff", "vv_growth_monthly", "vv_agency_monthly",
      "vv_topup_small", "vv_topup_medium", "vv_topup_large",
      "vv_human_review_oneoff", "", null, undefined, 1,
    ]) {
      expect(isRefIdEligibleProduct(k)).toBe(false);
    }
  });

  it("accepts only canonical campaign UUIDs", () => {
    expect(isValidCampaignRefId("3f2504e0-4f89-41d3-9a0c-0305e82c3301")).toBe(true);
    expect(isValidCampaignRefId(" 3f2504e0-4f89-41d3-9a0c-0305e82c3301 ")).toBe(true);
    for (const v of [
      null, undefined, "", "   ", 42, {}, "not-a-uuid",
      "3f2504e0-4f89-41d3-9a0c-0305e82c330", // too short
      "3f2504e0-4f89-41d3-9a0c-0305e82c3301x",
      "'; drop table campaigns;--",
      "3f2504e0_4f89_41d3_9a0c_0305e82c3301",
    ]) {
      expect(isValidCampaignRefId(v as any)).toBe(false);
    }
  });

  const fn = read("supabase/functions/dodo-create-checkout/index.ts");

  it("rejects a smuggled refId and unowned campaigns before any Dodo call", () => {
    expect(fn).toContain('return json({ error: "ref_not_allowed" }, 400)');
    expect(fn).toContain('return json({ error: "invalid_ref" }, 400)');
    expect(fn).toContain('return json({ error: "forbidden_ref" }, 403)');
    // ownership check must sit above the outbound provider request
    expect(fn.indexOf("forbidden_ref")).toBeLessThan(fn.indexOf("/checkouts"));
    // ownership is derived from the validated token user, never client input
    expect(fn).toContain("owner_id.eq.${user.id},created_by.eq.${user.id}");
  });

  it("puts refId in the safe metadata only", () => {
    expect(fn).toContain("...(refId ? { refId } : {})");
  });

  it("plans and top-ups pass no refId", () => {
    expect(read("src/components/app/TopUpModal.tsx")).toContain("startCheckout(productKey)");
    expect(read("src/pages/app/AppBilling.tsx")).toContain("startCheckout(productKey)");
  });
});

// ── Launch manifest: six live USD products (docs/dodo-launch-manifest.md) ──
import { DODO_PRODUCT_CATALOG } from "../../supabase/functions/_shared/dodo";
import { PRICE_CATALOGUE } from "@/lib/currency";

describe("Dodo launch manifest (USD canonical catalogue)", () => {
  it("covers exactly the six launch products", () => {
    expect(Object.keys(DODO_PRODUCT_CATALOG).sort()).toEqual([
      "vv_agency_monthly", "vv_growth_monthly",
      "vv_starter_oneoff", "vv_topup_large", "vv_topup_medium", "vv_topup_small",
    ]);
  });

  it("matches the public USD catalogue — Dodo map stays ID-only, never price-bearing", () => {
    const expectedUsd: Record<string, number> = {
      vv_starter_oneoff: 189,
      vv_growth_monthly: 315,
      vv_agency_monthly: 629,
      vv_topup_small: 59,
      vv_topup_medium: 149,
      vv_topup_large: 349,
    };
    for (const [sku, usd] of Object.entries(expectedUsd)) {
      expect(PRICE_CATALOGUE[sku as keyof typeof PRICE_CATALOGUE].USD).toBe(usd);
    }
    // No GBP/price leakage inside the Dodo fulfilment catalogue itself.
    expect(JSON.stringify(DODO_PRODUCT_CATALOG)).not.toMatch(/GBP|£|149|249|279/);
  });

  it("fulfilment credits and recurrence match tier truth", () => {
    expect(DODO_PRODUCT_CATALOG.vv_starter_oneoff).toMatchObject({ plan: "starter", credits: 25, recurring: false });
    expect(DODO_PRODUCT_CATALOG.vv_growth_monthly).toMatchObject({ plan: "growth", credits: 80, recurring: true });
    expect(DODO_PRODUCT_CATALOG.vv_agency_monthly).toMatchObject({ plan: "agency", credits: 250, recurring: true });
    expect(DODO_PRODUCT_CATALOG.vv_topup_small.credits).toBe(25);
    expect(DODO_PRODUCT_CATALOG.vv_topup_medium.credits).toBe(75);
    expect(DODO_PRODUCT_CATALOG.vv_topup_large.credits).toBe(200);
  });
});

// ── Webhook fulfilment invariants ──────────────────────────────────────────
describe("dodo webhook fulfilment invariants", () => {
  const hook = read("supabase/functions/dodo-webhook/index.ts");

  it("grants recurring credits ONLY on activation/renewal — updated/plan_changed never grant", () => {
    expect(hook).toContain('eventType === "subscription.active" || eventType === "subscription.renewed"');
    expect(hook).not.toMatch(/eventType === "subscription\.(updated|plan_changed)"[^\n]*grant/i);
  });

  it("dedupes financially and per event so duplicate delivery cannot double-grant", () => {
    expect(hook).toContain("dodo_payment:${externalId}");
    expect(hook).toContain("dodo_sub:${subId}:${cycleKey}");
    expect(hook).toContain('if ((dupErr as { code?: string }).code === "23505") return ok({ duplicate: true })');
    expect(hook).toContain('if ((error as { code?: string }).code === "23505") return false');
  });

  it("a metadata-less updated/plan_changed event cannot wipe the stored plan or price", () => {
    expect(hook).toContain("...(entry?.plan ? { plan: entry.plan } : {})");
    expect(hook).toContain("...(productKey ? { price_id: productKey } : {})");
    expect(hook).toContain("...(payload.product_id ? { product_id: payload.product_id } : {})");
    expect(hook).not.toContain("plan: entry?.plan ?? null");
  });

  it("fulfils only after signature verification, never before", () => {
    expect(hook.indexOf("verifyDodoWebhook")).toBeLessThan(hook.indexOf("handlePaymentSucceeded"));
    expect(hook).toContain('return new Response("invalid signature", { status: 400 })');
  });
});

describe("dodo checkout response minimality", () => {
  const fn = read("supabase/functions/dodo-create-checkout/index.ts");
  it("never returns environment/mode details to the browser", () => {
    expect(fn).not.toContain("mode: cfg.config.mode");
  });
});
