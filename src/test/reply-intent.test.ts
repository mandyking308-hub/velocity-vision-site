import { describe, it, expect } from "vitest";
import {
  COMPLIANCE_CATEGORIES,
  URGENT_CATEGORIES,
  filterByIntent,
  isValidCategory,
  nextActionFor,
  resolveIntent,
  sortByUrgency,
  summariseIntents,
  urgentCount,
} from "@/lib/replyIntent";

describe("reply intent resolution", () => {
  it("a stored sales label never suppresses a deterministic opt-out", () => {
    const lead = { id: "1", reply_category: "not_now", reply_snippet: "Please unsubscribe me" };
    expect(resolveIntent(lead)).toBe("unsubscribe");
  });

  it("prefers a stored (manually overridden) category for an ordinary reply", () => {
    const lead = { id: "1", reply_category: "not_now", reply_snippet: "Can you tell me more?" };
    expect(resolveIntent(lead)).toBe("not_now");
  });

  it("falls back to the classifier when no category is stored", () => {
    expect(resolveIntent({ id: "2", reply_snippet: "Please remove me from this list" })).toBe("unsubscribe");
  });

  it("ignores an invalid stored category rather than trusting it", () => {
    expect(isValidCategory("nonsense")).toBe(false);
    expect(resolveIntent({ id: "3", reply_category: "nonsense", reply_snippet: "Sounds great, happy to chat" }))
      .toBe("interested");
  });

  it("returns needs-a-human for empty replies instead of guessing", () => {
    expect(resolveIntent({ id: "4", reply_snippet: null })).toBe("uncategorised");
  });
});

describe("counts, filtering and urgency", () => {
  const leads = [
    { id: "a", reply_category: "interested" },
    { id: "b", reply_category: "unsubscribe" },
    { id: "c", reply_category: "bounce" },
    { id: "d", reply_category: "question" },
    { id: "e", reply_category: "interested", reply_triaged_at: "2026-01-01" },
  ];

  it("counts every category", () => {
    const c = summariseIntents(leads);
    expect(c.interested).toBe(2);
    expect(c.unsubscribe).toBe(1);
    expect(c.bounce).toBe(1);
    expect(c.question).toBe(1);
    expect(c.not_now).toBe(0);
  });

  it("filters to a single category and passes everything through for 'all'", () => {
    expect(filterByIntent(leads, "interested").map((l) => l.id)).toEqual(["a", "e"]);
    expect(filterByIntent(leads, "all")).toHaveLength(5);
  });

  it("sorts compliance items ahead of opportunity, untriaged first", () => {
    const order = sortByUrgency(leads).map((l) => l.id);
    expect(order.slice(0, 3)).toEqual(["b", "c", "a"]);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("e"));
  });

  it("counts urgent items across compliance and interested", () => {
    expect(urgentCount(summariseIntents(leads))).toBe(4);
  });

  it("never suggests a sales action for compliance categories", () => {
    for (const c of COMPLIANCE_CATEGORIES) {
      expect(URGENT_CATEGORIES).toContain(c);
      expect(nextActionFor(c).toLowerCase()).not.toContain("pipeline");
    }
    expect(nextActionFor("unsubscribe").toLowerCase()).toContain("suppress");
    expect(nextActionFor("bounce").toLowerCase()).toContain("stop");
  });
});
