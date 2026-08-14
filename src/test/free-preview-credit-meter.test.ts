import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

const source = readFileSync("src/components/app/CreditMeter.tsx", "utf8");

describe("Free Preview credit meter", () => {
  it("excludes top-up balance from the displayed Free Preview allowance", () => {
    expect(source).toContain("const total = isFreePreview ? included : included + topupBalance");
  });

  it("shows a paid-plan comparison instead of Buy credits on Free Preview", () => {
    expect(source).toContain("isFreePreview ? (");
    expect(source).toContain('to="/pricing">Compare paid plans');
  });

  it("does not render the top-up modal for Free Preview", () => {
    expect(source).toContain("!isFreePreview && <TopUpModal");
  });

  it("does not display historical top-up balance in the Free Preview breakdown", () => {
    expect(source).toContain("!isFreePreview && <span>");
  });
});
