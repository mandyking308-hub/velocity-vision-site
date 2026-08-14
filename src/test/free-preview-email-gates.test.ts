import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

const oauthStart = read("supabase/functions/nylas-auth-start/index.ts");
const oauthCallback = read("supabase/functions/nylas-auth-callback/index.ts");
const smtpSave = read("supabase/functions/email-connection-save/index.ts");
const verifyDomain = read("supabase/functions/verify-sender-domain/index.ts");
const queue = read("supabase/functions/email-process-queue/index.ts");
const migration = read("supabase/migrations/20260814125500_customer_send_plan_gate.sql");
const ui = read("src/pages/app/AppEmailConnections.tsx");

describe("Free Preview live mailbox gates", () => {
  it.each([
    ["Nylas OAuth start", oauthStart],
    ["Nylas OAuth callback", oauthCallback],
    ["SMTP connection save", smtpSave],
    ["sender verification", verifyDomain],
  ])("%s requires an effective paid plan server-side", (_name, source) => {
    expect(source).toContain("effective_plan_for_actions");
    expect(source).toContain('"starter", "growth", "agency"');
    expect(source).toContain("paid_plan_required");
  });

  it("checks SMTP entitlement before attempting credential verification", () => {
    expect(smtpSave.indexOf("effective_plan_for_actions")).toBeLessThan(smtpSave.indexOf("smtpVerify("));
  });

  it("checks Nylas entitlement before constructing an external auth URL", () => {
    expect(oauthStart.indexOf("effective_plan_for_actions")).toBeLessThan(oauthStart.indexOf("/v3/connect/auth"));
  });

  it("rechecks entitlement in the Nylas callback before exchanging the code", () => {
    expect(oauthCallback.indexOf("effective_plan_for_actions")).toBeLessThan(oauthCallback.indexOf("/v3/connect/token"));
  });

  it("keeps the customer UI review-only on Free Preview", () => {
    expect(ui).toContain("if (isFreePreview)");
    expect(ui).toContain("Free Preview supports campaign building and review, not live mailbox connection or sending.");
    expect(ui).toContain('disabled={isFreePreview}');
  });
});

describe("authoritative customer send gate", () => {
  it("blocks Free Preview/expired plans on customer email_sends insert or queue claim", () => {
    expect(migration).toContain("enforce_paid_plan_customer_send");
    expect(migration).toContain("effective_plan_for_actions");
    expect(migration).toContain("plan_send_not_permitted");
    expect(migration).toContain("before insert or update of status on public.email_sends");
  });

  it("preserves internal founder/admin operations", () => {
    expect(migration).toContain("has_role(actor, 'admin')");
    expect(migration).toContain("has_role(actor, 'founder')");
  });
});

describe("scheduled delivery rechecks current safety", () => {
  it("rechecks paid plan, legal acceptance, sender, recipient and daily cap", () => {
    for (const marker of [
      "effective_plan_for_actions",
      "legal_acceptances",
      "email_connections",
      "quality_status",
      "daily_cap_reached",
    ]) expect(queue).toContain(marker);
  });

  it("does not fall back to Velocity's platform sender for customer outreach", () => {
    expect(queue).not.toContain("send-transactional-email");
    expect(queue).not.toContain("deliverViaPlatform");
    expect(queue).toContain('channel: "smtp"');
  });

  it("requires a ready customer SMTP sender for scheduled delivery", () => {
    expect(queue).toContain('conn.auth_type !== "smtp"');
    expect(queue).toContain('conn.sending_enabled !== true');
    expect(queue).toContain("Scheduled delivery currently requires a ready SMTP sender.");
  });
});
