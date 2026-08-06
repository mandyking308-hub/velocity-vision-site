// Outcome funnel — truthful, stored-data-only reporting.
//
// Every stage counts real rows. Nothing is modelled, extrapolated or
// benchmarked. Where a stage has no supporting data it reads zero rather than
// guessing.
//
// NOTE ON A/B TESTING: variant breakdown below only reads variant/source data
// that already exists on stored rows. Controlled live A/B delivery is
// deliberately POST-LAUNCH: assigning variants at dispatch time would require
// changing the sending engine, which is not an acceptable launch-night risk.

import { resolveIntent, type IntentLead } from "@/lib/replyIntent";

export interface FunnelLead extends IntentLead {
  campaign_id?: string | null;
  source?: string | null;
  created_at?: string | null;
  replied_at?: string | null;
  last_email_sent_at?: string | null;
  last_contacted_at?: string | null;
  meeting_booked_at?: string | null;
  opportunity_id?: string | null;
  status?: string | null;
}

export interface FunnelOpportunity {
  id: string;
  source_lead_id?: string | null;
  source_campaign_id?: string | null;
  stage?: string | null;
  created_at?: string | null;
}

export interface FunnelStage {
  key: "contacted" | "replied" | "interested" | "meeting" | "opportunity" | "won";
  label: string;
  count: number;
  /** Percentage of the previous stage. Zero-safe. */
  rateFromPrev: number;
  /** Percentage of the first (contacted) stage. Zero-safe. */
  rateFromTop: number;
  denominatorLabel: string;
}

export interface FunnelFilters {
  campaignId?: string | "all";
  /** Inclusive ISO date bounds applied to the lead's reference timestamp. */
  from?: string | null;
  to?: string | null;
}

function pct(n: number, d: number): number {
  if (!d || d <= 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function refTime(l: FunnelLead): number | null {
  const raw = l.last_email_sent_at || l.last_contacted_at || l.created_at;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? null : t;
}

export function filterLeads(leads: FunnelLead[], f: FunnelFilters = {}): FunnelLead[] {
  const from = f.from ? new Date(`${f.from}T00:00:00Z`).getTime() : null;
  const to = f.to ? new Date(`${f.to}T23:59:59Z`).getTime() : null;
  return leads.filter((l) => {
    if (f.campaignId && f.campaignId !== "all" && l.campaign_id !== f.campaignId) return false;
    if (from === null && to === null) return true;
    const t = refTime(l);
    if (t === null) return false;
    if (from !== null && t < from) return false;
    if (to !== null && t > to) return false;
    return true;
  });
}

export function computeFunnel(
  leads: FunnelLead[],
  opportunities: FunnelOpportunity[] = [],
  filters: FunnelFilters = {},
): FunnelStage[] {
  const rows = filterLeads(leads, filters);
  const ids = new Set(rows.map((l) => l.id));

  const contacted = rows.filter((l) => Boolean(l.last_email_sent_at || l.last_contacted_at)).length;
  const replied = rows.filter((l) => Boolean(l.replied_at || l.reply_category)).length;
  const interested = rows.filter((l) => {
    const i = resolveIntent(l);
    return i === "interested" || i === "referral";
  }).length;
  const meeting = rows.filter((l) => Boolean(l.meeting_booked_at)).length;

  const relevantOpps = opportunities.filter(
    (o) => !o.source_lead_id || ids.has(o.source_lead_id),
  );
  const oppFromLeads = rows.filter((l) => Boolean(l.opportunity_id)).length;
  const opportunity = Math.max(oppFromLeads, relevantOpps.length);
  const won =
    relevantOpps.filter((o) => (o.stage || "").toLowerCase() === "won").length +
    rows.filter((l) => l.status === "closed_won").length;

  const raw: { key: FunnelStage["key"]; label: string; count: number; denominatorLabel: string }[] = [
    { key: "contacted", label: "Contacted", count: contacted, denominatorLabel: "leads with a recorded send" },
    { key: "replied", label: "Replied", count: replied, denominatorLabel: "of contacted" },
    { key: "interested", label: "Interested / referral", count: interested, denominatorLabel: "of replied" },
    { key: "meeting", label: "Meeting booked", count: meeting, denominatorLabel: "of interested / referral" },
    { key: "opportunity", label: "Opportunity", count: opportunity, denominatorLabel: "of meetings booked" },
    { key: "won", label: "Won", count: won, denominatorLabel: "of opportunities" },
  ];

  const top = raw[0].count;
  return raw.map((s, i) => ({
    ...s,
    rateFromPrev: i === 0 ? 100 : pct(s.count, raw[i - 1].count),
    rateFromTop: pct(s.count, top),
  }));
}

export interface SourceBreakdownRow {
  source: string;
  leads: number;
  replies: number;
  meetings: number;
  replyRate: number;
}

/**
 * Breakdown by the `source` value already stored on leads. Returns an empty
 * array when the data does not distinguish sources — we do not invent one.
 */
export function sourceBreakdown(leads: FunnelLead[], filters: FunnelFilters = {}): SourceBreakdownRow[] {
  const rows = filterLeads(leads, filters);
  const map = new Map<string, SourceBreakdownRow>();
  for (const l of rows) {
    const source = (l.source || "").trim();
    if (!source) continue;
    const cur = map.get(source) || { source, leads: 0, replies: 0, meetings: 0, replyRate: 0 };
    cur.leads += 1;
    if (l.replied_at || l.reply_category) cur.replies += 1;
    if (l.meeting_booked_at) cur.meetings += 1;
    map.set(source, cur);
  }
  const out = [...map.values()].map((r) => ({ ...r, replyRate: pct(r.replies, r.leads) }));
  return out.length > 1 ? out.sort((a, b) => b.leads - a.leads) : [];
}
