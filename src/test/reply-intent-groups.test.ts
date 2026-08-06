import { describe, it, expect } from "vitest";
import {
  INTENT_GROUPS,
  INTENT_GROUP_ORDER,
  buildOverrideAuditDetails,
  describeOverride,
  filterByGroup,
  groupOf,
  summariseGroups,
  untriagedCount,
} from "@/lib/replyIntent";
import { REPLY_CATEGORY_ORDER } from "@/lib/replyTriage";

const leads = [
  { id: "1", reply_snippet: "Please remove me from this list" }, // unsubscribe
  { id: "2", reply_snippet: "Sounds great, happy to chat next week" }, // interested
  { id: "3", reply_snippet: "Who is the right person for this?", reply_triaged_at: "2026-01-01T00:00:00Z" },
  { id: "4", reply_category: "not_now", reply_snippet: "Sounds great", reply_triaged_at: "2026-01-02T00:00:00Z" },
];

describe("intent groups", () => {
  it("covers every reply category exactly once", () => {
    const all = INTENT_GROUP_ORDER.flatMap((g) => INTENT_GROUPS[g].categories);
    expect([...all].sort()).toEqual([...REPLY_CATEGORY_ORDER].sort());
    expect(new Set(all).size).toBe(all.length);
  });

  it("treats unsubscribes and bounces as compliance", () => {
    expect(groupOf("unsubscribe")).toBe("compliance");
    expect(groupOf("bounce")).toBe("compliance");
    expect(groupOf("interested")).toBe("opportunity");
  });

  it("counts and filters by group consistently", () => {
    const counts = summariseGroups(leads);
    expect(counts.compliance).toBe(1);
    expect(counts.opportunity).toBe(1);
    expect(filterByGroup(leads, "compliance").map((l) => l.id)).toEqual(["1"]);
    expect(filterByGroup(leads, "all")).toHaveLength(4);
    const total = INTENT_GROUP_ORDER.reduce((n, g) => n + counts[g], 0);
    expect(total).toBe(leads.length);
  });

  it("counts replies no human has reviewed", () => {
    expect(untriagedCount(leads)).toBe(2);
  });
});

describe("manual override audit trail", () => {
  it("flags a stored category that disagrees with the classifier", () => {
    const audit = describeOverride(leads[3]);
    expect(audit.overridden).toBe(true);
    expect(audit.stored).toBe("not_now");
    expect(audit.suggested).toBe("interested");
    expect(audit.triagedAt).toBe("2026-01-02T00:00:00Z");
  });

  it("does not flag an untouched reply as overridden", () => {
    expect(describeOverride(leads[0]).overridden).toBe(false);
  });

  it("builds an audit payload recording from, to and the automatic suggestion", () => {
    expect(buildOverrideAuditDetails(leads[3], "unsubscribe")).toEqual({
      from: "not_now",
      to: "unsubscribe",
      suggested: "interested",
      manual: true,
    });
  });
});
