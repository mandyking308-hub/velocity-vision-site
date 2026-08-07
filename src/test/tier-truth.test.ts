// Tier-truth invariants: what the public site and in-app copy promise must
// match what the code actually enforces. These tests fail loudly if the two
// drift apart again.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PLAN_DAILY_CEILING, computeSafety, DEFAULT_SENDER_STATE } from "@/lib/sendSafety";
import { PLANS, canUseRecurringCadence, canSendLive } from "@/lib/credits";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("canonical daily send ceilings", () => {
  it("uses the agreed safe numbers", () => {
    expect(PLAN_DAILY_CEILING).toEqual({
      free_preview: 0,
      starter: 20,
      growth: 50,
      agency: 100,
    });
  });

  it("matches the authoritative server cap table in email-send", () => {
    const src = read("supabase/functions/email-send/index.ts");
    const match = src.match(/const WARMUP_DAILY_CAP[^=]*=\s*{([^}]*)}/);
    expect(match).toBeTruthy();
    const body = match![1];
    for (const [plan, cap] of Object.entries(PLAN_DAILY_CEILING)) {
      expect(body).toMatch(new RegExp(`${plan}:\\s*${cap}\\b`));
    }
  });

  it("fails closed for an unknown plan rather than defaulting to a paid tier", () => {
    const res = computeSafety({
      plan: "not_a_plan" as never,
      sender: { ...DEFAULT_SENDER_STATE, connected: true, domain_authenticated: true },
      sendsUsedToday: 0,
      sendsScheduledToday: 0,
      sendCreditsRemaining: 500,
      vault: { valid: 500, needs_review: 0, risky: 0, blocked: 0 },
    });
    expect(res.safeAllowance).toBe(0);
  });

  it("gives free preview a zero allowance even with a healthy sender", () => {
    const res = computeSafety({
      plan: "free_preview",
      sender: { ...DEFAULT_SENDER_STATE, connected: true, domain_authenticated: true },
      sendsUsedToday: 0,
      sendsScheduledToday: 0,
      sendCreditsRemaining: 100,
      vault: { valid: 100, needs_review: 0, risky: 0, blocked: 0 },
    });
    expect(res.safeAllowance).toBe(0);
  });
});

describe("email-send server gate", () => {
  const src = read("supabase/functions/email-send/index.ts");

  it("rejects a send when the plan is unknown or missing", () => {
    expect(src).toContain("plan_not_recognised");
    expect(src).not.toMatch(/plan\?\.plan \|\| "starter"/);
  });

  it("hard-blocks any plan whose ceiling is zero (free preview)", () => {
    expect(src).toContain("plan_send_not_permitted");
    expect(src).toMatch(/if \(cap <= 0\)/);
  });
});

describe("plan entitlements", () => {
  it("restricts recurring cadence to Growth and Agency", () => {
    expect(canUseRecurringCadence("free_preview")).toBe(false);
    expect(canUseRecurringCadence("starter")).toBe(false);
    expect(canUseRecurringCadence("growth")).toBe(true);
    expect(canUseRecurringCadence("agency")).toBe(true);
  });

  it("blocks live sending on free preview only", () => {
    expect(canSendLive("free_preview")).toBe(false);
    expect(canSendLive("starter")).toBe(true);
    expect(canSendLive("growth")).toBe(true);
    expect(canSendLive("agency")).toBe(true);
  });

  it("publishes the agreed credit allowances", () => {
    expect(PLANS.starter.includedCredits).toBe(25);
    expect(PLANS.growth.includedCredits).toBe(80);
    expect(PLANS.agency.includedCredits).toBe(250);
    expect(PLANS.agency.workspaceLimit).toBeNull();
    expect(PLANS.starter.workspaceLimit).toBe(1);
    expect(PLANS.growth.workspaceLimit).toBe(1);
  });

  it("does not promise recurring cadence on Starter or Free Preview copy", () => {
    for (const plan of ["free_preview", "starter"] as const) {
      const copy = PLANS[plan].features.join(" ").toLowerCase();
      expect(copy).not.toContain("recurring");
    }
  });
});

describe("no unimplemented claims in user-visible copy", () => {
  const files = [
    "src/lib/credits.ts",
    "src/pages/Pricing.tsx",
    "src/components/PricingTeaser.tsx",
    "src/components/app/UpgradeNudge.tsx",
    "src/pages/Features.tsx",
  ];

  it("never claims watermarked exports", () => {
    for (const f of files) expect(read(f).toLowerCase()).not.toContain("watermark");
  });

  it("never claims seat management", () => {
    // Seat management is not implemented. The phrase may only appear as an explicit denial.
    for (const f of files) {
      const copy = read(f).toLowerCase();
      for (const m of copy.matchAll(/seat management/g)) {
        const around = copy.slice(Math.max(0, m.index! - 30), m.index!);
        expect(around).toMatch(/no |not /);
      }
    }
  });

  it("never claims calendar sync or A/B testing on the public feature page", () => {
    const copy = read("src/pages/Features.tsx").toLowerCase();
    expect(copy).not.toContain("calendar sync");
    // A/B testing may only appear as an explicit disclaimer, never as a claim.
    for (const m of copy.matchAll(/a\/b test\w*/g)) {
      const around = copy.slice(Math.max(0, m.index! - 30), m.index!);
      expect(around).toMatch(/no |not /);
    }
  });
});

describe("public pages describe the implemented differentiators", () => {
  const features = read("src/pages/Features.tsx");
  const howItWorks = read("src/pages/HowItWorks.tsx");

  it("features page covers copilot, preflight, reply triage, referrals, OOO and the funnel", () => {
    for (const phrase of [
      "First-Campaign Copilot",
      "Launchpad",
      "Preflight",
      "Reply Intent Command Centre",
      "Out-of-Office",
      "Outcome Funnel",
      "Meeting handoff",
    ]) {
      expect(features).toContain(phrase);
    }
  });

  it("how-it-works shows the reply-to-meeting path and outcome measurement", () => {
    expect(howItWorks).toContain("Reply Intent Command Centre");
    expect(howItWorks).toContain("Outcome Funnel");
  });
});

describe("provider-neutral billing language", () => {
  it("does not name a payment provider in the missing-billing-profile toast", () => {
    const src = read("src/pages/app/AppBilling.tsx");
    expect(src).toContain('toast.info("No billing profile yet.")');
    expect(src).not.toContain("No Stripe billing profile yet.");
  });
});
