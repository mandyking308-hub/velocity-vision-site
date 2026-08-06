import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { canExecuteActivation, type PreflightResult } from "@/lib/campaignPreflight";

function result(canActivate: boolean): PreflightResult {
  const blocker = {
    id: "contacts",
    label: "Contacts ready",
    detail: "Import contacts before activating.",
    severity: "blocker" as const,
    ok: false,
  };
  return {
    checks: canActivate ? [] : [blocker],
    blockers: canActivate ? [] : [blocker],
    warnings: [],
    score: canActivate ? 100 : 0,
    canActivate,
    allClear: canActivate,
  };
}

const approved = { id: "c1", is_sample: false, approved_at: "2026-01-01T00:00:00Z" };

describe("canExecuteActivation", () => {
  it("refuses when no campaign is selected", () => {
    expect(canExecuteActivation(result(true), null).ok).toBe(false);
    expect(canExecuteActivation(result(true), null).blockerIds).toContain("campaign");
  });

  it("refuses a sample campaign", () => {
    const v = canExecuteActivation(result(true), { ...approved, is_sample: true });
    expect(v.ok).toBe(false);
    expect(v.blockerIds).toContain("sample");
  });

  it("refuses an unapproved campaign", () => {
    const v = canExecuteActivation(result(true), { ...approved, approved_at: null });
    expect(v.ok).toBe(false);
    expect(v.blockerIds).toContain("approval");
  });

  it("refuses when preflight is blocked", () => {
    const v = canExecuteActivation(result(false), approved);
    expect(v.ok).toBe(false);
    expect(v.blockerIds).toContain("contacts");
    expect(v.reason).toContain("Contacts ready");
  });

  it("allows an approved, non-sample campaign with a clean preflight", () => {
    const v = canExecuteActivation(result(true), approved);
    expect(v.ok).toBe(true);
    expect(v.blockerIds).toHaveLength(0);
  });
});

describe("AppActivation contract", () => {
  const src = readFileSync("src/pages/app/AppActivation.tsx", "utf8");

  it("uses the shared helper for the button state and inside runActivation", () => {
    expect(src).toContain("canExecuteActivation");
    // button state + pre-guard + live re-check
    expect(src.match(/canExecuteActivation\(/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(src).toMatch(/canActivate\s*=\s*[\s\S]{0,160}execVerdict\.ok/);
  });

  it("guards before setActivating and before any write", () => {
    const body = src.slice(src.indexOf("async function runActivation"));
    const guardIdx = body.indexOf("canExecuteActivation(");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(guardIdx).toBeLessThan(body.indexOf("setActivating(true)"));
    expect(guardIdx).toBeLessThan(body.indexOf("audit("));
  });
});
