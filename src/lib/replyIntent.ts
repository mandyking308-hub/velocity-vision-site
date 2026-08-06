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
 * Stored human/previous classification always wins over the classifier, so a
 * manual override is never silently reverted on reload.
 */
export function resolveIntent(lead: IntentLead): ReplyCategory {
  if (isValidCategory(lead.reply_category)) return lead.reply_category;
  return classifyReply(lead.reply_snippet).category;
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
