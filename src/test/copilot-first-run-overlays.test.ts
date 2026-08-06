import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { isTourSuppressedRoute } from "@/components/app/SetupWizard";

describe("guided setup tour suppression", () => {
  it("is suppressed on the Copilot route", () => {
    expect(isTourSuppressedRoute("/app/campaigns/copilot")).toBe(true);
    expect(isTourSuppressedRoute("/app/campaigns/copilot/step-2")).toBe(true);
  });

  it("still runs everywhere else", () => {
    expect(isTourSuppressedRoute("/app")).toBe(false);
    expect(isTourSuppressedRoute("/app/campaigns")).toBe(false);
    expect(isTourSuppressedRoute("/app/data-vault")).toBe(false);
  });

  it("returns null before rendering the blocking dialog on a suppressed route", () => {
    const src = readFileSync("src/components/app/SetupWizard.tsx", "utf8");
    const nullIdx = src.indexOf("if (suppressed) return null;");
    expect(nullIdx).toBeGreaterThan(-1);
    expect(nullIdx).toBeLessThan(src.indexOf("<Dialog"));
  });

  it("defers rather than permanently dismisses the tour", () => {
    const src = readFileSync("src/components/app/SetupWizard.tsx", "utf8");
    // the suppression branch must not write the dismissed flag
    const branch = src.slice(src.indexOf("if (suppressed) {"), src.indexOf("const dismiss"));
    expect(branch).not.toContain("setItem");
  });
});

describe("cookie consent banner", () => {
  const src = readFileSync("src/components/CookieBanner.tsx", "utf8");

  it("still offers accept, reject and manage choices", () => {
    expect(src).toContain("Accept all");
    expect(src).toContain("Reject non-essential");
    expect(src).toContain("Manage preferences");
  });

  it("keeps non-essential consent off by default", () => {
    expect(src).toContain("useState(false)");
    expect(src).not.toContain("useState(true)");
  });

  it("does not auto-accept on mount", () => {
    const effect = src.slice(src.indexOf("useEffect(() => {"), src.indexOf("const save ="));
    expect(effect).not.toContain("writePrefs(");
  });

  it("publishes visibility state for content safe-area padding", () => {
    expect(src).toContain('data-cookie-banner');
    const copilot = readFileSync("src/pages/app/AppCampaignCopilot.tsx", "utf8");
    expect(copilot).toContain("copilot-safe-bottom");
    expect(readFileSync("src/index.css", "utf8")).toContain('[data-cookie-banner="visible"] .copilot-safe-bottom');
  });
});
