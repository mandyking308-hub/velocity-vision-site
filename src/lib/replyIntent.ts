// Reply Intent Command Centre — deterministic grouping helpers.
//
// These sit on top of lib/replyTriage. They never send, suppress or progress
// anything; they only resolve, count and filter intents so the operator can
// see the whole reply picture in one place.

import { classifyReply, REPLY_CATEGORIES, REPLY_CATEGORY_ORDER, type ReplyCategory } from "@/lib/replyTriage";

export interface IntentLead {
  id: string;
  reply_category?: string | null;
  reply_snippet?: string | null;
  reply_triaged_at?: string | null;
}

/** Categories that must never be treated as sales opportunities. */
export const COMPLIANCE_CATEGORIES: ReplyCategory[] = ["unsubscribe", "bounce"];

/** Shown first: compliance obligations, then genuine opportunity. */
export const URGENT_CATEGORIES: ReplyCategory[] = ["unsubscribe", "bounce", "interested"];

export function isValidCategory(value: unknown): value is ReplyCategory {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(REPLY_CATEGORIES, value);
}

/**
 * Deterministic compliance signal read from the reply text itself.
 *
 * An explicit opt-out outranks everything, including a hard bounce. These
 * signals can never be downgraded by a stored or manual sales label.
 */
export function deterministicCompliance(snippet?: string | null): "unsubscribe" | "bounce" | null {
  const c = classifyReply(snippet).category;
  return c === "unsubscribe" || c === "bounce" ? c : null;
}

/**
 * Resolve the intent for a lead.
 *
 * Compliance first: if the reply text deterministically says "unsubscribe",
 * that wins over any stored/manual category. A hard bounce wins over any
 * stored non-compliance category, but a stored `unsubscribe` still outranks it.
 * Only when there is no deterministic compliance signal does a stored human
 * classification win, so a genuine manual override is never silently reverted.
 */
export function resolveIntent(lead: IntentLead): ReplyCategory {
  const compliance = deterministicCompliance(lead.reply_snippet);
  if (compliance === "unsubscribe") return "unsubscribe";
  const stored = isValidCategory(lead.reply_category) ? lead.reply_category : null;
  if (compliance === "bounce") return stored === "unsubscribe" ? "unsubscribe" : "bounce";
  if (stored) return stored;
  return classifyReply(lead.reply_snippet).category;
}

/**
 * Categories a person may choose for this reply.
 *
 * - Deterministic opt-out: locked to `unsubscribe`. It may never be downgraded,
 *   not even to `bounce`.
 * - Deterministic hard bounce: may stay `bounce` or be corrected upward to
 *   `unsubscribe`. Never a sales label.
 * - Otherwise: any category.
 */
export function allowedOverrideCategories(lead: IntentLead): ReplyCategory[] {
  const compliance = deterministicCompliance(lead.reply_snippet);
  if (compliance === "unsubscribe") return ["unsubscribe"];
  if (compliance === "bounce") return ["bounce", "unsubscribe"];
  return [...REPLY_CATEGORY_ORDER];
}

/** True when `next` is a permitted classification for this reply. */
export function isOverrideAllowed(lead: IntentLead, next: ReplyCategory): boolean {
  return allowedOverrideCategories(lead).includes(next);
}


export function summariseIntents(leads: IntentLead[]): Record<ReplyCategory, number> {
  const out = Object.fromEntries(REPLY_CATEGORY_ORDER.map((c) => [c, 0])) as Record<ReplyCategory, number>;
  for (const l of leads) out[resolveIntent(l)] += 1;
  return out;
}

export function filterByIntent<T extends IntentLead>(leads: T[], category: ReplyCategory | "all"): T[] {
  if (category === "all") return leads;
  return leads.filter((l) => resolveIntent(l) === category);
}

/** Compliance items first, then opportunity, then everything else. */
export function sortByUrgency<T extends IntentLead>(leads: T[]): T[] {
  const rank = (l: T) => {
    const i = URGENT_CATEGORIES.indexOf(resolveIntent(l));
    return i === -1 ? URGENT_CATEGORIES.length : i;
  };
  return [...leads].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    // Untriaged before already-handled, so nothing sits unread.
    return (a.reply_triaged_at ? 1 : 0) - (b.reply_triaged_at ? 1 : 0);
  });
}

export function urgentCount(counts: Record<ReplyCategory, number>): number {
  return URGENT_CATEGORIES.reduce((n, c) => n + (counts[c] || 0), 0);
}

export function nextActionFor(category: ReplyCategory): string {
  return REPLY_CATEGORIES[category].suggestedAction;
}

/* ------------------------------------------------------------------ */
/* Intent groups — coarse filters above the per-category chips.        */
/* ------------------------------------------------------------------ */

export type IntentGroup = "compliance" | "opportunity" | "needs_you" | "no_action";

export const INTENT_GROUPS: Record<IntentGroup, { label: string; description: string; categories: ReplyCategory[] }> = {
  compliance: {
    label: "Compliance",
    description: "Opt-outs and delivery failures. Handle these before anything else.",
    categories: ["unsubscribe", "bounce"],
  },
  opportunity: {
    label: "Opportunity",
    description: "Positive intent worth a personal reply today.",
    categories: ["interested", "referral"],
  },
  needs_you: {
    label: "Needs you",
    description: "A person must decide — questions, wrong contact, or unclear replies.",
    categories: ["question", "wrong_person", "uncategorised"],
  },
  no_action: {
    label: "No action now",
    description: "Timing or disinterest. Snooze or leave them alone.",
    categories: ["not_now", "negative", "auto_reply"],
  },
};

export const INTENT_GROUP_ORDER: IntentGroup[] = ["compliance", "opportunity", "needs_you", "no_action"];

export function groupOf(category: ReplyCategory): IntentGroup {
  for (const g of INTENT_GROUP_ORDER) {
    if (INTENT_GROUPS[g].categories.includes(category)) return g;
  }
  return "needs_you";
}

export function summariseGroups(leads: IntentLead[]): Record<IntentGroup, number> {
  const out = Object.fromEntries(INTENT_GROUP_ORDER.map((g) => [g, 0])) as Record<IntentGroup, number>;
  for (const l of leads) out[groupOf(resolveIntent(l))] += 1;
  return out;
}

export function filterByGroup<T extends IntentLead>(leads: T[], group: IntentGroup | "all"): T[] {
  if (group === "all") return leads;
  return leads.filter((l) => groupOf(resolveIntent(l)) === group);
}

/** Replies that have never been reviewed by a person. */
export function untriagedCount(leads: IntentLead[]): number {
  return leads.filter((l) => !l.reply_triaged_at).length;
}

/* ------------------------------------------------------------------ */
/* Manual override audit trail                                         */
/* ------------------------------------------------------------------ */

export interface OverrideAudit {
  /** True when a human classification differs from what the classifier says. */
  overridden: boolean;
  stored: ReplyCategory | null;
  suggested: ReplyCategory;
  triagedAt: string | null;
}

/**
 * Describes whether the stored category is a human override of the automatic
 * classification. Pure — the caller decides how to render or persist it.
 */
export function describeOverride(lead: IntentLead): OverrideAudit {
  const suggested = classifyReply(lead.reply_snippet).category;
  const stored = isValidCategory(lead.reply_category) ? lead.reply_category : null;
  return {
    overridden: stored !== null && stored !== suggested,
    stored,
    suggested,
    triagedAt: lead.reply_triaged_at ?? null,
  };
}

/** Audit-log payload for a manual reclassification. Never sends anything. */
export function buildOverrideAuditDetails(
  lead: IntentLead,
  next: ReplyCategory,
): { from: ReplyCategory | null; to: ReplyCategory; suggested: ReplyCategory; manual: true } {
  const { stored, suggested } = describeOverride(lead);
  return { from: stored, to: next, suggested, manual: true };
}

