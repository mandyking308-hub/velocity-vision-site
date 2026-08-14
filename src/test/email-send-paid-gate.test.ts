import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync("supabase/functions/email-send/index.ts", "utf8");

describe("email-send authoritative paid-plan gate", () => {
  it("checks current effective entitlement before loading an existing send row or connection", () => {
    const gate = source.indexOf("effective_plan_for_actions");
    const existingSend = source.indexOf("if (body.send_id)");
    const connection = source.indexOf('from("email_connections")');
    expect(gate).toBeGreaterThan(-1);
    expect(existingSend).toBeGreaterThan(gate);
    expect(connection).toBeGreaterThan(gate);
  });

  it("allows only Starter, Growth and Agency for customer sending", () => {
    expect(source).toContain('"starter", "growth", "agency"');
    expect(source).toContain("plan_send_not_permitted");
    expect(source).toContain("including controlled sender tests");
  });

  it("keeps founder/admin internal testing separate", () => {
    expect(source).toContain('.in("role", ["admin", "founder"])');
    expect(source).toContain("isInternalOperator");
  });

  it("cannot use test_mode to bypass the paid gate", () => {
    const gate = source.indexOf("effective_plan_for_actions");
    const testMode = source.indexOf("requestedTestMode");
    expect(testMode).toBeGreaterThan(gate);
  });
});
