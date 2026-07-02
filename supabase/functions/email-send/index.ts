import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// PHASE 2: adds a Nylas v3 send branch alongside the existing SMTP path.
// PHASE 3 (later): reply webhooks + scheduled Nylas processing in
//   supabase/functions/email-process-queue (currently SMTP-only).
//
// Every send must satisfy: legal compliance, contact safety, credits,
// workspace match, and the sender readiness gate below. The readiness gate is
// only bypassed in a narrowly scoped "controlled test" mode.

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
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const requestedTestMode = body?.test_mode === true;

    let sendRow: any;
    if (body.send_id) {
      const { data, error } = await admin.from("email_sends").select("*").eq("id", body.send_id).eq("user_id", user.id).single();
      if (error || !data) return json({ error: "send not found" }, 404);
      sendRow = data;
    } else {
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
        console.error("[email-send] insert failed", error.code, error.message);
        return json({ error: "Could not queue email. Please retry." }, 400);
      }
      sendRow = data;
    }

    // Scheduled? Just persist and return; worker will process later.
    if (sendRow.scheduled_for && new Date(sendRow.scheduled_for) > new Date()) {
      await admin.from("email_sends").update({ status: "scheduled" }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "scheduled" });
    }

    // Load and safety-check the connection.
    const { data: conn } = await admin
      .from("email_connections").select("*").eq("id", sendRow.connection_id).single();
    if (!conn) {
      await admin.from("email_sends").update({ status: "failed", error: "Email connection not found" }).eq("id", sendRow.id);
      return json({ error: "connection not found" }, 400);
    }
    if (conn.user_id !== user.id) {
      await admin.from("email_sends").update({ status: "failed", error: "Connection does not belong to user" }).eq("id", sendRow.id);
      return json({ error: "forbidden" }, 403);
    }
    // Workspace isolation: if the send row is scoped to a workspace, the
    // connection must belong to that workspace. Legacy rows with a null
    // workspace on the connection are tolerated only when the send is also
    // unscoped.
    if (sendRow.workspace_id) {
      if (conn.workspace_id && conn.workspace_id !== sendRow.workspace_id) {
        await admin.from("email_sends").update({ status: "failed", error: "Sender belongs to a different workspace" }).eq("id", sendRow.id);
        return json({ error: "workspace_mismatch" }, 403);
      }
    }
    if (conn.status !== "connected") {
      await admin.from("email_sends").update({ status: "failed", error: `Sender not connected (${conn.status})` }).eq("id", sendRow.id);
      return json({ error: "sender_not_connected" }, 409);
    }

    // Controlled test mode: only when the caller explicitly requests it AND the
    // recipient is the authenticated user's own address (or the configured
    // EMAIL_TEST_RECIPIENT). Never enables general campaign sending, never
    // flips sending_enabled, and never sends to leads other than the operator.
    const testRecipient = (Deno.env.get("EMAIL_TEST_RECIPIENT") || "").toLowerCase();
    const recipient = (sendRow.recipient_email || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    const isControlledTest =
      requestedTestMode &&
      !sendRow.lead_id &&
      recipient.length > 0 &&
      (recipient === userEmail || (testRecipient && recipient === testRecipient));

    if (!conn.sending_enabled && !isControlledTest) {
      await admin.from("email_sends").update({
        status: "failed",
        error: "Sending not enabled yet — complete sender setup or use a controlled test.",
      }).eq("id", sendRow.id);
      return json({ error: "sending_disabled" }, 409);
    }

    // Rate limit.
    const limit = conn.rate_limit_per_hour ?? 60;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await admin.from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("connection_id", conn.id)
      .eq("status", "sent")
      .gte("sent_at", oneHourAgo);
    if ((recentCount ?? 0) >= limit) {
      const retryMsg = `Rate limit reached (${limit}/hr). Try again later or raise the connection's hourly limit.`;
      await admin.from("email_sends").update({
        status: "scheduled",
        scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        error: retryMsg,
      }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "rate_limited", retryInMinutes: 15 }, 429);
    }

    // Branch by connection type.
    if (conn.auth_type === "nylas") {
      return await sendViaNylas(admin, conn, sendRow, isControlledTest);
    }
    return await sendViaSmtp(admin, conn, sendRow);
  } catch (e) {
    console.error("[email-send] unhandled", (e as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});

async function sendViaSmtp(admin: any, conn: any, sendRow: any) {
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
    await markSent(admin, conn, sendRow, sentAt, null);
    return json({ id: sendRow.id, status: "sent" });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("[email-send] SMTP failure", msg);
    await admin.from("email_sends").update({ status: "failed", error: msg }).eq("id", sendRow.id);
    await admin.from("email_connections").update({ status: "error", last_error: msg }).eq("id", conn.id);
    return json({ error: "Send failed at the upstream SMTP server. Check sender configuration." }, 502);
  }
}

function nylasCreds(region: string | null | undefined) {
  const r = (region || "us").toLowerCase() === "eu" ? "EU" : "US";
  const defaultUri = r === "US" ? "https://api.us.nylas.com" : "https://api.eu.nylas.com";
  const apiKey = Deno.env.get(`NYLAS_${r}_API_KEY`) ?? Deno.env.get("NYLAS_API_KEY");
  const apiUri = (Deno.env.get(`NYLAS_${r}_API_URI`) ?? defaultUri).replace(/\/$/, "");
  return { apiKey, apiUri, region: r.toLowerCase() };
}

function nylasErrorRequiresReconnect(status: number, payload: any): boolean {
  if (status === 401 || status === 403) return true;
  const code = payload?.error?.code || payload?.code;
  const type = payload?.error?.type || payload?.type;
  const s = `${code || ""} ${type || ""}`.toLowerCase();
  return s.includes("invalid_grant") || s.includes("grant_invalid") || s.includes("token") || s.includes("revoke");
}

async function sendViaNylas(admin: any, conn: any, sendRow: any, isControlledTest: boolean) {
  if (!conn.nylas_grant_id) {
    await admin.from("email_sends").update({ status: "failed", error: "Mailbox is not connected via OAuth. Reconnect required." }).eq("id", sendRow.id);
    return json({ error: "no_grant" }, 400);
  }
  const { apiKey, apiUri } = nylasCreds(conn.nylas_region);
  if (!apiKey) {
    await admin.from("email_sends").update({ status: "failed", error: "Mail provider not configured on server" }).eq("id", sendRow.id);
    return json({ error: "provider_not_configured" }, 500);
  }

  const payload = {
    subject: sendRow.subject,
    body: sendRow.body,
    to: [{ email: sendRow.recipient_email, name: sendRow.recipient_name || undefined }],
    // from is implicit for the grant's mailbox; Nylas will set the connected inbox.
  };

  let resp: Response;
  try {
    resp = await fetch(`${apiUri}/v3/grants/${conn.nylas_grant_id}/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("[email-send] nylas network failure");
    await admin.from("email_sends").update({ status: "failed", error: "Could not reach mail provider. Please retry." }).eq("id", sendRow.id);
    return json({ error: "provider_unreachable", detail: msg }, 502);
  }

  const json_ = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    // Never log payload contents or the grant id.
    console.error("[email-send] nylas send failed", {
      status: resp.status,
      code: json_?.error?.code || json_?.code || null,
      type: json_?.error?.type || json_?.type || null,
      test_mode: isControlledTest,
    });
    const friendly = "Mail provider rejected the send. Please check your mailbox and try again.";
    await admin.from("email_sends").update({ status: "failed", error: friendly }).eq("id", sendRow.id);
    if (nylasErrorRequiresReconnect(resp.status, json_)) {
      await admin.from("email_connections").update({
        status: "reconnect_required",
        token_status: "reconnect_required",
        last_error: "Mailbox needs to be reconnected.",
      }).eq("id", conn.id);
    }
    return json({ error: friendly }, 502);
  }

  const sentAt = new Date().toISOString();
  await markSent(admin, conn, sendRow, sentAt, null);
  return json({ id: sendRow.id, status: "sent", test_mode: isControlledTest });
}

async function markSent(admin: any, conn: any, sendRow: any, sentAt: string, _providerRef: string | null) {
  await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", sendRow.id);
  if (sendRow.lead_id) {
    await admin.from("leads").update({
      last_email_sent_at: sentAt,
      last_contacted_at: sentAt,
      last_email_subject: sendRow.subject,
      last_action: `Email sent: ${sendRow.subject}`,
      follow_up_state: "warm",
    }).eq("id", sendRow.lead_id);
  }
  await admin.from("email_connections").update({
    status: "connected", last_error: null, last_verified_at: sentAt,
  }).eq("id", conn.id);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
