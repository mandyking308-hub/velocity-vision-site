// Carries plan intent from pricing CTAs into the contact form.
// Presentational only: no submission, validation or storage behaviour depends on this.

export const PLAN_INTENTS = ["starter", "growth", "agency"] as const;
export type PlanIntent = (typeof PLAN_INTENTS)[number];

const SKU_TO_SLUG: Record<string, PlanIntent> = {
  vv_starter_oneoff: "starter",
  vv_growth_monthly: "growth",
  vv_agency_monthly: "agency",
};

/** Maps a pricing SKU to its safe contact-form query value. */
export function planSlug(sku: string): PlanIntent {
  return SKU_TO_SLUG[sku] ?? "growth";
}

/** Allow-list: returns null for anything that is not one of the three plans. */
export function parsePlanIntent(value: string | null | undefined): PlanIntent | null {
  if (!value) return null;
  const normalised = value.trim().toLowerCase();
  return (PLAN_INTENTS as readonly string[]).includes(normalised)
    ? (normalised as PlanIntent)
    : null;
}

const PLAN_LABELS: Record<PlanIntent, string> = {
  starter: "Starter",
  growth: "Growth",
  agency: "Agency Workspace",
};

export function planLabel(plan: PlanIntent): string {
  return PLAN_LABELS[plan];
}

/** Editable prefill placed in the contact message when the field is still empty. */
export function planEnquiryMessage(plan: PlanIntent): string {
  return `I'd like onboarding for the ${PLAN_LABELS[plan]} plan.`;
}
