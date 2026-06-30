import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// Sends one email or schedules it. Body: { send_id?: uuid, OR full send draft }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();

    let sendRow: any;
    if (body.send_id) {
      const { data, error } = await admin.from("email_sends").select("*").eq("id", body.send_id).eq("user_id", user.id).single();
      if (error || !data) return json({ error: "send not found" }, 404);
      sendRow = data;
    } else {
      // Create
      const insert = {
        user_id: user.id,
        workspace_id: body.workspace_id || null,
        campaign_id: body.campaign_id || null,
        lead_id: body.lead_id || null,
        connection_id: body.connection_id,
        recipient_email: body.recipient_email,
        recipient_name: body.recipient_name || null,
        subject: body.subject,
        body: body.body,
        sequence_step: body.sequence_step ?? null,
        scheduled_for: body.scheduled_for || null,
        status: body.scheduled_for ? "scheduled" : "sending",
      };
      const { data, error } = await admin.from("email_sends").insert(insert).select().single();
      if (error) {
        console.error("[email-send] insert failed", error);
        return json({ error: "Could not queue email. Please retry." }, 400);
      }
      sendRow = data;
    }

    // If scheduled in the future, just return — queue picks it up.
    if (sendRow.scheduled_for && new Date(sendRow.scheduled_for) > new Date()) {
      await admin.from("email_sends").update({ status: "scheduled" }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "scheduled" });
    }

    // Send now.
    const { data: conn } = await admin.from("email_connections").select("*").eq("id", sendRow.connection_id).eq("user_id", user.id).single();
    if (!conn) {
      await admin.from("email_sends").update({ status: "failed", error: "Email connection not found" }).eq("id", sendRow.id);
      return json({ error: "connection not found" }, 400);
    }

    // RATE LIMIT: refuse to send if the connection has hit its hourly cap.
    const limit = conn.rate_limit_per_hour ?? 60;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await admin.from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("connection_id", conn.id)
      .eq("status", "sent")
      .gte("sent_at", oneHourAgo);
    if ((recentCount ?? 0) >= limit) {
      const retryMsg = `Rate limit reached (${limit}/hr). Try again later or raise the connection's hourly limit.`;
      await admin.from("email_sends").update({ status: "scheduled", scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(), error: retryMsg }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "rate_limited", retryInMinutes: 15 }, 429);
    }

    const { data: secret } = await admin.from("email_connection_secrets").select("encrypted_password").eq("connection_id", conn.id).single();
    if (!secret) {
      await admin.from("email_sends").update({ status: "failed", error: "No SMTP password stored" }).eq("id", sendRow.id);
      return json({ error: "no smtp password" }, 400);
    }
    const password = await decryptSecret(secret.encrypted_password);

    try {
      await smtpSend(
        { host: conn.smtp_host, port: conn.smtp_port, username: conn.smtp_username, password },
        { fromEmail: conn.from_email, fromName: conn.from_name, to: sendRow.recipient_email, subject: sendRow.subject, body: sendRow.body },
      );
      const sentAt = new Date().toISOString();
      await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", sendRow.id);
      if (sendRow.lead_id) {
        await admin.from("leads").update({
          last_email_sent_at: sentAt,
          last_email_subject: sendRow.subject,
          last_action: `Email sent: ${sendRow.subject}`,
        }).eq("id", sendRow.lead_id);
      }
      await admin.from("email_connections").update({ status: "connected", last_error: null, last_verified_at: sentAt }).eq("id", conn.id);
      return json({ id: sendRow.id, status: "sent" });
    } catch (e) {
      const msg = (e as Error).message;
      console.error("[email-send] SMTP failure", msg);
      await admin.from("email_sends").update({ status: "failed", error: msg }).eq("id", sendRow.id);
      await admin.from("email_connections").update({ status: "error", last_error: msg }).eq("id", conn.id);
      // Don't leak raw upstream SMTP banners — keep full detail in logs only.
      return json({ error: "Send failed at the upstream SMTP server. Check sender configuration." }, 502);
    }
  } catch (e) {
    console.error("[email-send] unhandled", (e as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
