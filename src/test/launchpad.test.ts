import { describe, it, expect } from "vitest";
import { resolveLaunchpad, type LaunchpadSignals } from "@/lib/launchpad";

const base: LaunchpadSignals = {
  hasBrief: false,
  approvedContacts: 0,
  hasContent: false,
  senderReady: false,
  preflightBlockers: 3,
  approved: false,
  isSample: false,
  activated: false,
  campaignId: null,
};

describe("launchpad next-step resolution", () => {
  it("points at the brief first for an empty workspace", () => {
    const r = resolveLaunchpad(base);
    expect(r.nextStep?.id).toBe("brief");
    expect(r.continueTo).toBe("/app/campaigns/copilot");
    expect(r.completed).toBe(0);
  });

  it("advances to contacts once the brief exists", () => {
    const r = resolveLaunchpad({ ...base, hasBrief: true });
    expect(r.nextStep?.id).toBe("contacts");
  });

  it("never claims live before approval and activation", () => {
    const r = resolveLaunchpad({
      ...base,
      hasBrief: true,
      approvedContacts: 10,
      hasContent: true,
      senderReady: true,
      preflightBlockers: 0,
      approved: false,
      activated: false,
    });
    expect(r.campaignLive).toBe(false);
    expect(r.summary).toContain("Not live yet");
  });

  it("treats a sample campaign as unapproved", () => {
    const r = resolveLaunchpad({
      ...base,
      hasBrief: true,
      approvedContacts: 10,
      hasContent: true,
      senderReady: true,
      preflightBlockers: 0,
      approved: true,
      isSample: true,
      activated: true,
    });
    expect(r.campaignLive).toBe(false);
    expect(r.nextStep?.id).toBe("approval");
  });

  it("reports live only when approved, non-sample and activated", () => {
    const r = resolveLaunchpad({
      hasBrief: true,
      approvedContacts: 10,
      hasContent: true,
      senderReady: true,
      preflightBlockers: 0,
      approved: true,
      isSample: false,
      activated: true,
      campaignId: "c1",
    });
    expect(r.campaignLive).toBe(true);
    expect(r.nextStep).toBeNull();
    expect(r.completed).toBe(r.total);
  });

  it("continue action never targets a completed step", () => {
    const r = resolveLaunchpad({ ...base, hasBrief: true, approvedContacts: 5 });
    expect(r.nextStep?.done).toBe(false);
    expect(r.continueTo).toBe(r.nextStep?.to);
  });

  it("deep-links content review to the working campaign when known", () => {
    const r = resolveLaunchpad({ ...base, hasBrief: true, approvedContacts: 1, campaignId: "abc" });
    expect(r.steps.find((s) => s.id === "content")?.to).toBe("/app/campaigns/abc");
  });
});
