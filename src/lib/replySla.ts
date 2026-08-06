// Hot reply SLA / follow-up protection.
//
// Truthful, timestamp-driven. No fake urgency: a reply is only "waiting for
// follow-up" when a person genuinely has not acted on it. Compliance
// categories (unsubscribe, bounce) and out-of-office are never treated as
// sales opportunities.

import { resolveIntent, type IntentLead } from "@/lib/replyIntent";
import type { ReplyCategory } from "@/lib/replyTriage";

/** Hours of no human action before a reply is surfaced as waiting. */
export const FOLLOW_UP_SLA_HOURS = 24;

/** Reply intents that a person is expected to follow up on. */
export const ACTIONABLE_CATEGORIES: ReplyCategory[] = ["interested", "question", "referral"];

export interface SlaLead extends IntentLead {
  replied_at?: string | null;
  meeting_booked_at?: string | null;
  last_interaction_at?: string | null;
}

function ts(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

/** True when the reply has been acted on by a person in some way. */
export function isHandled(lead: SlaLead): boolean {
  return Boolean(lead.meeting_booked_at || lead.reply_triaged_at);
}

export function isMeetingBooked(lead: SlaLead): boolean {
  return Boolean(ts(lead.meeting_booked_at));
}

export function isActionable(lead: SlaLead): boolean {
  return ACTIONABLE_CATEGORIES.includes(resolveIntent(lead));
}

/** Hours since the reply arrived. Null when no reply timestamp exists. */
export function hoursSinceReply(lead: SlaLead, now: Date = new Date()): number | null {
  const t = ts(lead.replied_at);
  if (t === null) return null;
  return (now.getTime() - t) / 3600000;
}

/**
 * A reply an operator should look at: actionable intent, no meeting booked,
 * not triaged, and older than the SLA window.
 */
export function isWaitingForFollowUp(lead: SlaLead, now: Date = new Date()): boolean {
  if (!isActionable(lead)) return false;
  if (isHandled(lead)) return false;
  const hours = hoursSinceReply(lead, now);
  return hours !== null && hours >= FOLLOW_UP_SLA_HOURS;
}

/** Neutral wording — never manufactured urgency. */
export function describeWait(lead: SlaLead, now: Date = new Date()): string {
  const hours = hoursSinceReply(lead, now);
  if (hours === null) return "No reply timestamp recorded";
  if (hours < 1) return "Replied in the last hour";
  if (hours < FOLLOW_UP_SLA_HOURS) return `Replied ${Math.floor(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return days <= 1 ? "Waiting for follow-up since yesterday" : `Waiting for follow-up for ${days} days`;
}

/* ------------------------------------------------------------------ */
/* Queue filters                                                        */
/* ------------------------------------------------------------------ */

export type QueueFilter = "all" | "unhandled" | "waiting_24h" | "meeting_booked" | "referral";

export const QUEUE_FILTERS: { id: QueueFilter; label: string }[] = [
  { id: "all", label: "All replies" },
  { id: "unhandled", label: "Unhandled" },
  { id: "waiting_24h", label: "Waiting 24h+" },
  { id: "meeting_booked", label: "Meeting booked" },
  { id: "referral", label: "Referral" },
];

export function applyQueueFilter<T extends SlaLead>(
  leads: T[],
  filter: QueueFilter,
  now: Date = new Date(),
): T[] {
  switch (filter) {
    case "unhandled":
      return leads.filter((l) => !isHandled(l));
    case "waiting_24h":
      return leads.filter((l) => isWaitingForFollowUp(l, now));
    case "meeting_booked":
      return leads.filter((l) => isMeetingBooked(l));
    case "referral":
      return leads.filter((l) => resolveIntent(l) === "referral");
    default:
      return leads;
  }
}

export function queueFilterCounts(
  leads: SlaLead[],
  now: Date = new Date(),
): Record<QueueFilter, number> {
  return {
    all: leads.length,
    unhandled: applyQueueFilter(leads, "unhandled", now).length,
    waiting_24h: applyQueueFilter(leads, "waiting_24h", now).length,
    meeting_booked: applyQueueFilter(leads, "meeting_booked", now).length,
    referral: applyQueueFilter(leads, "referral", now).length,
  };
}
