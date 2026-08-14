import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const checkout = readFileSync("supabase/functions/dodo-create-checkout/index.ts", "utf8");

describe("Dodo checkout authoritative entitlements", () => {
  it("blocks top-up checkout unless the authenticated user has an eligible paid plan", () => {
    expect(checkout).toContain('entry.kind.startsWith("topup_")');
    expect(checkout).toContain("effective_plan_for_actions");
    expect(checkout).toContain('"starter", "growth", "agency"');
    expect(checkout).toContain("paid_plan_required");
    expect(checkout).toContain("Credit top-ups are available only on eligible paid plans.");
  });

  it("checks the top-up entitlement before the runtime Dodo config/provider checkout", () => {
    const entitlement = checkout.indexOf('entry.kind.startsWith("topup_")');
    const config = checkout.indexOf("const cfg = loadDodoConfig");
    const provider = checkout.indexOf('fetch(`${cfg.config.baseUrl}/checkouts`');
    expect(entitlement).toBeGreaterThan(-1);
    expect(config).toBeGreaterThan(entitlement);
    expect(provider).toBeGreaterThan(config);
  });
});

describe("Dodo canonical live product-id protection", () => {
  it("repairs the known Growth uppercase-I typo before checkout", () => {
    expect(checkout).toContain('mappedId === "pdt_0Nl9s5I0TK2OPTMHCqwSs"');
    expect(checkout).toContain('return "pdt_0Nl9s5l0TK2OPTMHCqwSs"');
  });

  it("repairs the known Agency uppercase-I typo before checkout", () => {
    expect(checkout).toContain('mappedId === "pdt_0Nl9sTQjA4USAN3YTR6IU"');
    expect(checkout).toContain('return "pdt_0Nl9sTQjA4USAN3YTR6lU"');
  });


  it("uses the canonicalised id in the provider cart", () => {
    expect(checkout).toContain("const dodoProductId = canonicalDodoProductId(productKey, mappedProductId)");
    expect(checkout).toContain("product_cart: [{ product_id: dodoProductId, quantity: 1 }]");
  });
});
