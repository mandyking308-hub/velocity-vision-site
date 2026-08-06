// Hardening tests for the capability sprint:
//  - activation must be gated by the SAME preflight verdict the UI renders
//  - bounce classification and its precedence against unsubscribe
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  runPreflight,
  activationGate,
  ACTIVATION_BLOCKER_IDS,
  type PreflightInput,
} from "@/lib/campaignPreflight";
import { classifyReply, draftReply, REPLY_CATEGORIES, REPLY_CATEGORY_ORDER } from "@/lib/replyTriage";

const READY_CAMPAIGN = {
  id: "camp-1",
  name: "Ops outreach",
  status: "draft",
  goal: "awareness",
  pack: { emails: [{ subject: "A quick question", body: "Hello {{first_name}}, ..." }] },
  brief: { cta: "Reply to arrange a call", audience: "Ops leads", offer: "Ops review" },
  approved_at: "2026-08-01T10:00:00Z",
  is_sample: false,
};

const READY_INPUT: PreflightInput = {
  campaign: READY_CAMPAIGN,
  safeContacts: 40,
  reviewContacts: 0,
  senderState: "ready_full",
  senderEmail: "founder@example.com",
  remainingToday: 50,
  pauseReasons: [],
  creditsAvailable: 100,
  creditsRequired: 40,
  legalAccepted: true,
  unsubscribeReady: true,
};

const gateFor = (patch: Partial<PreflightInput>) =>
  activationGate(runPreflight({ ...READY_INPUT, ...patch }));

describe("activation gate — execution enforcement", () => {
  it("allows a fully ready campaign through", () => {
    expect(gateFor({}).ok).toBe(true);
  });

  it("blocks a sample campaign from ever creating leads", () => {
    const g = gateFor({ campaign: { ...READY_CAMPAIGN, is_sample: true } });
    expect(g.ok).toBe(false);
    expect(g.blockerIds).toContain("sample");
  });

  it("blocks activation when human approval is missing", () => {
    const g = gateFor({ campaign: { ...READY_CAMPAIGN, approved_at: null } });
    expect(g.ok).toBe(false);
    expect(g.blockerIds).toContain("approval");
    expect(g.firstBlocker?.label).toBeTruthy();
  });

  it("blocks activation when no campaign is selected", () => {
    expect(gateFor({ campaign: null }).blockerIds).toContain("campaign");
  });

  it("blocks activation with no campaign content", () => {
    expect(gateFor({ campaign: { ...READY_CAMPAIGN, pack: null } }).blockerIds).toContain("content");
  });

  it("blocks activation with no approved contacts", () => {
    expect(gateFor({ safeContacts: 0 }).blockerIds).toContain("contacts");
  });

  it("blocks activation when legal terms are not accepted", () => {
    expect(gateFor({ legalAccepted: false }).blockerIds).toContain("legal");
  });

  it("keeps activation distinct from sending: send-only checks do not block", () => {
    // Visible in the preflight card, but activation only prepares leads.
    const sendStarved = gateFor({
      remainingToday: 0,
      creditsAvailable: 0,
      pauseReasons: ["Daily cap reached"],
      senderState: "disconnected",
    });
    expect(sendStarved.ok).toBe(true);
    // ...while still being surfaced to the user as blockers of the send.
    const result = runPreflight({ ...READY_INPUT, remainingToday: 0, senderState: "disconnected" });
    expect(result.canActivate).toBe(false);
    expect(result.blockers.map((b) => b.id)).toEqual(
      expect.arrayContaining(["allowance", "sender"]),
    );
  });

  it("reports blocker ids only, so nothing sensitive reaches the audit log", () => {
    const g = gateFor({ campaign: { ...READY_CAMPAIGN, is_sample: true, approved_at: null } });
    expect(g.blockerIds.every((id) => (ACTIVATION_BLOCKER_IDS as readonly string[]).includes(id))).toBe(true);
    expect(JSON.stringify(g.blockerIds)).not.toContain("Ops");
  });
});

describe("UI and execution cannot diverge", () => {
  const src = readFileSync("src/pages/app/AppActivation.tsx", "utf8");

  it("derives the gate from the same preflight input builder", () => {
    // One builder feeds both the rendered card and the pre-write re-check.
    expect(src).toMatch(/const buildPreflightInput\s*=/);
    expect(src.match(/buildPreflightInput\(/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("requires both the execution verdict and the gate on the activation button", () => {
    expect(src).toMatch(/const canActivate =[^;]*execVerdict\.ok/s);
    expect(src).toMatch(/const canActivate =[^;]*gate\.ok/s);
    expect(src).toMatch(/const execVerdict[\s\S]{0,120}canExecuteActivation\(/);
  });

  it("aborts before any state change or write when preflight fails", () => {
    const runBody = src.slice(src.indexOf("async function runActivation"));
    const guardIdx = runBody.indexOf("canExecuteActivation(");
    const setIdx = runBody.indexOf("setActivating(true)");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(setIdx);
  });

  it("hard-refuses a missing, sample or unapproved campaign in the execution path", () => {
    const runBody = src.slice(src.indexOf("async function runActivation"));
    const guardIdx = runBody.indexOf("const liveVerdict");
    const insertIdx = runBody.indexOf('from("leads").insert');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(insertIdx);
    expect(runBody).toContain("freshRow");
  });


  it("re-checks the gate against a freshly fetched campaign before writing leads", () => {
    const runBody = src.slice(src.indexOf("async function runActivation"));
    const gateIdx = runBody.indexOf("activationGate(");
    const insertIdx = runBody.indexOf('from("leads").insert');
    expect(gateIdx).toBeGreaterThan(-1);
    expect(insertIdx).toBeGreaterThan(-1);
    // The verdict is computed before any lead row is created.
    expect(gateIdx).toBeLessThan(insertIdx);
    expect(runBody).toContain("activation_blocked_preflight");
    expect(runBody).toContain("blocker_ids");
  });
});

describe("bounce triage", () => {
  const BOUNCES = [
    "Delivery Status Notification (Failure): your message was undeliverable.",
    "Delivery has failed to these recipients or groups.",
    "550 5.1.1 The email account that you tried to reach does not exist.",
    "Mailbox unavailable — recipient address rejected.",
    "user unknown; no such user here",
    "Mail Delivery Subsystem: your message could not be delivered.",
  ];

  it.each(BOUNCES)("classifies %s as a bounce", (text) => {
    expect(classifyReply(text).category).toBe("bounce");
  });

  it("outranks general negative and question wording inside the bounce report", () => {
    const text =
      "Delivery has failed to these recipients. Original message: Would you be interested? " +
      "We're all set, no thanks.";
    expect(classifyReply(text).category).toBe("bounce");
  });

  it("never overrides an explicit unsubscribe request", () => {
    const text = "Your message was undeliverable to this mailbox. Also, please unsubscribe me.";
    expect(classifyReply(text).category).toBe("unsubscribe");
  });

  it("does not misread an ordinary human reply as a bounce", () => {
    expect(classifyReply("Sounds great, happy to chat next week.").category).toBe("interested");
    expect(classifyReply("Not interested, thanks.").category).toBe("negative");
  });

  it("is displayed as Bounce and suggests stopping sends", () => {
    const meta = REPLY_CATEGORIES.bounce;
    expect(meta.label).toBe("Bounce");
    expect(meta.suggestedAction.toLowerCase()).toContain("stop");
    expect(meta.actionKey).toBe("suppress");
    expect(REPLY_CATEGORY_ORDER).toContain("bounce");
  });

  it("drafts no reply for a bounce", () => {
    expect(draftReply("bounce", { firstName: "Sam" })).toBe("");
  });

  it("suppresses only on explicit confirmation, with a technical reason", () => {
    const panel = readFileSync("src/components/app/ReplyTriagePanel.tsx", "utf8");
    expect(panel).toContain('isBounce ? "hard_bounce" : "reply_optout"');
    expect(panel).toContain('reason: "hard_bounce"');
    // Suppression lives inside an explicit click handler, not the classifier.
    expect(panel).toMatch(/const suppress = async \(\) => \{/);
    expect(panel).toMatch(/onClick=\{suppress\}/);
    expect(panel).toContain('reply_category: isBounce ? "bounce" : "unsubscribe"');
    expect(panel).toContain('action: "reply_triaged_bounce"');
  });
});
