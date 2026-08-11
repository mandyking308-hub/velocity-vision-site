import { describe, expect, it } from "vitest";
import { isPlanEntitled } from "@/lib/planEntitlement";
import { isEntitlementActive, userPlanStatusForSubscription } from "../../supabase/functions/_shared/entitlements";

const NOW = Date.parse("2026-08-11T12:00:00Z");
const FUTURE = "2026-09-11T12:00:00Z";
const PAST = "2026-08-01T12:00:00Z";

describe("plan entitlement", () => {
  it.each(["free_preview", "starter", "growth", "agency"])("accepts current active %s", (plan) => {
    expect(isPlanEntitled({ plan, status: "active", periodEnd: FUTURE, now: NOW })).toBe(true);
    expect(isEntitlementActive({ plan, status: "active", period_end: FUTURE }, NOW)).toBe(true);
  });

  it.each(["canceled", "expired", "past_due", "on_hold", "inactive", ""])("fails closed for %s", (status) => {
    expect(isPlanEntitled({ plan: "growth", status, periodEnd: FUTURE, now: NOW })).toBe(false);
    expect(isEntitlementActive({ plan: "growth", status, period_end: FUTURE }, NOW)).toBe(false);
  });

  it("fails closed when the paid period has ended even if status still says active", () => {
    expect(isPlanEntitled({ plan: "starter", status: "active", periodEnd: PAST, now: NOW })).toBe(false);
    expect(isEntitlementActive({ plan: "agency", status: "active", period_end: PAST }, NOW)).toBe(false);
  });

  it("keeps an explicit cancel-at-period-end entitled through the paid period", () => {
    expect(userPlanStatusForSubscription({ subscriptionStatus: "active", periodEnd: FUTURE, cancelAtPeriodEnd: true, nowMs: NOW })).toBe("canceling");
    expect(isEntitlementActive({ plan: "growth", status: "canceling", period_end: FUTURE }, NOW)).toBe(true);
  });

  it("stops an immediate cancellation even if a stale future period date is present", () => {
    expect(userPlanStatusForSubscription({ subscriptionStatus: "canceled", periodEnd: FUTURE, cancelAtPeriodEnd: false, nowMs: NOW })).toBe("canceled");
    expect(isEntitlementActive({ plan: "growth", status: "canceled", period_end: FUTURE }, NOW)).toBe(false);
  });

  it("maps provider trouble states to non-entitled product states", () => {
    expect(userPlanStatusForSubscription({ subscriptionStatus: "failed", periodEnd: FUTURE, nowMs: NOW })).toBe("past_due");
    expect(userPlanStatusForSubscription({ subscriptionStatus: "on_hold", periodEnd: FUTURE, nowMs: NOW })).toBe("on_hold");
    expect(userPlanStatusForSubscription({ subscriptionStatus: "expired", periodEnd: PAST, nowMs: NOW })).toBe("expired");
  });
});
