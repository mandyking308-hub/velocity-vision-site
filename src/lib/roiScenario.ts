// Homepage scenario calculator — pure maths + plan-cost lookup.
// Self-serve truth: the scenario is built from the visitor's own assumptions
// (lead volume, close rate, deal value). It is NOT Velocity-attributed or
// guaranteed revenue, so all outputs are labelled as scenario estimates and
// compared against the live catalogue price of the selected plan.

import { priceFor, type Currency, type SkuId } from "@/lib/currency";

export type RoiPlanId = "starter" | "growth" | "agency";

export interface RoiPlan {
  id: RoiPlanId;
  name: string;
  sku: SkuId;
  /** Billing period — drives truthful comparison copy. */
  period: "one-off" | "monthly";
  /** Short description of what the price covers. */
  periodNote: string;
}

export const ROI_PLANS: readonly RoiPlan[] = [
  {
    id: "starter",
    name: "Starter",
    sku: "vv_starter_oneoff",
    period: "one-off",
    periodNote: "one-off 30-day plan",
  },
  {
    id: "growth",
    name: "Growth",
    sku: "vv_growth_monthly",
    period: "monthly",
    periodNote: "monthly plan",
  },
  {
    id: "agency",
    name: "Agency",
    sku: "vv_agency_monthly",
    period: "monthly",
    periodNote: "monthly plan",
  },
] as const;

export const DEFAULT_ROI_PLAN: RoiPlanId = "growth";

export function getRoiPlan(id: RoiPlanId): RoiPlan {
  return ROI_PLANS.find((p) => p.id === id) ?? ROI_PLANS.find((p) => p.id === DEFAULT_ROI_PLAN)!;
}

/** Live catalogue price for a plan in the visitor's active currency. */
export function planCostFor(id: RoiPlanId, currency: Currency): number {
  return priceFor(getRoiPlan(id).sku, currency).amount;
}

/**
 * Parse a raw input string into a finite, non-negative number.
 * Returns null for empty or unparseable input so the caller can treat it
 * as zero for maths WITHOUT snapping the input field back to "0".
 */
export function parseScenarioInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, n);
}

function safe(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function clampRate(pct: number | null | undefined): number {
  return Math.min(Math.max(safe(pct), 0), 100);
}

export interface ScenarioInput {
  monthlyLeads: number | null;
  closeRatePct: number | null;
  dealValue: number | null;
  /** Selected plan's localised catalogue price (one-off or monthly). */
  planCost: number;
}

export interface ScenarioResult {
  /** clamped close rate actually used (0–100) */
  closeRatePct: number;
  /** estimated deals = leads × close rate */
  deals: number;
  /** potential monthly revenue = deals × deal value */
  monthlyRevenue: number;
  /** potential annual revenue = monthly × 12 */
  annualRevenue: number;
  /** monthly scenario revenue minus the plan price */
  netVsPlan: number;
  /** scenario monthly revenue ÷ plan price (0 when plan is free) */
  ratio: number;
  isNetPositive: boolean;
}

/** Transparent scenario maths. Guaranteed finite — never NaN/Infinity. */
export function computeScenario(input: ScenarioInput): ScenarioResult {
  const leads = safe(input.monthlyLeads);
  const ratePct = clampRate(input.closeRatePct);
  const value = safe(input.dealValue);
  const cost = safe(input.planCost);

  const deals = leads * (ratePct / 100);
  const monthlyRevenue = deals * value;
  const annualRevenue = monthlyRevenue * 12;
  const netVsPlan = monthlyRevenue - cost;
  const ratio = cost > 0 ? monthlyRevenue / cost : 0;

  return {
    closeRatePct: ratePct,
    deals,
    monthlyRevenue,
    annualRevenue,
    netVsPlan,
    ratio,
    isNetPositive: netVsPlan > 0,
  };
}
