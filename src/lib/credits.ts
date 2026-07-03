// Campaign Credits — customer-facing AI usage allowance
// All numbers here are placeholders the founder can edit later.

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
    price: "£0",
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
      "Preview / watermarked exports",
      "Sending stays gated — upgrade to activate",
      "14 days of preview access",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Self-Serve Campaign Launch",
    price: "£149",
    unit: "one-off",
    includedCredits: 25,
    cadence: "one-off",
    durationDays: 30,
    workspaceLimit: 1,
    pooledCredits: false,
    features: [
      "1 workspace",
      "1 guided campaign brief",
      "1 full campaign pack",
      "Social, press release, video pack",
      "30 days of access",
      "25 Campaign Credits included",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    tagline: "Monthly Campaign Engine",
    price: "£249",
    unit: "per month",
    includedCredits: 80,
    cadence: "monthly",
    workspaceLimit: 1,
    pooledCredits: false,
    features: [
      "1 main workspace",
      "80 Campaign Credits / month",
      "Templates, lead capture, pipeline",
      "Connected email area",
      "Repeat campaigns",
      "Monthly performance review",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency Workspace",
    tagline: "Multi-client workspace",
    price: "£499",
    unit: "per month",
    includedCredits: 250,
    cadence: "monthly",
    workspaceLimit: null,
    pooledCredits: true,
    features: [
      "Unlimited client workspaces",
      "250 pooled Campaign Credits / month",
      "Reusable templates & assets",
      "Cross-client pipeline",
      "Client-level reporting",
      "Seat management",
    ],
  },
};

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

// Top-up packs (placeholder pricing — editable later)
export interface TopUpPack {
  id: "small" | "medium" | "large";
  label: string;
  credits: number;
  price: number; // GBP
  blurb: string;
}

export const TOPUP_PACKS: TopUpPack[] = [
  { id: "small", label: "Small top-up", credits: 25, price: 49, blurb: "A quick boost for one extra campaign." },
  { id: "medium", label: "Medium top-up", credits: 75, price: 119, blurb: "Best value for active months.", },
  { id: "large", label: "Large top-up", credits: 200, price: 279, blurb: "For agencies or busy launch sprints." },
];

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
