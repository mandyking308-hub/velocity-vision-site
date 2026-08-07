// Send Safety Engine — central governance for customer-controlled outreach sending.
// Daily send ceilings are enforced by paid plan + sender/data safety, not Campaign Credits.

import type { PlanId } from "./credits";

/* --------------- 1. Plan-tier daily ceilings --------------- */

// Canonical daily send ceilings. These MUST match WARMUP_DAILY_CAP in
// supabase/functions/email-send/index.ts, which is the authoritative
// server-side enforcement point. Warm-up, sender health and rate limits can
// only reduce the effective allowance — never raise it above these numbers.
export const PLAN_DAILY_CEILING: Record<PlanId, number> = {
  free_preview: 0, // Free Preview cannot make live sends.
  starter: 20,
  growth: 50,
  agency: 100, // counted per sending account
};

/* --------------- 2. Activation readiness model --------------- */

export type QualityStatus =
  | "valid"
  | "needs_review"
  | "risky"
  | "blocked"
  | "suppressed"
  | "duplicate";

export type ActivationClass =
  | "safe"
  | "review"
  | "excluded_risky"
  | "excluded";

export const ACTIVATION_LABELS: Record<ActivationClass, string> = {
  safe: "Eligible for activation review",
  review: "Review before activation",
  excluded_risky: "Excluded by default — override possible",
  excluded: "Excluded from activation",
};

export function classifyQuality(q: QualityStatus | string | null | undefined): ActivationClass {
  switch (q) {
    case "valid": return "safe";
    case "needs_review": return "review";
    case "risky": return "excluded_risky";
    case "blocked":
    case "suppressed":
    case "duplicate":
    default: return q === "risky" ? "excluded_risky" : "excluded";
  }
}

export interface VaultBreakdown {
  valid: number;
  needs_review: number;
  risky: number;
  blocked: number;
  suppressed?: number;
  duplicates?: number;
}

export function activationCounts(v: VaultBreakdown) {
  return {
    safe: v.valid,
    review: v.needs_review,
    excluded_risky: v.risky,
    excluded: (v.blocked || 0) + (v.suppressed || 0) + (v.duplicates || 0),
  };
}

/* --------------- 3. Sender / domain health --------------- */

export type SenderHealth = "healthy" | "warming" | "needs_attention" | "paused" | "disconnected";

export interface SenderState {
  connected: boolean;
  domain_authenticated: boolean;
  reconnect_required: boolean;
  newly_connected: boolean;
  last_send_at: string | null;
  bounce_rate: number;
  unsubscribe_rate: number;
  complaint_rate?: number;
  /** When set, sender is warm-up-eligible; caps the daily safeAllowance. */
  warmup_daily_cap?: number | null;
}

export function senderHealth(s: SenderState): SenderHealth {
  if (!s.connected) return "disconnected";
  if (s.reconnect_required) return "needs_attention";
  if ((s.complaint_rate ?? 0) > 0.005 || s.bounce_rate > 0.08) return "needs_attention";
  if (s.newly_connected || !s.domain_authenticated) return "warming";
  return "healthy";
}

export const SENDER_HEALTH_LABEL: Record<SenderHealth, string> = {
  healthy: "Healthy",
  warming: "Warming up",
  needs_attention: "Needs attention",
  paused: "Paused",
  disconnected: "Not connected",
};

export const SENDER_HEALTH_TONE: Record<SenderHealth, string> = {
  healthy: "text-emerald-600 bg-emerald-100",
  warming: "text-amber-600 bg-amber-100",
  needs_attention: "text-rose-600 bg-rose-100",
  paused: "text-muted-foreground bg-muted",
  disconnected: "text-rose-600 bg-rose-100",
};

/* --------------- 4. Safety adjustments --------------- */

export interface SafetyAdjustment {
  factor: number;
  reason: string;
}

export interface SafetyInput {
  plan: PlanId;
  vault: VaultBreakdown;
  sender: SenderState;
  sendsUsedToday: number;
  sendsScheduledToday: number;
  /**
   * @deprecated Kept temporarily for caller compatibility only.
   * Campaign Credits fund credit-priced AI generation and MUST NOT cap live sends.
   */
  sendCreditsRemaining?: number;
  /** Agency only: total sends today across the account's client workspaces. */
  agencyPooledSendsToday?: number;
}

export interface SafetyResult {
  planCeiling: number;
  safeAllowance: number;
  recommendedToday: number;
  remainingToday: number;
  adjustments: SafetyAdjustment[];
  pauseReasons: string[];
  health: SenderHealth;
  excluded: { risky: number; blocked: number; review: number };
  reviewShare: number;
  agencyPooledSendsToday?: number;
  agencyPooledRemaining?: number;
}

export function computeSafety(input: SafetyInput): SafetyResult {
  const ceiling = PLAN_DAILY_CEILING[input.plan] ?? 0;
  const adjustments: SafetyAdjustment[] = [];
  const pause: string[] = [];
  let factor = 1;

  const totalAudience = input.vault.valid + input.vault.needs_review + input.vault.risky;
  const reviewShare = totalAudience > 0 ? input.vault.needs_review / totalAudience : 0;
  const health = senderHealth(input.sender);

  if (!input.sender.connected) {
    pause.push("No sender mailbox is connected.");
    factor = 0;
  }
  if (input.sender.reconnect_required) {
    pause.push("Sender requires reconnection.");
    factor = 0;
  }
  if (!input.sender.domain_authenticated && input.sender.connected && !input.sender.warmup_daily_cap) {
    pause.push("Sender setup is not complete.");
    factor = 0;
  }
  if (input.sender.newly_connected && input.sender.connected) {
    adjustments.push({ factor: 0.4, reason: "New sender account — warming up." });
    factor *= 0.4;
  }
  if (input.sender.bounce_rate > 0.05) {
    adjustments.push({ factor: 0.5, reason: `Elevated bounce rate (${(input.sender.bounce_rate * 100).toFixed(1)}%).` });
    factor *= 0.5;
  }
  if (input.sender.unsubscribe_rate > 0.02) {
    adjustments.push({ factor: 0.7, reason: `Elevated unsubscribe rate (${(input.sender.unsubscribe_rate * 100).toFixed(1)}%).` });
    factor *= 0.7;
  }
  if (reviewShare > 0.2) {
    adjustments.push({ factor: 0.75, reason: `${Math.round(reviewShare * 100)}% of this segment still needs review.` });
    factor *= 0.75;
  }

  // Campaign Credits are deliberately absent from this calculation. Sending is
  // governed by the paid-plan ceiling, sender readiness, data status and the
  // authoritative server-side email-send limit.
  const adjusted = Math.floor(ceiling * factor);
  let safeAllowance = Math.max(0, Math.min(adjusted, input.vault.valid));

  if (input.sender.warmup_daily_cap && input.sender.warmup_daily_cap > 0) {
    if (safeAllowance > input.sender.warmup_daily_cap) {
      adjustments.push({
        factor: input.sender.warmup_daily_cap / Math.max(safeAllowance, 1),
        reason: `Warm-up cap: ${input.sender.warmup_daily_cap}/day for this sender.`,
      });
    }
    safeAllowance = Math.min(safeAllowance, input.sender.warmup_daily_cap);
  }

  // Agency account-wide usage visibility. The authoritative daily ceiling is
  // still enforced server-side in email-send for the sending account.
  let agencyPooledRemaining: number | undefined = undefined;
  if (input.plan === "agency") {
    const pooledUsed = input.agencyPooledSendsToday ?? 0;
    agencyPooledRemaining = Math.max(0, ceiling - pooledUsed);
    if (pooledUsed >= ceiling) {
      pause.push(`Daily account cap reached — ${pooledUsed.toLocaleString()} / ${ceiling.toLocaleString()} sends today across client workspaces.`);
      safeAllowance = 0;
    } else if (agencyPooledRemaining < safeAllowance) {
      adjustments.push({
        factor: agencyPooledRemaining / Math.max(safeAllowance, 1),
        reason: `Account-wide daily allowance: ${agencyPooledRemaining.toLocaleString()} sends left today.`,
      });
      safeAllowance = agencyPooledRemaining;
    }
  }

  const usedAndScheduled = input.sendsUsedToday + input.sendsScheduledToday;
  const remainingToday = Math.max(0, safeAllowance - usedAndScheduled);
  if (usedAndScheduled >= safeAllowance && safeAllowance > 0) {
    pause.push("Daily safe cap reached.");
  }

  const rec = remainingToday <= 0 ? 0 : Math.max(Math.min(10, remainingToday), Math.floor(remainingToday * 0.6));

  return {
    planCeiling: ceiling,
    safeAllowance,
    recommendedToday: rec,
    remainingToday,
    adjustments,
    pauseReasons: pause,
    health,
    excluded: {
      risky: input.vault.risky,
      blocked: (input.vault.blocked || 0) + (input.vault.suppressed || 0),
      review: input.vault.needs_review,
    },
    reviewShare,
    agencyPooledSendsToday: input.plan === "agency" ? (input.agencyPooledSendsToday ?? 0) : undefined,
    agencyPooledRemaining,
  };
}

/* --------------- 5. Risky override caps --------------- */

export const RISKY_OVERRIDE_MAX_PER_BATCH = 25;
export const RISKY_OVERRIDE_MAX_SHARE = 0.1;

export function maxRiskyOverride(batchSize: number) {
  return Math.min(RISKY_OVERRIDE_MAX_PER_BATCH, Math.floor(batchSize * RISKY_OVERRIDE_MAX_SHARE));
}

/* --------------- 6. Default sender state for users without a connection --------------- */

export const DEFAULT_SENDER_STATE: SenderState = {
  connected: false,
  domain_authenticated: false,
  reconnect_required: false,
  newly_connected: false,
  last_send_at: null,
  bounce_rate: 0,
  unsubscribe_rate: 0,
};
