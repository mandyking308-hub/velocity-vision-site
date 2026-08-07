import { describe, it, expect } from "vitest";
import { runPreflight, type PreflightInput } from "@/lib/campaignPreflight";
import { classifyReply, draftReply, REPLY_CATEGORIES } from "@/lib/replyTriage";

const readyInput = (over: Partial<PreflightInput> = {}): PreflightInput => ({
  campaign: {
    id: "c1",
    name: "Test",
    goal: "leads",
    brief: { cta: "Reply to arrange a short call", audience: "Ops leads", offer: "A review" },
    pack: { emails: [{ subject: "Hello", body: "Body text" }] },
    approved_at: new Date().toISOString(),
    is_sample: false,
  },
  safeContacts: 40,
  reviewContacts: 0,
  senderState: "ready_full",
  senderEmail: "me@example.com",
  remainingToday: 50,
  pauseReasons: [],
  creditsAvailable: 100,
  creditsRequired: 40,
  legalAccepted: true,
  unsubscribeReady: true,
  ...over,
});

describe("campaign preflight", () => {
  it("passes everything when the campaign is fully ready", () => {
    const r = runPreflight(readyInput());
    expect(r.canActivate).toBe(true);
    expect(r.allClear).toBe(true);
    expect(r.score).toBe(100);
  });

  it("blocks when there is no approved human sign-off", () => {
    const r = runPreflight(readyInput({ campaign: { ...readyInput().campaign!, approved_at: null } }));
    expect(r.canActivate).toBe(false);
    expect(r.blockers.map((b) => b.id)).toContain("approval");
  });

  it("blocks sample campaigns from activation", () => {
    const r = runPreflight(readyInput({ campaign: { ...readyInput().campaign!, is_sample: true } }));
    expect(r.canActivate).toBe(false);
    expect(r.blockers.map((b) => b.id)).toContain("sample");
  });

  it("blocks with no approved contacts, no sender, no allowance or no credits", () => {
    expect(runPreflight(readyInput({ safeContacts: 0 })).blockers.map((b) => b.id)).toContain("contacts");
    expect(runPreflight(readyInput({ senderState: "disconnected" })).blockers.map((b) => b.id)).toContain("sender");
    expect(runPreflight(readyInput({ remainingToday: 0 })).blockers.map((b) => b.id)).toContain("allowance");
    // Retired rule: Campaign Credits fund full campaign-pack generation only. They never gate
    // activation, which prepares leads and does not itself send.
    expect(runPreflight(readyInput({ creditsAvailable: 0 })).blockers.map((b) => b.id)).not.toContain("credits");
    expect(runPreflight(readyInput({ legalAccepted: false })).blockers.map((b) => b.id)).toContain("legal");
    expect(runPreflight(readyInput({ unsubscribeReady: false })).blockers.map((b) => b.id)).toContain("unsubscribe");
  });

  it("blocks when the safety engine has paused sending", () => {
    const r = runPreflight(readyInput({ pauseReasons: ["Bounce rate above threshold"] }));
    expect(r.canActivate).toBe(false);
    expect(r.blockers.map((b) => b.id)).toContain("paused");
  });

  it("treats warm-up and review backlog as warnings, not blockers", () => {
    const r = runPreflight(readyInput({ senderState: "ready_warmup", reviewContacts: 12 }));
    expect(r.canActivate).toBe(true);
    expect(r.warnings.map((w) => w.id)).toEqual(expect.arrayContaining(["warmup", "review_backlog"]));
  });

  it("campaign scope skips live send-capacity checks", () => {
    const r = runPreflight(readyInput({ scope: "campaign", remainingToday: 0, creditsAvailable: 0, creditsRequired: 99 }));
    const ids = r.checks.map((c) => c.id);
    expect(ids).not.toContain("allowance");
    expect(ids).not.toContain("credits");
    expect(r.canActivate).toBe(true);
  });
});

describe("reply triage classification", () => {
  it("always prioritises unsubscribe requests", () => {
    expect(classifyReply("Please remove me from your list").category).toBe("unsubscribe");
    expect(classifyReply("Unsubscribe. Do not contact me again.").category).toBe("unsubscribe");
  });

  it("detects auto-replies", () => {
    expect(classifyReply("I am out of the office until Monday.").category).toBe("auto_reply");
  });

  it("detects interest, questions, timing and wrong-person replies", () => {
    expect(classifyReply("This sounds interesting, happy to chat next week").category).toBe("interested");
    expect(classifyReply("How does the pricing work?").category).toBe("question");
    expect(classifyReply("Not right now, please circle back next quarter").category).toBe("not_now");
    expect(classifyReply("Wrong person — you should speak to our ops lead").category).toBe("wrong_person");
    expect(classifyReply("Not interested, we're already sorted").category).toBe("negative");
  });

  it("falls back to a human when it cannot classify", () => {
    expect(classifyReply("").category).toBe("uncategorised");
    expect(classifyReply("ok").category).toBe("uncategorised");
  });

  it("suppression is the suggested action for unsubscribes", () => {
    const c = classifyReply("please opt out").category;
    expect(REPLY_CATEGORIES[c].actionKey).toBe("suppress");
  });

  it("drafts are editable text with no auto-send and no invented promises", () => {
    const d = draftReply("interested", { firstName: "Priya", senderName: "Sam" });
    expect(d).toContain("Priya");
    expect(d).toContain("Sam");
    expect(d.toLowerCase()).not.toContain("guaranteed");
    expect(draftReply("auto_reply")).toBe("");
  });
});
