/**
 * Classification of the `?checkout=` query parameter used on /app/billing.
 *
 * Historically every value was treated as a success, which meant a cancelled
 * or failed checkout still showed "payment received". This module is the single
 * source of truth for that decision and is unit tested.
 *
 * NOTE: the existing Stripe return paths use plan/product identifiers as the
 * value (e.g. `?checkout=growth`, `?checkout=topup_small`) — those must keep
 * behaving exactly as before, i.e. as a success.
 */

export type CheckoutReturnStatus = "success" | "cancelled" | "failed" | "unknown";

export interface CheckoutReturn {
  status: CheckoutReturnStatus;
  /** The raw flag, preserved for existing post-success routing decisions. */
  flag: string;
  /** True only when we should poll for webhook-provisioned entitlements. */
  shouldProvision: boolean;
}

const CANCELLED = new Set(["cancelled", "canceled", "cancel", "abandoned"]);
const FAILED = new Set(["failed", "failure", "error", "declined"]);

/** Values the app itself generates for a successful return. */
const KNOWN_SUCCESS = new Set([
  "success",
  "starter",
  "growth",
  "agency",
  "plan_starter",
  "human_review",
  "topup",
  "topup_small",
  "topup_medium",
  "topup_large",
]);

export function classifyCheckoutReturn(raw: string | null | undefined): CheckoutReturn | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const flag = String(raw).trim();
  const key = flag.toLowerCase();

  if (CANCELLED.has(key)) return { status: "cancelled", flag, shouldProvision: false };
  if (FAILED.has(key)) return { status: "failed", flag, shouldProvision: false };
  if (KNOWN_SUCCESS.has(key)) return { status: "success", flag, shouldProvision: true };

  // Anything we don't recognise must never claim a payment was received.
  return { status: "unknown", flag, shouldProvision: false };
}

/** Subscription statuses that mean the customer needs to take a billing action. */
const TROUBLE_STATUSES = new Set([
  "past_due",
  "on_hold",
  "failed",
  "unpaid",
  "incomplete",
]);

export function isBillingTrouble(status: string | null | undefined): boolean {
  if (!status) return false;
  return TROUBLE_STATUSES.has(String(status).toLowerCase());
}

export function billingTroubleCopy(status: string | null | undefined): { title: string; body: string } {
  const key = String(status ?? "").toLowerCase();
  if (key === "on_hold") {
    return {
      title: "Your subscription is on hold",
      body: "We couldn't take the latest payment, so your plan is paused. Update your payment method to resume.",
    };
  }
  if (key === "incomplete") {
    return {
      title: "Payment not completed",
      body: "Your last payment didn't finish. Complete it to activate your plan.",
    };
  }
  return {
    title: "Payment failed",
    body: "Your last renewal didn't go through. Update your payment method to keep your plan active.",
  };
}

/**
 * Which edge function opens the hosted billing portal for a subscription row.
 * Legacy rows have no `provider` and must keep using the proven Stripe path.
 */
export function resolveBillingPortalFunction(
  provider: string | null | undefined,
): "create-billing-portal-session" | "dodo-customer-portal" {
  return String(provider ?? "").toLowerCase() === "dodo"
    ? "dodo-customer-portal"
    : "create-billing-portal-session";
}
