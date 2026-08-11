import type { PlanId } from "./credits";

export const ENTITLED_PLAN_STATUSES = new Set(["active", "trialing", "canceling"]);

export interface PlanEntitlementInput {
  plan: PlanId | string | null | undefined;
  status: string | null | undefined;
  periodEnd: string | Date | null | undefined;
  now?: number;
}

/**
 * Client mirror of the authoritative DB/server entitlement rule.
 * Paid actions fail closed unless the account is in an entitled status and the
 * paid/preview period has not ended. `canceling` remains usable until periodEnd.
 */
export function isPlanEntitled(input: PlanEntitlementInput): boolean {
  const plan = String(input.plan || "").toLowerCase();
  if (!["free_preview", "starter", "growth", "agency"].includes(plan)) return false;
  const status = String(input.status || "").toLowerCase();
  if (!ENTITLED_PLAN_STATUSES.has(status)) return false;
  if (!input.periodEnd) return false;
  const end = input.periodEnd instanceof Date ? input.periodEnd.getTime() : new Date(input.periodEnd).getTime();
  if (!Number.isFinite(end)) return false;
  return end > (input.now ?? Date.now());
}

export function paidActionsPlan(plan: PlanId, entitled: boolean): PlanId {
  return entitled ? plan : "free_preview";
}
