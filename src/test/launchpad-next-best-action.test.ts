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

const live: LaunchpadSignals = {
  ...base,
  hasBrief: true,
  approvedContacts: 40,
  hasContent: true,
  senderReady: true,
  preflightBlockers: 0,
  approved: true,
  activated: true,
  campaignId: "c1",
};

describe("launchpad next best action", () => {
  it("uses the next incomplete step before launch and always explains why", () => {
    const r = resolveLaunchpad(base);
    expect(r.nextBestAction?.id).toBe("brief");
    expect(r.nextBestAction?.to).toBe("/app/campaigns/copilot");
    expect(r.nextBestAction?.why.length).toBeGreaterThan(0);
    expect(r.nextBestAction?.urgent).toBe(false);
  });

  it("marks outstanding preflight blockers as urgent", () => {
    const r = resolveLaunchpad({
      ...live,
      approved: false,
      activated: false,
      preflightBlockers: 2,
    });
    expect(r.nextBestAction?.id).toBe("preflight");
    expect(r.nextBestAction?.urgent).toBe(true);
  });

  it("mentions held-back contacts using real data when contacts are the blocker", () => {
    const r = resolveLaunchpad({ ...base, hasBrief: true, reviewContacts: 120 });
    expect(r.nextBestAction?.id).toBe("contacts");
    expect(r.nextBestAction?.detail).toContain("120");
  });

  it("switches to reply work only once the campaign is genuinely live and replies exist", () => {
    expect(resolveLaunchpad({ ...live, repliesWaiting: 0 }).nextBestAction).toBeNull();
    const r = resolveLaunchpad({ ...live, repliesWaiting: 5, urgentReplies: 2 });
    expect(r.nextBestAction?.id).toBe("replies");
    expect(r.nextBestAction?.urgent).toBe(true);
    expect(r.continueTo).toBe("/app/follow-up");
    expect(r.summary).toContain("5");
  });

  it("never suggests reply work for a sample campaign that is not live", () => {
    const r = resolveLaunchpad({ ...live, isSample: true, repliesWaiting: 9 });
    expect(r.campaignLive).toBe(false);
    expect(r.nextBestAction?.id).not.toBe("replies");
  });
});
