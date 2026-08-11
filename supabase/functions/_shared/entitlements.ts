export const KNOWN_PLANS = ["free_preview", "starter", "growth", "agency"] as const;
export type KnownPlan = (typeof KNOWN_PLANS)[number];

export const ENTITLED_STATUSES = new Set(["active", "trialing", "canceling"]);

export interface EntitlementRecord {
  plan?: string | null;
  status?: string | null;
  period_end?: string | null;
}

export function isKnownPlan(value: unknown): value is KnownPlan {
  return typeof value === "string" && (KNOWN_PLANS as readonly string[]).includes(value.toLowerCase());
}

/** Shared fail-closed server rule. */
export function isEntitlementActive(record: EntitlementRecord | null | undefined, nowMs = Date.now()): boolean {
  if (!record || !isKnownPlan(record.plan)) return false;
  const status = String(record.status || "").toLowerCase();
  if (!ENTITLED_STATUSES.has(status)) return false;
  if (!record.period_end) return false;
  const end = new Date(record.period_end).getTime();
  return Number.isFinite(end) && end > nowMs;
}

export function effectivePlan(record: EntitlementRecord | null | undefined, nowMs = Date.now()): KnownPlan | null {
  return isEntitlementActive(record, nowMs) ? String(record!.plan).toLowerCase() as KnownPlan : null;
}

/**
 * Translate provider lifecycle state into the product entitlement state.
 * Only an explicit cancel-at-period-end keeps access through a future paid
 * period; an immediate cancellation fails closed even if a stale future date is
 * still present in the provider payload.
 */
export function userPlanStatusForSubscription(input: {
  subscriptionStatus: string;
  periodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  nowMs?: number;
}): string {
  const status = String(input.subscriptionStatus || "").toLowerCase();
  const endMs = input.periodEnd ? new Date(input.periodEnd).getTime() : NaN;
  const hasFuturePeriod = Number.isFinite(endMs) && endMs > (input.nowMs ?? Date.now());

  if (status === "active" || status === "trialing") {
    return input.cancelAtPeriodEnd && hasFuturePeriod ? "canceling" : status;
  }
  if (status === "canceled" || status === "cancelled") {
    return input.cancelAtPeriodEnd && hasFuturePeriod ? "canceling" : "canceled";
  }
  if (status === "on_hold") return "on_hold";
  if (status === "past_due" || status === "failed") return "past_due";
  if (status === "expired") return "expired";
  return status || "inactive";
}
