// Regression coverage for the pre-customer release gate fixes.
// These assert the customer-facing contracts that were broken in the audit:
// signup entry, homepage demo path, demo dead ends, invalid campaign route
// and Free Preview top-up copy.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { SIGNUP_PATH, LOGIN_PATH, signupPathWithNext, isSignupMode } from "@/lib/signupPath";

const read = (p: string) => readFileSync(p, "utf8");

describe("signup path helper", () => {
  it("exposes an explicit create-account entry that is distinct from sign in", () => {
    expect(SIGNUP_PATH).toBe("/auth?mode=signup");
    expect(LOGIN_PATH).toBe("/auth");
  });

  it("preserves paid-plan purchase intent through signup", () => {
    expect(signupPathWithNext("/app/billing?buy=growth")).toBe(
      "/auth?mode=signup&next=%2Fapp%2Fbilling%3Fbuy%3Dgrowth",
    );
    expect(signupPathWithNext(null)).toBe(SIGNUP_PATH);
  });

  it("only treats the exact signup flag as signup mode", () => {
    expect(isSignupMode("signup")).toBe(true);
    expect(isSignupMode("login")).toBe(false);
    expect(isSignupMode(null)).toBe(false);
    expect(isSignupMode("Signup")).toBe(false);
  });
});

describe("auth page honours signup mode", () => {
  const src = read("src/pages/AuthPage.tsx");
  it("defaults to create-account when ?mode=signup is present", () => {
    expect(src).toContain("isSignupMode");
    expect(src).toContain("const [isLogin, setIsLogin] = useState(initialIsLogin)");
  });
  it("still sanitises the return path", () => {
    expect(src).toContain("safeNextPath(searchParams.get(\"next\"))");
  });
});

describe("public Free Preview CTAs land in create-account mode", () => {
  const files = [
    "src/components/HeroSection.tsx",
    "src/components/FinalCTA.tsx",
    "src/components/PricingTeaser.tsx",
    "src/components/Footer.tsx",
    "src/components/Navbar.tsx",
    "src/components/PlatformPositioning.tsx",
    "src/components/ROICalculator.tsx",
    "src/pages/Pricing.tsx",
    "src/pages/About.tsx",
    "src/pages/Features.tsx",
    "src/pages/HowItWorks.tsx",
    "src/pages/Templates.tsx",
    "src/pages/Services.tsx",
    "src/pages/ForBusinesses.tsx",
    "src/pages/ForAgencies.tsx",
  ];
  it.each(files)("%s has no login-first signup CTA", (f) => {
    const src = read(f);
    expect(src).toContain("SIGNUP_PATH");
    expect(src).not.toContain('to="/auth"');
  });
});

describe("homepage acquisition path exposes Demo", () => {
  const index = read("src/pages/Index.tsx");
  const hero = read("src/components/HeroSection.tsx");
  const finalCta = read("src/components/FinalCTA.tsx");
  const faq = read("src/components/HomeFAQ.tsx");

  it("mounts the existing MidPageCTA demo section", () => {
    expect(index).toContain("import MidPageCTA");
    expect(index).toContain("<MidPageCTA />");
  });
  it("offers the demo in the hero and the final conversion area", () => {
    expect(hero).toContain('to="/demo"');
    expect(finalCta).toContain('to="/demo"');
  });
  it("explains Demo vs Free Preview vs paid in the FAQ", () => {
    expect(faq).toContain("difference between the Demo, the Free Preview and a paid plan");
    expect(faq).toContain("no account");
    expect(faq).toContain("14 days");
  });
});

describe("demo has no protected-route dead ends", () => {
  const demoVault = read("src/pages/demo/DemoDataVault.tsx");
  const table = read("src/components/app/datavault/RecentImportsTable.tsx");

  it("renders demo imports read-only instead of linking into /app", () => {
    expect(demoVault).toContain("readOnly");
    expect(table).toContain("readOnly ? (");
  });
  it("points demo next-steps at signup or pricing, never a bare login", () => {
    expect(demoVault).not.toContain('to: "/auth"');
    expect(demoVault).toContain('to: "/pricing"');
  });
  it("uses the router-registered import detail route for the signed-in app", () => {
    expect(table).toContain("/app/data-vault/imports/${i.id}");
    expect(table).not.toContain("/app/n/");
    // Proves the link target matches the route defined in the router.
    expect(read("src/App.tsx")).toContain('path="data-vault/imports/:id"');
  });
});

describe("invalid campaign route", () => {
  const src = read("src/pages/app/AppCampaignWorkspace.tsx");
  it("rejects malformed ids without an endless loading state", () => {
    expect(src).toContain("UUID_RE");
    expect(src).toContain('setLoadState("missing")');
  });
  it("shows a not-found state with safe recovery actions", () => {
    expect(src).toContain("Campaign not found");
    expect(src).toContain("Back to campaigns");
    expect(src).toContain("Go to dashboard");
  });
  it("only marks the campaign ready when a row came back", () => {
    expect(src).toContain('setLoadState(camp ? "ready" : "missing")');
  });
});

describe("Free Preview is never offered a credit purchase", () => {
  it("expired Free Preview copy points at plans, not Buy credits", () => {
    const src = read("src/contexts/CreditsContext.tsx");
    expect(src).toContain("Free Preview has ended. Choose a paid plan to continue generating.");
    expect(src).not.toContain("Buy credits or upgrade");
  });
  it("the nudge engine swaps buy-credits CTAs for a plan comparison", () => {
    const src = read("src/components/app/UpgradeNudge.tsx");
    expect(src).toContain('isFreePreview && cta.kind === "buy_credits"');
  });
});
