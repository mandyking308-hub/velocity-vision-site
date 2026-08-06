import { describe, expect, it } from "vitest";
import { classifyCheckoutReturn, isBillingTrouble } from "@/lib/checkoutReturn";
import { buildSanitisedError, redactText, safeRoute } from "@/lib/clientErrorReport";
import {
  DODO_HANDLED_EVENTS,
  dodoReturnUrls,
  dodoSubscriptionStatus,
  isAllowedProductKey,
  loadDodoConfig,
  parseProductMap,
  verifyDodoWebhook,
} from "../../supabase/functions/_shared/dodo";

// ── A. Billing return states ──────────────────────────────────────────────
describe("classifyCheckoutReturn", () => {
  it("returns null when the param is absent", () => {
    expect(classifyCheckoutReturn(null)).toBeNull();
    expect(classifyCheckoutReturn("")).toBeNull();
  });

  it("treats success and existing Stripe plan flags as success", () => {
    for (const flag of ["success", "plan_starter", "growth", "agency", "starter"]) {
      expect(classifyCheckoutReturn(flag)?.status).toBe("success");
    }
  });

  it("treats both cancellation spellings as cancelled", () => {
    expect(classifyCheckoutReturn("cancelled")?.status).toBe("cancelled");
    expect(classifyCheckoutReturn("canceled")?.status).toBe("cancelled");
  });

  it("treats failure values as failed", () => {
    expect(classifyCheckoutReturn("failed")?.status).toBe("failed");
  });

  it("never reports success for an unknown value", () => {
    const parsed = classifyCheckoutReturn("wat");
    expect(parsed?.status).toBe("unknown");
    expect(parsed?.status).not.toBe("success");
  });
});

describe("isBillingTrouble", () => {
  it("flags dunning states", () => {
    for (const s of ["past_due", "on_hold", "failed", "unpaid"]) {
      expect(isBillingTrouble(s)).toBe(true);
    }
  });
  it("does not flag healthy states", () => {
    for (const s of ["active", "trialing", "canceled", null, undefined]) {
      expect(isBillingTrouble(s)).toBe(false);
    }
  });
});

// ── C. Dodo checkout configuration gate ───────────────────────────────────
describe("Dodo configuration", () => {
  it("returns payments_not_configured reasons instead of throwing", () => {
    expect(loadDodoConfig(() => undefined)).toEqual({ ok: false, reason: "missing_api_key" });
    expect(loadDodoConfig((k) => (k === "DODO_API_KEY" ? "key" : undefined)))
      .toEqual({ ok: false, reason: "missing_product_map" });
  });

  it("defaults to test mode unless live_mode is explicit", () => {
    const env = (k: string) =>
      ({ DODO_API_KEY: "key", DODO_PRODUCT_MAP: '{"vv_growth_monthly":"pdt_1"}' } as Record<string, string>)[k];
    const cfg = loadDodoConfig(env);
    expect(cfg.ok && cfg.config.mode).toBe("test_mode");
    expect(cfg.ok && cfg.config.baseUrl).toContain("test.dodopayments.com");
  });

  it("drops unknown product keys and malformed maps", () => {
    expect(parseProductMap('{"not_a_key":"pdt_1","vv_topup_small":"pdt_2"}'))
      .toEqual({ vv_topup_small: "pdt_2" });
    expect(parseProductMap("not json")).toEqual({});
  });

  it("only accepts allow-listed product keys", () => {
    expect(isAllowedProductKey("vv_growth_monthly")).toBe(true);
    expect(isAllowedProductKey("pdt_injected")).toBe(false);
  });

  it("pins return/cancel URLs to the allow-listed origin", () => {
    expect(dodoReturnUrls("https://evil.example").return_url)
      .toBe("https://velocity-outreach.com/app/billing?checkout=success");
    expect(dodoReturnUrls("https://velocity-outreach.com").cancel_url)
      .toBe("https://velocity-outreach.com/app/billing?checkout=cancelled");
  });
});

// ── D. Webhook verification ───────────────────────────────────────────────
const SECRET = "whsec_dGVzdHNlY3JldA==";

async function sign(id: string, ts: string, body: string): Promise<string> {
  const raw = SECRET.slice("whsec_".length);
  const bin = atob(raw);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const key = await crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
  let out = "";
  for (const b of sig) out += String.fromCharCode(b);
  return `v1,${btoa(out)}`;
}

describe("verifyDodoWebhook", () => {
  const body = JSON.stringify({ type: "payment.succeeded" });
  const now = 1_800_000_000;
  const ts = String(now);

  it("accepts a correctly signed payload", async () => {
    const res = await verifyDodoWebhook({
      secret: SECRET, webhookId: "evt_1", webhookTimestamp: ts,
      webhookSignature: await sign("evt_1", ts, body), body, nowSeconds: now,
    });
    expect(res.valid).toBe(true);
  });

  it("rejects a missing secret", async () => {
    const res = await verifyDodoWebhook({
      secret: undefined, webhookId: "evt_1", webhookTimestamp: ts,
      webhookSignature: "v1,x", body, nowSeconds: now,
    });
    expect(res).toEqual({ valid: false, reason: "missing_secret" });
  });

  it("rejects missing headers", async () => {
    const res = await verifyDodoWebhook({
      secret: SECRET, webhookId: null, webhookTimestamp: ts,
      webhookSignature: "v1,x", body, nowSeconds: now,
    });
    expect(res).toEqual({ valid: false, reason: "missing_headers" });
  });

  it("rejects a bad signature", async () => {
    const res = await verifyDodoWebhook({
      secret: SECRET, webhookId: "evt_1", webhookTimestamp: ts,
      webhookSignature: "v1,AAAA", body, nowSeconds: now,
    });
    expect(res).toEqual({ valid: false, reason: "signature_mismatch" });
  });

  it("rejects a replayed/stale timestamp", async () => {
    const res = await verifyDodoWebhook({
      secret: SECRET, webhookId: "evt_1", webhookTimestamp: ts,
      webhookSignature: await sign("evt_1", ts, body), body, nowSeconds: now + 1000,
    });
    expect(res).toEqual({ valid: false, reason: "timestamp_out_of_tolerance" });
  });

  it("rejects a signature bound to a different webhook id (no cross-event replay)", async () => {
    const res = await verifyDodoWebhook({
      secret: SECRET, webhookId: "evt_2", webhookTimestamp: ts,
      webhookSignature: await sign("evt_1", ts, body), body, nowSeconds: now,
    });
    expect(res.valid).toBe(false);
  });
});

describe("Dodo event handling surface", () => {
  it("handles exactly the documented launch events", () => {
    expect([...DODO_HANDLED_EVENTS].sort()).toEqual([
      "payment.failed", "payment.succeeded", "subscription.active",
      "subscription.cancelled", "subscription.expired", "subscription.failed",
      "subscription.on_hold", "subscription.renewed", "subscription.updated",
    ]);
  });

  it("acknowledges unknown events without a handler", () => {
    expect(DODO_HANDLED_EVENTS.has("dispute.opened")).toBe(false);
  });

  it("maps subscription events to safe statuses", () => {
    expect(dodoSubscriptionStatus("subscription.on_hold")).toBe("on_hold");
    expect(dodoSubscriptionStatus("subscription.cancelled")).toBe("canceled");
    expect(dodoSubscriptionStatus("subscription.renewed")).toBe("active");
    expect(dodoSubscriptionStatus("subscription.updated", "paused")).toBe("paused");
  });
});

// ── E. Client error sanitisation ──────────────────────────────────────────
describe("client error sanitisation", () => {
  it("redacts emails, urls, ids and long tokens", () => {
    const out = redactText("failed for mandy@example.com at https://x.com/a?b=c token eyJhbGciOiJIUzI1NiJ9abcdefghijklmnop");
    expect(out).not.toContain("mandy@example.com");
    expect(out).not.toContain("https://");
    expect(out).not.toContain("eyJhbGciOiJIUzI1NiJ9abcdefghijklmnop");
  });

  it("strips query strings and ids from routes", () => {
    expect(safeRoute("/app/campaigns/6b1d4b1f-6d3c-4a2e-9f6b-2b9c1a2d3e4f/edit?token=abc"))
      .toBe("/app/campaigns/:id/edit");
  });

  it("produces a payload with no personal data", () => {
    const payload = buildSanitisedError(new Error("bad email lead@corp.com"), "/app/leads?q=secret");
    expect(payload.message).not.toContain("lead@corp.com");
    expect(payload.route).toBe("/app/leads");
    expect(Object.keys(payload).sort()).toEqual(["build", "message", "name", "route", "stack"]);
  });
});
