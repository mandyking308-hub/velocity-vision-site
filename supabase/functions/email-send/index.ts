import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptSecret } from "../_shared/email-crypto.ts";
import { smtpSend } from "../_shared/smtp-send.ts";

// Provider-agnostic send engine.
// Every non-test send must satisfy:
//   auth, ownership, workspace match, legal compliance, sender readiness,
//   contact safety, warm-up/plan daily cap, hourly rate limit.
// Controlled test mode is narrowly scoped to the operator's own address.

const PERSONAL_MAILBOX_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "proton.me", "protonmail.com",
]);

// Kept in lockstep with src/lib/legalVersions.ts. When client versions bump,
// bump these too — the server independently gates on current versions.
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

// Canonical server-side daily ceilings. Kept in lockstep with
// src/lib/sendSafety.ts (PLAN_DAILY_CEILING). Warm-up and sender health may
// reduce the effective ceiling; nothing may exceed it.
// Free Preview is 0: the preview tier can explore the whole workflow but may
// never make a real (non controlled-test) send.
const WARMUP_DAILY_CAP: Record<string, number> = {
  free_preview: 0, starter: 20, growth: 50, agency: 100,
};
// Warm-up-only senders (custom domain not yet fully verified) are additionally
// held to this reduced allowance.
const WARMUP_WARMING_CAP = 20;



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

    // Load and safety-check the connection.
    const { data: conn } = await admin
      .from("email_connections").select("*").eq("id", sendRow.connection_id).single();
    if (!conn) {
      await fail(admin, sendRow.id, "Email connection not found");
      return json({ error: "connection not found" }, 400);
    }
    if (conn.user_id !== user.id) {
      await fail(admin, sendRow.id, "Connection does not belong to user");
      return json({ error: "forbidden" }, 403);
    }
    if (sendRow.workspace_id && conn.workspace_id && conn.workspace_id !== sendRow.workspace_id) {
      await fail(admin, sendRow.id, "Sender belongs to a different workspace");
      return json({ error: "workspace_mismatch" }, 403);
    }
    if (conn.status !== "connected") {
      await fail(admin, sendRow.id, `Sender not connected (${conn.status})`);
      return json({ error: "sender_not_connected" }, 409);
    }

    // Controlled test mode: only when the caller explicitly asks AND the
    // recipient is the operator's own address (or configured EMAIL_TEST_RECIPIENT).
    const testRecipient = (Deno.env.get("EMAIL_TEST_RECIPIENT") || "").toLowerCase();
    const recipient = (sendRow.recipient_email || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    const isControlledTest =
      requestedTestMode &&
      !sendRow.lead_id &&
      recipient.length > 0 &&
      (recipient === userEmail || (testRecipient && recipient === testRecipient));

    if (!isControlledTest) {
      // Real send — apply full gate stack.
      const gate = await runSendGates(admin, user.id, conn, sendRow);
      if (!gate.ok) {
        await fail(admin, sendRow.id, gate.reason);
        return json({ error: gate.code, reason: gate.reason }, gate.status);
      }
    }

    // Scheduled? SMTP only — Nylas scheduled sending is Phase 2C.
    if (sendRow.scheduled_for && new Date(sendRow.scheduled_for) > new Date()) {
      if (conn.auth_type === "nylas") {
        await fail(admin, sendRow.id, "Scheduling for OAuth mailboxes is coming next — send now or use SMTP for scheduled sends.");
        return json({ error: "nylas_scheduling_unsupported" }, 400);
      }
      await admin.from("email_sends").update({ status: "scheduled" }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "scheduled" });
    }

    // Hourly rate limit.
    const limit = conn.rate_limit_per_hour ?? 60;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await admin.from("email_sends")
      .select("id", { count: "exact", head: true })
      .eq("connection_id", conn.id)
      .eq("status", "sent")
      .gte("sent_at", oneHourAgo);
    if ((recentCount ?? 0) >= limit) {
      const retryMsg = `Rate limit reached (${limit}/hr). Try again later.`;
      await admin.from("email_sends").update({
        status: "scheduled",
        scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        error: retryMsg,
      }).eq("id", sendRow.id);
      return json({ id: sendRow.id, status: "rate_limited", retryInMinutes: 15 }, 429);
    }

    if (conn.auth_type === "nylas") {
      return await sendViaNylas(admin, conn, sendRow, isControlledTest);
    }
    return await sendViaSmtp(admin, conn, sendRow);
  } catch (e) {
    console.error("[email-send] unhandled", (e as Error).message);
    return json({ error: "Internal error" }, 500);
  }
});

async function runSendGates(admin: any, userId: string, conn: any, sendRow: any):
  Promise<{ ok: true } | { ok: false; code: string; reason: string; status: number }> {
  // 1. Legal compliance — most-recent acceptance row must cover all required
  //    slugs at their current versions.
  const { data: legalRows } = await admin
    .from("legal_acceptances")
    .select("document_versions, accepted_at")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false })
    .limit(1);
  const dv = (legalRows?.[0]?.document_versions ?? {}) as Record<string, string>;
  const missing = REQUIRED_LEGAL_SLUGS.filter((s) => dv[s] !== CURRENT_LEGAL_VERSIONS[s]);
  if (missing.length > 0) {
    return { ok: false, code: "legal_not_current",
      reason: "Accept the current platform terms before sending.", status: 412 };
  }

  // 2. Sender readiness — must permit warm-up or full sending.
  const domain = (conn.domain || (conn.from_email || "").split("@")[1] || "").toLowerCase();
  const personal = PERSONAL_MAILBOX_DOMAINS.has(domain);
  const isNylas = conn.auth_type === "nylas" && !!conn.nylas_grant_id;
  const canWarmup = isNylas || conn.sending_enabled === true;
  const canFull = conn.sending_enabled === true || (isNylas && personal);
  if (!canWarmup) {
    return { ok: false, code: "sender_not_ready",
      reason: "Sender is not ready to send. Complete sender setup.", status: 409 };
  }
  // Custom-domain Nylas or SMTP without sending_enabled = warm-up only.
  const warmupOnly = !canFull;

  // 3. Contact safety when targeting a lead.
  if (sendRow.lead_id) {
    const { data: lead } = await admin.from("leads")
      .select("id, contact_id, workspace_id").eq("id", sendRow.lead_id).single();
    if (!lead) return { ok: false, code: "lead_missing", reason: "Lead not found.", status: 404 };
    if (sendRow.workspace_id && lead.workspace_id && lead.workspace_id !== sendRow.workspace_id) {
      return { ok: false, code: "workspace_mismatch", reason: "Lead is in a different workspace.", status: 403 };
    }
    if (lead.contact_id) {
      const { data: contact } = await admin.from("contacts")
        .select("quality_status, email").eq("id", lead.contact_id).single();
      const q = (contact?.quality_status || "").toLowerCase();
      if (q === "blocked" || q === "suppressed") {
        return { ok: false, code: "recipient_blocked",
          reason: "Recipient is blocked or suppressed and cannot be contacted.", status: 409 };
      }
      if (q === "risky") {
        return { ok: false, code: "recipient_risky",
          reason: "Risky recipient — include via governed activation only.", status: 409 };
      }
    }
  }

  // 4. Plan gate + daily warm-up / plan cap.
  //    Fails closed: an unknown or missing plan cannot send, and free_preview
  //    is never allowed to fall back to a paid tier's allowance.
  const { data: plan } = await admin.from("user_plans")
    .select("plan").eq("user_id", userId).maybeSingle();
  const planId = String(plan?.plan || "").toLowerCase();
  if (!planId || !(planId in WARMUP_DAILY_CAP)) {
    return { ok: false, code: "plan_not_recognised",
      reason: "No active plan found for this account. Sending is disabled.", status: 402 };
  }
  const cap = WARMUP_DAILY_CAP[planId];
  if (cap <= 0) {
    return { ok: false, code: "plan_send_not_permitted",
      reason: "Free Preview cannot send live outreach. Upgrade to activate sending.", status: 402 };
  }
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const { count: sentToday } = await admin.from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "sent")
    .gte("sent_at", todayStart.toISOString());
  // Warm-up may only reduce the plan ceiling, never raise it.
  const effectiveCap = warmupOnly ? Math.min(cap, WARMUP_WARMING_CAP) : cap;
  if ((sentToday ?? 0) >= effectiveCap) {
    return { ok: false, code: "daily_cap_reached",
      reason: `Daily send cap of ${effectiveCap} reached for your plan/warm-up.`, status: 429 };
  }


  return { ok: true };
}

async function fail(admin: any, sendId: string, msg: string) {
  await admin.from("email_sends").update({ status: "failed", error: msg }).eq("id", sendId);
}

async function sendViaSmtp(admin: any, conn: any, sendRow: any) {
  const { data: secret } = await admin.from("email_connection_secrets").select("encrypted_password").eq("connection_id", conn.id).single();
  if (!secret) {
    await fail(admin, sendRow.id, "No SMTP password stored");
    return json({ error: "no smtp password" }, 400);
  }
  const password = await decryptSecret(secret.encrypted_password);
  try {
    await smtpSend(
      { host: conn.smtp_host, port: conn.smtp_port, username: conn.smtp_username, password },
      { fromEmail: conn.from_email, fromName: conn.from_name, to: sendRow.recipient_email, subject: sendRow.subject, body: sendRow.body },
    );
    const sentAt = new Date().toISOString();
    await markSent(admin, conn, sendRow, sentAt);
    return json({ id: sendRow.id, status: "sent" });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("[email-send] SMTP failure", msg);
    await fail(admin, sendRow.id, msg);
    await admin.from("email_connections").update({ status: "error", last_error: msg }).eq("id", conn.id);
    return json({ error: "Send failed at the upstream SMTP server." }, 502);
  }
}

function nylasCreds(region: string | null | undefined) {
  const r = (region || "us").toLowerCase() === "eu" ? "EU" : "US";
  const defaultUri = r === "US" ? "https://api.us.nylas.com" : "https://api.eu.nylas.com";
  const apiKey = Deno.env.get(`NYLAS_${r}_API_KEY`) ?? Deno.env.get("NYLAS_API_KEY");
  const apiUri = (Deno.env.get(`NYLAS_${r}_API_URI`) ?? defaultUri).replace(/\/$/, "");
  return { apiKey, apiUri };
}

function nylasErrorRequiresReconnect(status: number, payload: any): boolean {
  if (status === 401 || status === 403) return true;
  const s = `${payload?.error?.code || payload?.code || ""} ${payload?.error?.type || payload?.type || ""}`.toLowerCase();
  return s.includes("invalid_grant") || s.includes("grant_invalid") || s.includes("token") || s.includes("revoke");
}

async function sendViaNylas(admin: any, conn: any, sendRow: any, isControlledTest: boolean) {
  if (!conn.nylas_grant_id) {
    await fail(admin, sendRow.id, "Mailbox is not connected via OAuth. Reconnect required.");
    return json({ error: "no_grant" }, 400);
  }
  const { apiKey, apiUri } = nylasCreds(conn.nylas_region);
  if (!apiKey) {
    await fail(admin, sendRow.id, "Mail provider not configured on server");
    return json({ error: "provider_not_configured" }, 500);
  }

  const payload = {
    subject: sendRow.subject,
    body: sendRow.body,
    to: [{ email: sendRow.recipient_email, name: sendRow.recipient_name || undefined }],
  };

  let resp: Response;
  try {
    resp = await fetch(`${apiUri}/v3/grants/${conn.nylas_grant_id}/messages/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    await fail(admin, sendRow.id, "Could not reach mail provider. Please retry.");
    return json({ error: "provider_unreachable", detail: (e as Error).message }, 502);
  }

  const json_ = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error("[email-send] nylas send failed", {
      status: resp.status,
      code: json_?.error?.code || json_?.code || null,
      type: json_?.error?.type || json_?.type || null,
      test_mode: isControlledTest,
    });
    const friendly = "Mail provider rejected the send. Please check your mailbox and try again.";
    await fail(admin, sendRow.id, friendly);
    if (nylasErrorRequiresReconnect(resp.status, json_)) {
      await admin.from("email_connections").update({
        status: "reconnect_required", token_status: "reconnect_required",
        last_error: "Mailbox needs to be reconnected.",
      }).eq("id", conn.id);
    }
    return json({ error: friendly }, 502);
  }

  const sentAt = new Date().toISOString();
  await markSent(admin, conn, sendRow, sentAt);
  return json({ id: sendRow.id, status: "sent", test_mode: isControlledTest });
}

async function markSent(admin: any, conn: any, sendRow: any, sentAt: string) {
  await admin.from("email_sends").update({ status: "sent", sent_at: sentAt, error: null }).eq("id", sendRow.id);
  if (sendRow.lead_id) {
    await admin.from("leads").update({
      last_email_sent_at: sentAt, last_contacted_at: sentAt,
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
