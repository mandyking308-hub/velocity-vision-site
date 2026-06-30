import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// Cron-driven. Picks scheduled emails whose scheduled_for is in the past and sends them.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Shared-secret check — only the configured pg_cron job (or an operator with the
  // CRON_SECRET) may invoke this endpoint. Without this anyone with the URL could
  // trigger early delivery of all queued mail.
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
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

  const results: any[] = [];
  for (const s of due || []) {
    await admin.from("email_sends").update({ status: "sending" }).eq("id", s.id);
    try {
      const { data: conn } = await admin.from("email_connections").select("*").eq("id", s.connection_id).single();
      if (!conn) throw new Error("connection missing");
      const { data: secret } = await admin.from("email_connection_secrets").select("encrypted_password").eq("connection_id", conn.id).single();
      if (!secret) throw new Error("no smtp password");
      const password = await decryptSecret(secret.encrypted_password);
      await smtpSend(
        { host: conn.smtp_host, port: conn.smtp_port, username: conn.smtp_username, password },
        { fromEmail: conn.from_email, fromName: conn.from_name, to: s.recipient_email, subject: s.subject, body: s.body },
      );
      const sentAt = new Date().toISOString();
      await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", s.id);
      if (s.lead_id) {
        await admin.from("leads").update({
          last_email_sent_at: sentAt, last_email_subject: s.subject,
          last_action: `Email sent: ${s.subject}`,
        }).eq("id", s.lead_id);
      }
      results.push({ id: s.id, ok: true });
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[email-process-queue] send failed", s.id, msg);
      // Persist full detail for the operator (status row) but don't leak the raw
      // upstream banner back to whatever called the function.
      await admin.from("email_sends").update({ status: "failed", error: msg }).eq("id", s.id);
      results.push({ id: s.id, ok: false, error: "send_failed" });
    }
  }
  return new Response(JSON.stringify({ processed: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
