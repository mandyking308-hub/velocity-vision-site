// Campaign Credits — customer-facing AI usage allowance.
// This module is the shared plan/entitlement truth for the website and app:
// plan allowances, credit costs, Free Preview limits and top-up packs here
// must match the published Pricing page and the server/DB enforcement gates.

export type PlanId = "free_preview" | "starter" | "growth" | "agency";

// Hard limits enforced for the Free Preview tier — checked in UI and by DB gates.
export const FREE_LIMITS = {
  welcomeCredits: 10,
  dailyGrant: 2,
  dailyBalanceCap: 10,
  previewDays: 14,
  maxContacts: 25,
  maxCampaignPacks: 1,
} as const;

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  unit: string;
  includedCredits: number;
  cadence: "one-off" | "monthly";
  durationDays?: number; // for one-off plans like Starter
  workspaceLimit: number | null; // null = unlimited
  pooledCredits: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free_preview: {
    id: "free_preview",
    name: "Free Preview",
    tagline: "Try the workspace, no card required",
    price: "$0",
    unit: "free",
    includedCredits: FREE_LIMITS.welcomeCredits,
    cadence: "one-off",
    durationDays: FREE_LIMITS.previewDays,
    workspaceLimit: 1,
    pooledCredits: false,
    features: [
      "1 workspace",
      "10 welcome Campaign Credits",
      "+2 free credits per day (capped at 10)",
      "Up to 25 contacts",
      "1 full campaign pack",
      "Explore the full workflow in review mode",
      "No live sending — upgrade to activate",
      "14 days of preview access",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Self-Serve Campaign Launch",
    price: "$189",
    unit: "one-off",
    includedCredits: 25,
    cadence: "one-off",
    durationDays: 30,
    workspaceLimit: 1,
    pooledCredits: false,
    features: [
      "1 workspace",
      "Copilot brief, Launchpad and full campaign pack",
      "Preflight checks and governed activation",
      "Reply Intent Command Centre, referrals and out-of-office dates",
      "Meeting handoff, pipeline and Outcome Funnel",
      "One-off campaigns · up to 20 sends/day",
      "30 days of access · 25 Campaign Credits",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    tagline: "Monthly Campaign Engine",
    price: "$315",
    unit: "per month",
    includedCredits: 80,
    cadence: "monthly",
    workspaceLimit: 1,
    pooledCredits: false,
    features: [
      "Everything in Starter, ongoing",
      "80 Campaign Credits / month",
      "Recurring cadence (weekly, monthly, custom)",
      "Reusable recurring campaign templates",
      "Up to 50 sends/day",
      "1 main workspace",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency Workspace",
    tagline: "Multi-client workspace",
    price: "$629",
    unit: "per month",
    includedCredits: 250,
    cadence: "monthly",
    workspaceLimit: null,
    pooledCredits: true,
    features: [
      "Everything in Growth",
      "Unlimited isolated client workspaces",
      "250 pooled Campaign Credits / month",
      "Cross-client pipeline and Outcome Funnel visibility",
      "Account-wide send usage across client workspaces",
      "Up to 100 sends/day",
    ],
  },
};


// --- Plan entitlements (mirrored by authoritative server/DB enforcement) ---

/** Recurring cadence + reusable recurring templates are Growth/Agency only.
 *  Mirrored by the campaigns trigger `enforce_recurring_cadence_plan`. */
export function canUseRecurringCadence(plan: PlanId): boolean {
  return plan === "growth" || plan === "agency";
}

/** Live (non controlled-test) sending. Mirrored by `email-send`, which is the
 *  authoritative gate — Free Preview has a 0/day ceiling. */
export function canSendLive(plan: PlanId): boolean {
  return plan !== "free_preview";
}

// Credit cost per AI-heavy action. All other actions are free.
export const CREDIT_COSTS = {
  full_campaign_pack: 10,
  social_pack: 4,
  press_release: 3,
  video_pack: 4,
  email_sequence: 3,
  landing_offer_regen: 3,
  monthly_summary: 2,
  regenerate_section: 2,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const ACTION_LABELS: Record<CreditAction, string> = {
  full_campaign_pack: "Full campaign pack",
  social_pack: "Social media pack",
  press_release: "Press release",
  video_pack: "Video pack",
  email_sequence: "Email sequence",
  landing_offer_regen: "Landing / offer regeneration",
  monthly_summary: "Monthly AI performance summary",
  regenerate_section: "Regenerate section",
};

// Top-up packs — paid workspaces only (Free Preview cannot buy top-ups).
// `price` is the live USD reference and MUST match PRICE_CATALOGUE[..].USD in
// src/lib/currency.ts; all customer-facing display goes through priceFor().
export interface TopUpPack {
  id: "small" | "medium" | "large";
  label: string;
  credits: number;
  price: number; // USD reference — display via the currency catalogue
  blurb: string;
}

export const TOPUP_PACKS: TopUpPack[] = [
  { id: "small", label: "Small top-up", credits: 25, price: 59, blurb: "A quick boost for one extra campaign." },
  { id: "medium", label: "Medium top-up", credits: 75, price: 149, blurb: "Best value for active months.", },
  { id: "large", label: "Large top-up", credits: 200, price: 349, blurb: "For agencies or busy launch sprints." },
];

// Historical only: Human Review is cancelled as a product. Retained solely so
// internal CRM revenue reporting for past purchases keeps compiling.
export const HUMAN_REVIEW_PRICE = 199;

// Warning thresholds — share between dashboard, banners and modals
export const WARN_THRESHOLD = 0.75;
export const STRONG_WARN_THRESHOLD = 0.9;

export function usageState(used: number, included: number) {
  if (included <= 0) return "ok" as const;
  const ratio = used / included;
  if (ratio >= 1) return "exhausted" as const;
  if (ratio >= STRONG_WARN_THRESHOLD) return "strong" as const;
  if (ratio >= WARN_THRESHOLD) return "soft" as const;
  return "ok" as const;
}
