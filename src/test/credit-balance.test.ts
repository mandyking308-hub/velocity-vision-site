import { describe, expect, it } from "vitest";
import { computeCreditBalance } from "@/lib/creditBalance";

const row = (delta: number, reason: string, created_at: string) => ({ delta, reason, created_at });

describe("Campaign Credit allocation", () => {
  it("uses included credits first then topups: 25 + 25 - 30 = 20", () => {
    const ledger = [
      row(25, "plan_grant", "2026-08-01T00:00:00Z"),
      row(25, "topup", "2026-08-02T00:00:00Z"),
      row(-10, "spend_full_campaign_pack", "2026-08-03T00:00:00Z"),
      row(-10, "spend_full_campaign_pack", "2026-08-04T00:00:00Z"),
      row(-10, "spend_full_campaign_pack", "2026-08-05T00:00:00Z"),
    ];
    const result = computeCreditBalance(ledger, {
      plan: "starter",
      periodStart: new Date("2026-08-01T00:00:00Z"),
      freePreviewExpired: false,
    });
    expect(result.included).toBe(25);
    expect(result.used).toBe(30);
    expect(result.topupBalance).toBe(20);
    expect(result.remaining).toBe(20);
  });

  it("never returns a negative balance when spend exceeds all available credits", () => {
    const result = computeCreditBalance([
      row(25, "plan_grant", "2026-08-01T00:00:00Z"),
      row(25, "topup", "2026-08-02T00:00:00Z"),
      row(-60, "spend_full_campaign_pack", "2026-08-03T00:00:00Z"),
    ], {
      plan: "starter",
      periodStart: new Date("2026-08-01T00:00:00Z"),
      freePreviewExpired: false,
    });
    expect(result.topupBalance).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it("carries unused topups across plan cycles but consumes prior-cycle overage", () => {
    const result = computeCreditBalance([
      row(25, "topup", "2026-07-01T00:00:00Z"),
      row(25, "plan_grant", "2026-07-01T01:00:00Z"),
      row(-30, "spend_full_campaign_pack", "2026-07-10T00:00:00Z"),
      row(80, "plan_grant", "2026-08-01T00:00:00Z"),
      row(-10, "spend_full_campaign_pack", "2026-08-05T00:00:00Z"),
    ], {
      plan: "growth",
      periodStart: new Date("2026-08-01T00:00:00Z"),
      freePreviewExpired: false,
    });
    expect(result.topupBalance).toBe(20);
    expect(result.remaining).toBe(90); // 70 current plan + 20 carried topup
  });

  it("forfeits Free Preview generated balance after preview expiry", () => {
    const result = computeCreditBalance([
      row(10, "free_welcome_grant", "2026-08-01T00:00:00Z"),
      row(-4, "free_preview_spend", "2026-08-02T00:00:00Z"),
    ], {
      plan: "free_preview",
      periodStart: new Date("2026-08-01T00:00:00Z"),
      freePreviewExpired: true,
    });
    expect(result.remaining).toBe(0);
    expect(result.included).toBe(0);
  });
});
