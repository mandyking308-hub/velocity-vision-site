import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const how = readFileSync("src/pages/HowItWorks.tsx", "utf8");
const support = readFileSync("src/lib/supportKnowledge.ts", "utf8");

describe("public self-serve activation truth", () => {
  it("does not make onboarding a prerequisite for paid activation", () => {
    expect(how).not.toContain("Paid activation follows onboarding");
    expect(how).toContain("Paid activation is self-serve after purchase");
    expect(how).toContain("optional setup guidance is available but is never required for checkout");
  });

  it("explains that sender connection belongs to paid activation", () => {
    expect(how).toContain("Connect and verify the customer's sender for paid activation");
    expect(how).toContain("Free Preview remains review-only and does not connect a live sender");
  });

  it("keeps support guidance consistent with the paid sender gate", () => {
    expect(support).toContain("Live mailbox connection and sender verification are paid-plan activation features");
    expect(support).toContain("Free Preview does not connect a live mailbox or send");
  });
});
