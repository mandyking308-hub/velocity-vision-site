import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("payment environment badge", () => {
  const src = read("src/components/app/PaymentEnvBadge.tsx");

  it("never renders the internal QA warning in live mode", () => {
    expect(src).toContain('if (env === "live") return null;');
    expect(src).not.toContain("Do not run QA self-payments");
    expect(src).not.toMatch(/Live payment mode/i);
  });

  it("still surfaces the sandbox/test indicator", () => {
    expect(src).toMatch(/Sandbox \/ test mode/i);
  });
});

describe("top-up history provisioning", () => {
  const dodo = read("supabase/functions/dodo-webhook/index.ts");
  const stripe = read("supabase/functions/payments-webhook/index.ts");

  it("writes credit_topups with a plain insert (partial unique index is not upsertable)", () => {
    for (const src of [dodo, stripe]) {
      expect(src).toContain('from("credit_topups").insert(');
      expect(src).not.toContain('from("credit_topups").upsert(');
    }
  });

  it("records pack, credits, amount, currency and provider session id", () => {
    for (const src of [dodo, stripe]) {
      const block = src.slice(src.indexOf('from("credit_topups").insert('));
      for (const field of ["user_id:", "pack:", "credits:", "amount:", "currency:", "stripe_session_id:"]) {
        expect(block.slice(0, 600)).toContain(field);
      }
    }
  });

  it("tolerates duplicate deliveries without failing or double-granting", () => {
    for (const src of [dodo, stripe]) {
      expect(src).toContain('code !== "23505"');
    }
    // credits are still granted exactly once via the dedupe-keyed ledger insert
    expect(dodo).toContain('`dodo_payment:${externalId}`');
    expect(stripe).toContain("`session:${session.id}`");
  });
});
