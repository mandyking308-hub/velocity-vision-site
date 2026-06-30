// Send Safety Engine — central governance for safe outreach activation.
// Founder-editable defaults. All numbers are intentionally configurable here.

import type { PlanId } from "./credits";

/* --------------- 1. Plan-tier daily ceilings --------------- */

export const PLAN_DAILY_CEILING: Record<PlanId, number> = {
  starter: 80,
  growth: 250,
  agency: 1000, // pooled across workspaces
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
  | "safe"            // ready to activate
  | "review"          // gate behind manual review
  | "excluded_risky"  // off by default, can override
  | "excluded";       // never sendable

export const ACTIVATION_LABELS: Record<ActivationClass, string> = {
  safe: "Safe to activate",
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
  domain_authenticated: boolean;        // SPF + DKIM
  reconnect_required: boolean;
  newly_connected: boolean;             // < 7 days
  last_send_at: string | null;
  bounce_rate: number;                  // 0..1
  unsubscribe_rate: number;             // 0..1
  complaint_rate?: number;              // optional
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
  factor: number;   // multiplier 0..1
  reason: string;   // plain-English
}

export interface SafetyInput {
  plan: PlanId;
  vault: VaultBreakdown;
  sender: SenderState;
  sendsUsedToday: number;
  sendsScheduledToday: number;
  sendCreditsRemaining: number;
  /** Agency only: total sends today pooled across all child workspaces. */
  agencyPooledSendsToday?: number;
}

export interface SafetyResult {
  planCeiling: number;
  safeAllowance: number;        // after adjustments and credits cap
  recommendedToday: number;     // conservative starting point
  remainingToday: number;       // safeAllowance - used - scheduled (>=0)
  adjustments: SafetyAdjustment[];
  pauseReasons: string[];       // if non-empty, sending is paused
  health: SenderHealth;
  excluded: { risky: number; blocked: number; review: number };
  reviewShare: number;          // share of audience flagged as review
  /** Agency only: pooled sends today across the whole workspace. */
  agencyPooledSendsToday?: number;
  /** Agency only: pooled remaining capacity across the whole workspace. */
  agencyPooledRemaining?: number;
}

export function computeSafety(input: SafetyInput): SafetyResult {
  const ceiling = PLAN_DAILY_CEILING[input.plan] ?? 80;
  const adjustments: SafetyAdjustment[] = [];
  const pause: string[] = [];
  let factor = 1;

  const totalAudience = input.vault.valid + input.vault.needs_review + input.vault.risky;
  const reviewShare = totalAudience > 0 ? input.vault.needs_review / totalAudience : 0;
  const health = senderHealth(input.sender);

  // Adjustments
  if (!input.sender.connected) {
    pause.push("No sender mailbox is connected.");
    factor = 0;
  }
  if (input.sender.reconnect_required) {
    pause.push("Sender requires reconnection.");
    factor = 0;
  }
  if (!input.sender.domain_authenticated && input.sender.connected) {
    adjustments.push({ factor: 0.5, reason: "Sender domain is not authenticated (SPF / DKIM missing)." });
    factor *= 0.5;
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
  if (input.sendCreditsRemaining <= 0) {
    pause.push("Send credits exhausted.");
    factor = 0;
  }

  const adjusted = Math.floor(ceiling * factor);
  const safeAllowance = Math.max(0, Math.min(adjusted, input.sendCreditsRemaining, input.vault.valid));
  const usedAndScheduled = input.sendsUsedToday + input.sendsScheduledToday;
  const remainingToday = Math.max(0, safeAllowance - usedAndScheduled);
  if (usedAndScheduled >= safeAllowance && safeAllowance > 0) {
    pause.push("Daily safe cap reached.");
  }

  // Conservative recommendation: ~60% of remaining, min 10, capped by remaining
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
  };
}

/* --------------- 5. Risky override caps --------------- */

export const RISKY_OVERRIDE_MAX_PER_BATCH = 25;
export const RISKY_OVERRIDE_MAX_SHARE = 0.1; // <= 10% of batch

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
