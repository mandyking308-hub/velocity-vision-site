import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// Cron-driven. Picks scheduled emails whose scheduled_for is in the past and sends them.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Shared-secret check — only the configured pg_cron job (or an operator with the
  // CRON_SECRET) may invoke this endpoint. Without this anyone with the URL could
  // trigger early delivery of all queued mail. The service-role key is also accepted
  // so the cron job can authenticate with the existing vault-held service-role secret.
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


  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: due } = await admin
    .from("email_sends")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .limit(25);

  // Delivery via the project's verified platform sender (same live path used by the
  // contact form). Used when the workspace mailbox cannot send by SMTP itself.
  async function deliverViaPlatform(s: any) {
    const { data, error } = await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "scheduled-outreach",
        recipientEmail: s.recipient_email,
        // Derived from the row id, so provider retries can never duplicate a send.
        idempotencyKey: `scheduled-send-${s.id}`,
        templateData: {
          subject: s.subject,
          body: s.body,
          recipientName: s.recipient_name ?? null,
          senderName: "Velocity Vision",
        },
      },
    });
    if (error) throw new Error(`platform_send_failed: ${String((error as Error).message).slice(0, 300)}`);
    if (!data?.success) throw new Error(`platform_send_rejected: ${data?.reason ?? data?.error ?? "unknown"}`);
    return data;
  }

  const results: any[] = [];
  for (const s of due || []) {
    // Atomic claim: only the worker that flips scheduled -> sending processes this row.
    const { data: claimed } = await admin
      .from("email_sends")
      .update({ status: "sending" })
      .eq("id", s.id)
      .eq("status", "scheduled")
      .select("id");
    if (!claimed || claimed.length === 0) {
      results.push({ id: s.id, ok: false, error: "already_claimed" });
      continue;
    }

    try {
      const { data: conn } = s.connection_id
        ? await admin.from("email_connections").select("*").eq("id", s.connection_id).single()
        : { data: null };

      // Can this mailbox send by its own SMTP credentials?
      let smtpPassword: string | null = null;
      if (conn && conn.auth_type === "smtp" && conn.sending_enabled === true && conn.smtp_host) {
        const { data: secret } = await admin
          .from("email_connection_secrets")
          .select("encrypted_password")
          .eq("connection_id", conn.id)
          .maybeSingle();
        if (secret?.encrypted_password) smtpPassword = await decryptSecret(secret.encrypted_password);
      }

      let channel: string;
      if (smtpPassword) {
        await smtpSend(
          { host: conn.smtp_host, port: conn.smtp_port, username: conn.smtp_username, password: smtpPassword },
          { fromEmail: conn.from_email, fromName: conn.from_name, to: s.recipient_email, subject: s.subject, body: s.body },
        );
        channel = "smtp";
      } else {
        // No usable mailbox SMTP credential (OAuth/Nylas mailbox, sending disabled,
        // or no connection): deliver through the verified platform sender instead.
        await deliverViaPlatform(s);
        channel = "platform";
      }

      const sentAt = new Date().toISOString();
      await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", s.id);
      if (s.lead_id) {
        await admin.from("leads").update({
          last_email_sent_at: sentAt, last_email_subject: s.subject,
          last_action: `Email sent: ${s.subject}`,
        }).eq("id", s.lead_id);
      }
      results.push({ id: s.id, ok: true, channel });
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[email-process-queue] send failed", s.id, msg);
      await admin.from("email_sends").update({ status: "failed", error: msg.slice(0, 500) }).eq("id", s.id);
      results.push({ id: s.id, ok: false, error: "send_failed" });
    }
  }
  return new Response(JSON.stringify({ processed: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
