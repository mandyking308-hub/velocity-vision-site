// Client-side mirror of the safe Dodo readiness contract.
// Pure and secret-free: this module only ever handles booleans returned by the
// `dodo-readiness` edge function. It never sees a key, product id or amount.

export const DODO_READINESS_PRODUCTS = [
  "vv_starter_oneoff",
  "vv_growth_monthly",
  "vv_agency_monthly",
  "vv_human_review_oneoff",
  "vv_topup_small",
  "vv_topup_medium",
  "vv_topup_large",
] as const;

export type DodoProductKey = (typeof DODO_READINESS_PRODUCTS)[number];

export interface DodoReadiness {
  provider: "dodo";
  live: boolean;
  ready: boolean;
  products: Record<DodoProductKey, boolean>;
}

export const DODO_READINESS_OFFLINE: DodoReadiness = {
  provider: "dodo",
  live: false,
  ready: false,
  products: DODO_READINESS_PRODUCTS.reduce(
    (acc, k) => ({ ...acc, [k]: false }),
    {} as Record<DodoProductKey, boolean>,
  ),
};

/** Defensive parse — anything unexpected collapses to "not ready". */
export function parseDodoReadiness(raw: unknown): DodoReadiness {
  if (!raw || typeof raw !== "object") return DODO_READINESS_OFFLINE;
  const obj = raw as Record<string, unknown>;
  if (obj.provider !== "dodo") return DODO_READINESS_OFFLINE;
  const src = (obj.products && typeof obj.products === "object" ? obj.products : {}) as Record<string, unknown>;
  const products = DODO_READINESS_PRODUCTS.reduce(
    (acc, k) => ({ ...acc, [k]: src[k] === true }),
    {} as Record<DodoProductKey, boolean>,
  );
  const live = obj.live === true;
  const ready = obj.ready === true;
  return { provider: "dodo", live, ready, products };
}

/** A product may only be bought online when Dodo is live AND that product is mapped. */
export function isProductLiveReady(readiness: DodoReadiness | null | undefined, key: DodoProductKey): boolean {
  if (!readiness) return false;
  return readiness.live === true && readiness.ready === true && readiness.products[key] === true;
}

/** Plan slug -> internal product key. Allow-listed, never client-supplied ids. */
export const PLAN_SLUG_TO_PRODUCT: Record<string, DodoProductKey> = {
  starter: "vv_starter_oneoff",
  growth: "vv_growth_monthly",
  agency: "vv_agency_monthly",
};

/** Copy shown wherever online checkout is not yet activated. */
export const CHECKOUT_ACTIVATING_COPY =
  "Online checkout is being activated — contact us for onboarding.";

/** True only when at least one top-up product can actually be bought online now. */
export function isAnyTopUpLiveReady(readiness: DodoReadiness | null | undefined): boolean {
  return (
    isProductLiveReady(readiness, "vv_topup_small") ||
    isProductLiveReady(readiness, "vv_topup_medium") ||
    isProductLiveReady(readiness, "vv_topup_large")
  );
}
