// Customer-journey stitching invariants: the website -> plan -> auth -> Dodo
// purchase -> entitlement -> dashboard -> first useful action path must stay
// one coherent product. These tests fail loudly if any join drifts.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PLANS, TOPUP_PACKS, FREE_LIMITS, canUseRecurringCadence } from "@/lib/credits";
import { PLAN_DAILY_CEILING } from "@/lib/sendSafety";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("customer journey: package truth", () => {
  it("top-up prices match the live USD catalogue", () => {
    expect(TOPUP_PACKS.map((p) => p.price)).toEqual([59, 149, 349]);
    expect(TOPUP_PACKS.map((p) => p.credits)).toEqual([25, 75, 200]);
  });

  it("free preview limits match the published truth", () => {
    expect(FREE_LIMITS).toEqual({
      welcomeCredits: 10,
      dailyGrant: 2,
      dailyBalanceCap: 10,
      previewDays: 14,
      maxContacts: 25,
      maxCampaignPacks: 1,
    });
    expect(PLANS.free_preview.workspaceLimit).toBe(1);
  });

  it("daily send ceilings match the published truth", () => {
    expect(PLAN_DAILY_CEILING).toEqual({ free_preview: 0, starter: 20, growth: 50, agency: 100 });
  });

  it("recurring cadence is Growth/Agency only; workspaces per plan are correct", () => {
    expect(canUseRecurringCadence("free_preview")).toBe(false);
    expect(canUseRecurringCadence("starter")).toBe(false);
    expect(canUseRecurringCadence("growth")).toBe(true);
    expect(canUseRecurringCadence("agency")).toBe(true);
    expect(PLANS.starter.workspaceLimit).toBe(1);
    expect(PLANS.growth.workspaceLimit).toBe(1);
    expect(PLANS.agency.workspaceLimit).toBeNull();
  });
});

describe("customer journey: purchase return stitching", () => {
  const dodoShared = read("supabase/functions/_shared/dodo.ts");

  it("dodo return flags are safe internal slugs", () => {
    expect(dodoShared).toContain('vv_starter_oneoff: "starter"');
    expect(dodoShared).toContain('vv_growth_monthly: "growth"');
    expect(dodoShared).toContain('vv_agency_monthly: "agency"');
    expect(dodoShared).toContain('vv_topup_small: "topup_small"');
    expect(dodoShared).toContain('vv_topup_medium: "topup_medium"');
    expect(dodoShared).toContain('vv_topup_large: "topup_large"');
    expect(dodoShared).toContain("return_url: `${safeOrigin}/app/billing?checkout=${flag}`");
  });

  it("create-checkout passes the allow-listed product key into the return URL", () => {
    expect(read("supabase/functions/dodo-create-checkout/index.ts")).toMatch(
      /dodoReturnUrls\(req\.headers\.get\("origin"\), productKey\)/,
    );
  });

  it("billing lands plan purchases on the dashboard, not straight into campaign creation", () => {
    const src = read("src/pages/app/AppBilling.tsx");
    expect(src).not.toContain('navigate("/app/campaigns/new", { replace: true })');
    expect(src).toContain('navigate("/app", { replace: true, state: { planActivated: expectedPlan } })');
  });

  it("the browser return never grants entitlements — fulfilment polling is bounded and webhook-authoritative", () => {
    const src = read("src/pages/app/AppBilling.tsx");
    expect(src).toContain("ACTIVATION_POLL_ATTEMPTS");
    expect(src).toContain("ACTIVATION_POLL_MS");
    expect(src).toContain('from("user_plans")');
    expect(src).toContain('from("credit_topups")');
    // Honest waiting state: never claims activation the webhook has not completed.
    expect(src).toContain("nothing is lost");
  });

  it("billing uses live purchase labels", () => {
    const src = read("src/pages/app/AppBilling.tsx");
    expect(src).toContain("Buy Starter");
    expect(src).not.toContain("Start Starter");
    expect(src).toContain("`Start ${cfg.name}`");
  });
});

describe("customer journey: navigation order", () => {
  it("sidebar follows the agreed customer journey order", () => {
    const src = read("src/pages/app/AppLayout.tsx");
    const navBlock = src.match(/const navConfig[^=]*= \[([\s\S]*?)\];/);
    expect(navBlock).toBeTruthy();
    const order = [...navBlock![1].matchAll(/to: "([^"]+)"/g)].map((m) => m[1]);
    expect(order).toEqual([
      "/app",
      "/app/data-vault",
      "/app/campaigns",
      "/app/activate",
      "/app/follow-up",
      "/app/leads",
      "/app/pipeline",
      "/app/performance",
      "/app/templates",
      "/app/workspaces",
      "/app/billing",
      "/app/settings",
    ]);
  });
});

describe("customer journey: first workspace", () => {
  it("workspace creation refreshes context and navigates to the dashboard instead of reloading", () => {
    const src = read("src/pages/app/AppWorkspaces.tsx");
    expect(src).not.toContain("window.location.reload()");
    expect(src).toContain('navigate("/app")');
    expect(src).toContain("await refresh()");
  });
});

describe("customer journey: dashboard welcome", () => {
  it("dashboard renders the plan summary card near the top", () => {
    const src = read("src/pages/app/AppDashboard.tsx");
    expect(src).toContain("<PlanSummaryCard />");
    expect(src.indexOf("<PlanSummaryCard />")).toBeLessThan(src.indexOf("<FirstCampaignLaunchpad"));
  });

  it("summary copy derives from the shared package truth, not a separate matrix", () => {
    const src = read("src/components/app/PlanSummaryCard.tsx");
    expect(src).toContain("PLAN_DAILY_CEILING");
    expect(src).toContain("planConfig.features");
    expect(src).toContain("FREE_LIMITS");
    // Free Preview must state review mode / no live sending explicitly.
    expect(src).toContain("No live sending — review mode");
  });

  it("dashboard workspace quick-access grid links to every core customer path", () => {
    const src = read("src/pages/app/AppDashboard.tsx");
    for (const path of [
      "/app/data-vault",
      "/app/campaigns",
      "/app/activate",
      "/app/follow-up",
      "/app/leads",
      "/app/pipeline",
      "/app/performance",
      "/app/templates",
      "/app/workspaces",
      "/app/billing",
      "/app/settings",
    ]) {
      expect(src).toContain(`"${path}"`);
    }
  });
});

describe("customer journey: no cancelled products or stale CTAs", () => {
  it("no active Human Review purchase surface remains", () => {
    for (const f of [
      "src/pages/Pricing.tsx",
      "src/components/PricingTeaser.tsx",
      "src/components/PremiumHomepage.tsx",
      "src/pages/app/AppBilling.tsx",
    ]) {
      const copy = read(f).toLowerCase();
      expect(copy).not.toContain("human review");
    }
  });

  it("public paid-plan CTAs never route to manual onboarding", () => {
    for (const f of [
      "src/pages/Pricing.tsx",
      "src/components/PricingTeaser.tsx",
      "src/components/PremiumHomepage.tsx",
    ]) {
      const src = read(f);
      expect(src).not.toContain("Request onboarding");
      expect(src).not.toMatch(/\/contact\?plan=/);
    }
  });
});
