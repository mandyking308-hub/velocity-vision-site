import { describe, it, expect } from "vitest";
import { extractReferral, extractReturnDate, describeReturnDate } from "@/lib/replyReferral";
import { validateBookingUrl } from "@/lib/bookingUrl";
import { isWaitingForFollowUp, applyQueueFilter, queueFilterCounts, isMeetingBooked } from "@/lib/replySla";
import { computeFunnel } from "@/lib/outcomeFunnel";
import { classifyReply, resolveCategory } from "@/lib/replyTriage";

const HOUR = 3600_000;
const now = new Date("2026-03-10T12:00:00Z");
const ago = (h: number) => new Date(now.getTime() - h * HOUR).toISOString();

describe("referral detection", () => {
  it("extracts a named referral with an address", () => {
    const r = extractReferral("Not me — please speak to Dana Fox, dana.fox@acme.com, she owns this.");
    expect(r.hasReferral).toBe(true);
    expect(r.name).toBe("Dana Fox");
    expect(r.email).toBe("dana.fox@acme.com");
  });

  it("does not invent details for a vague redirect", () => {
    const r = extractReferral("You'd need to talk to our ops team about that.");
    expect(r.name).toBeNull();
    expect(r.email).toBeNull();
  });

  it("classifies a named referral as referral, not wrong person", () => {
    const c = classifyReply("I'm not the right person, the right person is Sam Reed (sam@acme.com).");
    expect(c.category).toBe("referral");
  });

  it("keeps a vague wrong-person reply out of the referral category", () => {
    const c = classifyReply("I'm not the right person for this.");
    expect(c.category).toBe("wrong_person");
  });
});

describe("out-of-office return date", () => {
  it("extracts a clearly stated return date", () => {
    expect(extractReturnDate("I am out of office and will return on 18 March 2026.", now)).toBe("2026-03-18");
  });
  it("returns null when no date is stated", () => {
    expect(extractReturnDate("I am currently away with limited access.", now)).toBeNull();
  });
  it("describes the follow-up neutrally", () => {
    expect(describeReturnDate("2026-03-18")).toMatch(/Follow up on\/after 2026-03-18/);
  });
});

describe("manual override precedence", () => {
  it("stored human classification wins over deterministic reads", () => {
    const resolved = resolveCategory({
      reply_category: "interested",
      reply_triaged_at: ago(1),
      reply_snippet: "please remove me",
    } as any);
    expect(resolved.category).toBe("interested");
    expect(resolved.isOverride).toBe(true);
  });
});

describe("booking URL validation", () => {
  it("accepts https", () => {
    expect(validateBookingUrl("https://cal.com/x/30min").valid).toBe(true);
  });
  it("rejects http, javascript and junk", () => {
    expect(validateBookingUrl("http://cal.com/x").valid).toBe(false);
    expect(validateBookingUrl("javascript:alert(1)").valid).toBe(false);
    expect(validateBookingUrl("not a url").valid).toBe(false);
  });
});

describe("stale reply SLA", () => {
  const stale = { id: "1", reply_category: "interested", reply_triaged_at: null, replied_at: ago(30) } as any;
  const fresh = { id: "2", reply_category: "interested", reply_triaged_at: null, replied_at: ago(2) } as any;
  const handled = { id: "3", reply_category: "interested", reply_triaged_at: ago(1), replied_at: ago(30) } as any;
  const unsub = { id: "4", reply_category: "unsubscribe", reply_triaged_at: null, replied_at: ago(30) } as any;
  const booked = { id: "5", reply_category: "interested", replied_at: ago(30), meeting_booked_at: ago(1) } as any;
  const referral = { id: "6", reply_category: "referral", replied_at: ago(30), reply_triaged_at: null } as any;

  it("flags actionable replies untouched for 24h+", () => {
    expect(isWaitingForFollowUp(stale, now)).toBe(true);
    expect(isWaitingForFollowUp(fresh, now)).toBe(false);
    expect(isWaitingForFollowUp(handled, now)).toBe(false);
  });

  it("never treats compliance categories as opportunities", () => {
    expect(isWaitingForFollowUp(unsub, now)).toBe(false);
    expect(applyQueueFilter([unsub], "waiting_24h")).toHaveLength(0);
    expect(applyQueueFilter([unsub], "unhandled")).toHaveLength(0);
  });

  it("filters and counts queues", () => {
    const all = [stale, fresh, handled, unsub, booked, referral];
    expect(isMeetingBooked(booked)).toBe(true);
    expect(applyQueueFilter(all, "meeting_booked").map((l) => l.id)).toEqual(["5"]);
    expect(applyQueueFilter(all, "referral").map((l) => l.id)).toEqual(["6"]);
    const counts = queueFilterCounts(all, now);
    expect(counts.all).toBe(6);
    expect(counts.meeting_booked).toBe(1);
    expect(counts.waiting_24h).toBeGreaterThanOrEqual(2);
  });
});

describe("outcome funnel", () => {
  it("is zero-safe with no data", () => {
    const stages = computeFunnel([], []);
    expect(stages.every((s) => s.count === 0)).toBe(true);
    expect(stages.every((s) => Number.isFinite(s.rateFromPrev))).toBe(true);
  });

  it("counts only stored events", () => {
    const leads = [
      { id: "a", last_email_sent_at: ago(90), replied_at: ago(50), reply_category: "interested", meeting_booked_at: ago(10), opportunity_id: "o1" },
      { id: "b", last_email_sent_at: ago(90), replied_at: ago(40), reply_category: "not_interested" },
      { id: "c", last_email_sent_at: ago(90) },
    ] as any;
    const opps = [{ id: "o1", stage: "won" }] as any;
    const stages = computeFunnel(leads, opps);
    const by = Object.fromEntries(stages.map((s) => [s.key, s.count]));
    expect(by.contacted).toBe(3);
    expect(by.replied).toBe(2);
    expect(by.interested).toBe(1);
    expect(by.meeting_booked).toBe(1);
  });
});
