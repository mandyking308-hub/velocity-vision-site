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
  vv_human_review_oneoff: "pdt_4",
  vv_topup_small: "pdt_5",
  vv_topup_medium: "pdt_6",
  vv_topup_large: "pdt_7",
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

  it("reports per-product readiness for a partial live map", () => {
    const r = computeDodoReadiness(env({
      DODO_API_KEY: "k",
      DODO_ENVIRONMENT: "live_mode",
      DODO_PRODUCT_MAP: JSON.stringify({ vv_growth_monthly: "pdt_2", vv_topup_small: " " }),
    }));
    expect(r.live).toBe(true);
    expect(r.ready).toBe(true);
    expect(r.products.vv_growth_monthly).toBe(true);
    expect(r.products.vv_starter_oneoff).toBe(false);
    expect(r.products.vv_topup_small).toBe(false);
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
