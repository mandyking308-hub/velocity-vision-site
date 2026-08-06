import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolveIntent, allowedOverrideCategories, deterministicCompliance } from "@/lib/replyIntent";
import { resolveUnsubscribeReadiness, UNSUBSCRIBE_HANDLER_DEPLOYED, UNSUBSCRIBE_CAPABILITY } from "@/lib/systemCapabilities";
import { resolveLaunchpad, type LaunchpadSignals } from "@/lib/launchpad";

const lead = (reply_snippet: string, reply_category?: string | null) => ({
  id: "l1", reply_snippet, reply_category: reply_category ?? null,
});

describe("compliance intent overrides a stored sales label", () => {
  it("unsubscribe text beats a stored not_now", () => {
    expect(resolveIntent(lead("Please unsubscribe me from this list.", "not_now"))).toBe("unsubscribe");
  });

  it("bounce text beats a stored interested", () => {
    expect(resolveIntent(lead("Delivery has failed: mailbox unavailable.", "interested"))).toBe("bounce");
  });

  it("an explicit unsubscribe outranks a bounce signal", () => {
    expect(
      resolveIntent(lead("Delivery has failed: mailbox unavailable. Please unsubscribe me.", "interested")),
    ).toBe("unsubscribe");
    // Stored unsubscribe also survives bounce text.
    expect(resolveIntent(lead("Delivery has failed: mailbox unavailable.", "unsubscribe"))).toBe("unsubscribe");
  });

  it("an ordinary reply still honours a valid stored manual category", () => {
    expect(resolveIntent(lead("Can you send more detail?", "interested"))).toBe("interested");
    expect(resolveIntent(lead("Can you send more detail?", "nonsense" as any))).toBe("question");
  });

  it("manual override cannot downgrade a compliance reply to a sales label", () => {
    const locked = allowedOverrideCategories(lead("Please unsubscribe me."));
    // An opt-out is locked outright; a bounce may only be corrected upward to an opt-out.
    expect(locked).toEqual(["unsubscribe"]);
    expect(allowedOverrideCategories(lead("Delivery failed: mailbox does not exist")).sort()).toEqual([
      "bounce",
      "unsubscribe",
    ]);
    for (const bad of ["interested", "question", "not_now", "negative", "uncategorised"]) {
      expect(locked).not.toContain(bad);
    }
    expect(allowedOverrideCategories(lead("Sounds interesting"))).toContain("interested");
    expect(deterministicCompliance("Sounds interesting")).toBeNull();
  });
});

describe("launchpad activation is campaign-specific", () => {
  const base: LaunchpadSignals = {
    hasBrief: true, approvedContacts: 10, hasContent: true, senderReady: true,
    preflightBlockers: 0, approved: true, isSample: false, activated: false, campaignId: "c-new",
  };

  it("is not live without campaign-specific activation proof", () => {
    expect(resolveLaunchpad(base).campaignLive).toBe(false);
  });

  it("is live only when the same campaign is approved, non-sample and activated", () => {
    expect(resolveLaunchpad({ ...base, activated: true }).campaignLive).toBe(true);
    expect(resolveLaunchpad({ ...base, activated: true, isSample: true }).campaignLive).toBe(false);
    expect(resolveLaunchpad({ ...base, activated: true, approved: false }).campaignLive).toBe(false);
  });

  it("the dashboard never derives activation from global lead or send counts", () => {
    const src = readFileSync("src/pages/app/AppDashboard.tsx", "utf8");
    expect(src).toContain("activated: workingCampaignActivated");
    expect(src).not.toContain("activated: pipeline.leads > 0");
    expect(src).toContain("activatedCampaignIds.has(workingCampaign!.id)");
  });
});

describe("unsubscribe readiness is a derived capability, not a literal", () => {
  it("unknown handler availability cannot pass", () => {
    expect(resolveUnsubscribeReadiness({}).ready).toBe(false);
    expect(resolveUnsubscribeReadiness({ messageBody: "Unsubscribe here" }).ready).toBe(false);
  });

  it("a message with no opt-out instruction cannot pass", () => {
    expect(
      resolveUnsubscribeReadiness({ handlerAvailable: UNSUBSCRIBE_HANDLER_DEPLOYED, messageBody: "Hi there, quick question." }).ready,
    ).toBe(false);
    expect(
      resolveUnsubscribeReadiness({ handlerAvailable: UNSUBSCRIBE_HANDLER_DEPLOYED, messageBody: "" }).ready,
    ).toBe(false);
  });

  it("passes only when the handler exists and the copy carries an opt-out", () => {
    const v = resolveUnsubscribeReadiness({
      handlerAvailable: UNSUBSCRIBE_HANDLER_DEPLOYED,
      messageBody: "Hi there. Reply STOP or unsubscribe here if you'd rather not hear from us.",
    });
    expect(v.ready).toBe(true);
    expect(v.detail.length).toBeGreaterThan(10);
    // The platform does not inject a footer — that fact must stay documented.
    expect(UNSUBSCRIBE_CAPABILITY.footerInjectedByPlatform).toBe(false);
  });

  it("no preflight caller hardcodes unsubscribeReady: true", () => {
    for (const f of [
      "src/pages/app/AppDashboard.tsx",
      "src/pages/app/AppActivation.tsx",
      "src/pages/app/AppCampaignWorkspace.tsx",
      "src/pages/demo/DemoCRMDashboard.tsx",
    ]) {
      expect(readFileSync(f, "utf8")).not.toContain("unsubscribeReady: true");
    }
  });
});
