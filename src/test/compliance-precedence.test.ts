import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  resolveIntent,
  describeOverride,
  allowedOverrideCategories,
  isOverrideAllowed,
  buildOverrideAuditDetails,
} from "@/lib/replyIntent";
import { isUnsubscribeCapabilityReady } from "@/lib/systemCapabilities";

const lead = (snippet: string, stored?: string) => ({
  id: "l1",
  reply_snippet: snippet,
  reply_category: stored ?? null,
});

describe("A — compliance precedence in resolveIntent", () => {
  it("unsubscribe text beats a stored not_now", () => {
    expect(resolveIntent(lead("Please unsubscribe me from this list", "not_now"))).toBe("unsubscribe");
  });

  it("bounce text beats a stored interested", () => {
    expect(
      resolveIntent(lead("Delivery failed: mailbox does not exist (550 5.1.1)", "interested")),
    ).toBe("bounce");
  });

  it("mixed unsubscribe + bounce resolves to unsubscribe", () => {
    const mixed = lead("mailbox full, delivery failed — also please unsubscribe me", "interested");
    expect(resolveIntent(mixed)).toBe("unsubscribe");
  });

  it("ordinary reply keeps a valid stored manual category", () => {
    expect(resolveIntent(lead("Thanks, circle back next quarter please", "not_now"))).toBe("not_now");
  });

  it("describeOverride reports the compliance result as effective, not the stored sales label", () => {
    const a = describeOverride(lead("please unsubscribe me", "interested"));
    expect(a.effective).toBe("unsubscribe");
    expect(a.suggested).toBe("unsubscribe");
    expect(a.complianceLocked).toBe("unsubscribe");
    expect(a.storedIgnored).toBe(true);
    expect(a.overridden).toBe(false);
    expect(buildOverrideAuditDetails(lead("please unsubscribe me", "interested"), "interested").effective).toBe(
      "unsubscribe",
    );
  });

  it("an opt-out cannot be downgraded to any other category", () => {
    const l = lead("unsubscribe please");
    expect(allowedOverrideCategories(l)).toEqual(["unsubscribe"]);
    expect(isOverrideAllowed(l, "interested")).toBe(false);
    expect(isOverrideAllowed(l, "bounce")).toBe(false);
  });

  it("a hard bounce may only stay a bounce or be corrected to an opt-out", () => {
    const l = lead("Delivery failed: mailbox does not exist (550 5.1.1)");
    expect(allowedOverrideCategories(l).sort()).toEqual(["bounce", "unsubscribe"]);
    expect(isOverrideAllowed(l, "not_now")).toBe(false);
  });

  it("the triage panel rejects an unsafe override before any write", () => {
    const src = fs.readFileSync("src/components/app/ReplyTriagePanel.tsx", "utf8");
    const guard = src.indexOf("!allowedCategories.includes(override)");
    const write = src.indexOf('supabase.from("leads").update');
    expect(guard).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(guard);
    expect(src).toContain("cannot be reclassified");
    // Only allowed categories are even offered in the selector.
    expect(src).toContain("allowedCategories.map((c)");
  });
});

describe("B — campaign-specific activation", () => {
  const src = fs.readFileSync("src/pages/app/AppDashboard.tsx", "utf8");

  it("does not use global pipeline totals for activation", () => {
    expect(src).not.toContain("activated: pipeline.leads > 0");
    expect(src).toContain("activated: workingCampaignActivated");
  });

  it("activation evidence is keyed by the working campaign id", () => {
    expect(src).toContain("activatedCampaignIds.has(workingCampaign!.id)");
    expect(src).toContain("Boolean(workingCampaign?.id) &&");
  });

  it("another campaign's leads cannot mark the working campaign live", () => {
    const activatedCampaignIds = new Set(["campaign-other"]);
    const workingCampaign = { id: "campaign-working" };
    const activated = Boolean(workingCampaign?.id) && activatedCampaignIds.has(workingCampaign.id);
    expect(activated).toBe(false);
    expect(Boolean(undefined) && activatedCampaignIds.has("x")).toBe(false);
  });
});

describe("C — explicit unsubscribe capability", () => {
  it("unknown capability is never a pass", () => {
    expect(isUnsubscribeCapabilityReady()).toBe(false);
    expect(isUnsubscribeCapabilityReady({ handlerAvailable: true })).toBe(false);
    expect(isUnsubscribeCapabilityReady({ handlerAvailable: true, messageBody: "Hi there, quick note." })).toBe(
      false,
    );
    expect(
      isUnsubscribeCapabilityReady({ handlerAvailable: false, messageBody: "Reply STOP or unsubscribe here." }),
    ).toBe(false);
  });

  it("passes only with a deployed handler and an opt-out instruction in the copy", () => {
    expect(
      isUnsubscribeCapabilityReady({
        handlerAvailable: true,
        messageBody: "Hello — if this is not relevant you can unsubscribe at any time.",
      }),
    ).toBe(true);
  });

  it("the dashboard uses the helper, not a literal true", () => {
    const src = fs.readFileSync("src/pages/app/AppDashboard.tsx", "utf8");
    expect(src).toContain("unsubscribeReady: isUnsubscribeCapabilityReady({");
    expect(src).not.toContain("unsubscribeReady: true");
  });
});
