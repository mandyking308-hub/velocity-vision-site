import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("Free Preview guided setup", () => {
  const setup = read("src/components/app/SetupWizard.tsx");

  it("never tells a Free Preview customer to buy or top up credits", () => {
    expect(setup).not.toContain("Decide: buy credits or upgrade");
    expect(setup).not.toContain("top up credits or upgrade");
    expect(setup).toContain("Credit top-ups are available only after moving to an eligible paid workspace.");
  });

  it("keeps social content in review mode until a paid plan", () => {
    expect(setup).toContain("Social content stays in review mode during Free Preview");
    expect(setup).toContain("Buffer connection and handoff are paid-plan activation features");
  });
});

describe("Free Preview Buffer UI gates", () => {
  const settings = read("src/components/app/BufferSettingsCard.tsx");
  const readiness = read("src/components/app/BufferReadinessCard.tsx");
  const dialog = read("src/components/app/SendToBufferDialog.tsx");

  it("offers plan comparison rather than Buffer connection in Free Preview settings", () => {
    expect(settings).toContain("isFreePreview");
    expect(settings).toContain("Buffer connection and handoff unlock on paid plans");
    expect(settings).toContain('to="/pricing">Compare paid plans');
  });

  it("labels Buffer as paid activation on the dashboard", () => {
    expect(readiness).toContain("Paid activation");
    expect(readiness).toContain("Connecting Buffer and handing posts to external channels are available after moving to a paid plan");
  });

  it("does not call Buffer channels or create-post from the Free Preview path", () => {
    expect(dialog).toContain('if (!open || loadState !== "idle" || isFreePreview) return');
    expect(dialog).toContain("if (isFreePreview)");
    expect(dialog).toContain("Buffer handoff is available on paid plans");
  });
});

describe("authoritative Buffer paid-plan gates", () => {
  const oauthStart = read("supabase/functions/buffer-oauth-start/index.ts");
  const oauthCallback = read("supabase/functions/buffer-oauth-callback/index.ts");
  const channels = read("supabase/functions/buffer-channels/index.ts");
  const createPost = read("supabase/functions/buffer-create-post/index.ts");

  it.each([
    ["oauth start", oauthStart],
    ["oauth callback", oauthCallback],
    ["channels", channels],
    ["create post", createPost],
  ])("%s rechecks effective paid entitlement", (_label, source) => {
    expect(source).toContain("effective_plan_for_actions");
    expect(source).toContain('"starter", "growth", "agency"');
    expect(source).toContain("paid_plan_required");
  });
});
