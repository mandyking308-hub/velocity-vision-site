/**
 * Follow-up + temperature derivation for leads.
 * Keeps the rules simple and explainable.
 */

export type FollowUpState =
  | "none"
  | "due"
  | "overdue"
  | "replied"
  | "warm"
  | "dormant"
  | "bounced"
  | "suppressed"
  | "snoozed"
  | "in_pipeline"
  | "won"
  | "lost";

export type Temperature = "hot" | "warm" | "cold" | "dormant";

export interface LeadLike {
  status?: string | null;
  follow_up_at?: string | null;
  follow_up_state?: FollowUpState | null;
  replied_at?: string | null;
  snoozed_until?: string | null;
  last_email_sent_at?: string | null;
  last_contacted_at?: string | null;
  last_interaction_at?: string | null;
  opportunity_id?: string | null;
  blocked?: boolean | null;
  suppressed?: boolean | null;
}

const DAY = 86_400_000;
export const DORMANT_DAYS = 30;
export const WARM_DAYS = 7;

export function deriveFollowUpState(l: LeadLike): FollowUpState {
  // Sticky terminal states win
  if (l.status === "closed_won") return "won";
  if (l.status === "closed_lost") return "lost";
  if (l.opportunity_id) return "in_pipeline";
  if (l.suppressed) return "suppressed";
  if (l.blocked) return "bounced";

  const now = Date.now();
  if (l.snoozed_until && new Date(l.snoozed_until).getTime() > now) return "snoozed";
  if (l.replied_at) {
    if (now - new Date(l.replied_at).getTime() < WARM_DAYS * DAY) return "replied";
  }

  if (l.follow_up_at) {
    const t = new Date(l.follow_up_at).getTime();
    if (t < now) return "overdue";
    if (t - now < DAY) return "due";
  }

  const lastInter =
    l.last_interaction_at || l.replied_at || l.last_contacted_at || l.last_email_sent_at;
  if (lastInter) {
    const age = now - new Date(lastInter).getTime();
    if (age < WARM_DAYS * DAY) return "warm";
    if (age > DORMANT_DAYS * DAY) return "dormant";
  }

  return l.follow_up_state || "none";
}

export function deriveTemperature(l: LeadLike): Temperature {
  const s = deriveFollowUpState(l);
  if (s === "replied" || s === "warm" || s === "in_pipeline" || s === "won") return "hot";
  if (s === "due" || s === "overdue") return "warm";
  if (s === "dormant" || s === "lost" || s === "bounced" || s === "suppressed") return "dormant";
  return "cold";
}

export const STATE_LABEL: Record<FollowUpState, string> = {
  none: "No action yet",
  due: "Due today",
  overdue: "Overdue",
  replied: "Replied",
  warm: "Warm",
  dormant: "Dormant",
  bounced: "Bounced",
  suppressed: "Suppressed",
  snoozed: "Snoozed",
  in_pipeline: "In pipeline",
  won: "Won",
  lost: "Lost",
};

export const STATE_TONE: Record<FollowUpState, string> = {
  none: "bg-muted text-foreground",
  due: "bg-primary/15 text-primary",
  overdue: "bg-rose-100 text-rose-700",
  replied: "bg-emerald-100 text-emerald-700",
  warm: "bg-amber-100 text-amber-700",
  dormant: "bg-slate-200 text-slate-700",
  bounced: "bg-rose-100 text-rose-700",
  suppressed: "bg-slate-200 text-slate-700",
  snoozed: "bg-blue-100 text-blue-700",
  in_pipeline: "bg-indigo-100 text-indigo-700",
  won: "bg-emerald-200 text-emerald-800",
  lost: "bg-slate-200 text-slate-700",
};

export const TEMP_TONE: Record<Temperature, string> = {
  hot: "bg-rose-100 text-rose-700",
  warm: "bg-amber-100 text-amber-700",
  cold: "bg-slate-100 text-slate-600",
  dormant: "bg-slate-200 text-slate-700",
};

export function bucketCounts(leads: LeadLike[]) {
  const b: Record<FollowUpState, number> = {
    none: 0, due: 0, overdue: 0, replied: 0, warm: 0, dormant: 0,
    bounced: 0, suppressed: 0, snoozed: 0, in_pipeline: 0, won: 0, lost: 0,
  };
  leads.forEach((l) => { b[deriveFollowUpState(l)]++; });
  return b;
}
