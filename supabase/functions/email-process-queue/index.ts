import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// Cron-driven scheduled customer email worker.
// Critical rule: a queued message is NOT authority to send later. Paid plan,
// legal state, sender ownership/readiness, contact safety and the current daily
// ceiling are rechecked at delivery time. There is deliberately no platform-
// sender fallback for customer outreach: it must use the customer's own ready
// SMTP sender. Nylas scheduled sending remains unsupported.

const REQUIRED_LEGAL_SLUGS = [
  "terms-of-service",
  "client-services-agreement",
  "privacy-policy",
  "data-processing-agreement",
  "acceptable-use-policy",
  "marketing-compliance-policy",
  "cookie-policy",
  "platform-security-policy",
  "service-level-agreement",
  "subprocessors",
];
const CURRENT_LEGAL_VERSIONS: Record<string, string> = {
  "terms-of-service": "5.0",
  "client-services-agreement": "6.0",
  "privacy-policy": "8.0",
  "data-processing-agreement": "7.0",
  "acceptable-use-policy": "8.0",
  "marketing-compliance-policy": "10.0",
  "cookie-policy": "8.0",
  "platform-security-policy": "9.0",
  "service-level-agreement": "9.0",
  "subprocessors": "1.0",
};
const PLAN_DAILY_CAP: Record<string, number> = { starter: 20, growth: 50, agency: 100 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const queueToken = Deno.env.get("EMAIL_QUEUE_CRON_TOKEN");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authz = req.headers.get("Authorization") ?? "";
  const authorised =
    (!!cronSecret && authz === `Bearer ${cronSecret}`) ||
    (!!queueToken && authz === `Bearer ${queueToken}`) ||
    (!!serviceKey && authz === `Bearer ${serviceKey}`);

  if (!authorised) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey!);
  const { data: due } = await admin
    .from("email_sends")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .limit(25);

  const results: any[] = [];
  for (const s of due || []) {
    const preflight = await scheduledSendPreflight(admin, s);
    if (!preflight.ok) {
      await admin.from("email_sends").update({ status: "failed", error: preflight.reason }).eq("id", s.id).eq("status", "scheduled");
      results.push({ id: s.id, ok: false, error: preflight.code });
      continue;
    }

    // Atomic claim. The database trigger independently rechecks paid
    // entitlement on scheduled -> sending, so a downgrade between preflight
    // and this write still fails closed.
    const { data: claimed, error: claimErr } = await admin
      .from("email_sends")
      .update({ status: "sending" })
      .eq("id", s.id)
      .eq("status", "scheduled")
      .select("id");
    if (claimErr || !claimed || claimed.length === 0) {
      results.push({ id: s.id, ok: false, error: claimErr ? "claim_rejected" : "already_claimed" });
      continue;
    }

    try {
      const conn = preflight.connection;
      const { data: secret } = await admin
        .from("email_connection_secrets")
        .select("encrypted_password")
        .eq("connection_id", conn.id)
        .maybeSingle();
      if (!secret?.encrypted_password) throw new Error("sender_secret_missing");
      const smtpPassword = await decryptSecret(secret.encrypted_password);

      await smtpSend(
        { host: conn.smtp_host, port: conn.smtp_port, username: conn.smtp_username, password: smtpPassword },
        { fromEmail: conn.from_email, fromName: conn.from_name, to: s.recipient_email, subject: s.subject, body: s.body },
      );

      const sentAt = new Date().toISOString();
      await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", s.id);
      if (s.lead_id) {
        await admin.from("leads").update({
          last_email_sent_at: sentAt,
          last_email_subject: s.subject,
          last_action: `Email sent: ${s.subject}`,
        }).eq("id", s.lead_id);
      }
      results.push({ id: s.id, ok: true, channel: "smtp" });
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[email-process-queue] send failed", s.id, msg);
      await admin.from("email_sends").update({ status: "failed", error: msg.slice(0, 500) }).eq("id", s.id);
      results.push({ id: s.id, ok: false, error: "send_failed" });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

async function scheduledSendPreflight(admin: any, s: any): Promise<
  { ok: true; connection: any } | { ok: false; code: string; reason: string }
> {
  if (!s.user_id) return { ok: false, code: "missing_user", reason: "Scheduled send has no customer owner." };

  const { data: effectivePlan, error: planErr } = await admin.rpc("effective_plan_for_actions", { _user_id: s.user_id });
  if (planErr || !effectivePlan || !(String(effectivePlan) in PLAN_DAILY_CAP)) {
    return { ok: false, code: "plan_send_not_permitted", reason: "Active paid plan required at delivery time." };
  }
  const cap = PLAN_DAILY_CAP[String(effectivePlan)];

  const { data: legalRows } = await admin
    .from("legal_acceptances")
    .select("document_versions, accepted_at")
    .eq("user_id", s.user_id)
    .order("accepted_at", { ascending: false })
    .limit(1);
  const versions = (legalRows?.[0]?.document_versions ?? {}) as Record<string, string>;
  const missing = REQUIRED_LEGAL_SLUGS.filter((slug) => versions[slug] !== CURRENT_LEGAL_VERSIONS[slug]);
  if (missing.length > 0) {
    return { ok: false, code: "legal_not_current", reason: "Current legal terms must be accepted before delivery." };
  }

  if (!s.connection_id) {
    return { ok: false, code: "connection_required", reason: "A customer sender connection is required." };
  }
  const { data: conn } = await admin.from("email_connections").select("*").eq("id", s.connection_id).maybeSingle();
  if (!conn || conn.user_id !== s.user_id) {
    return { ok: false, code: "connection_forbidden", reason: "Sender connection does not belong to this customer." };
  }
  if (s.workspace_id && conn.workspace_id && s.workspace_id !== conn.workspace_id) {
    return { ok: false, code: "workspace_mismatch", reason: "Sender belongs to a different workspace." };
  }
  if (conn.status !== "connected" || conn.sending_enabled !== true) {
    return { ok: false, code: "sender_not_ready", reason: "Sender is not currently ready for delivery." };
  }
  if (conn.auth_type !== "smtp" || !conn.smtp_host || !conn.smtp_username) {
    return { ok: false, code: "scheduled_sender_unsupported", reason: "Scheduled delivery currently requires a ready SMTP sender." };
  }

  if (s.lead_id) {
    const { data: lead } = await admin.from("leads").select("id, contact_id, workspace_id").eq("id", s.lead_id).maybeSingle();
    if (!lead) return { ok: false, code: "lead_missing", reason: "Lead no longer exists." };
    if (s.workspace_id && lead.workspace_id && s.workspace_id !== lead.workspace_id) {
      return { ok: false, code: "workspace_mismatch", reason: "Lead belongs to a different workspace." };
    }
    if (lead.contact_id) {
      const { data: contact } = await admin.from("contacts").select("quality_status").eq("id", lead.contact_id).maybeSingle();
      const q = String(contact?.quality_status ?? "").toLowerCase();
      if (q === "blocked" || q === "suppressed") {
        return { ok: false, code: "recipient_blocked", reason: "Recipient is blocked or suppressed." };
      }
      if (q === "risky") {
        return { ok: false, code: "recipient_risky", reason: "Recipient requires renewed customer review." };
      }
    }
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { count: sentToday } = await admin.from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("user_id", s.user_id)
    .eq("status", "sent")
    .gte("sent_at", todayStart.toISOString());
  if ((sentToday ?? 0) >= cap) {
    return { ok: false, code: "daily_cap_reached", reason: `Daily send cap of ${cap} reached for the current plan.` };
  }

  return { ok: true, connection: conn };
}
