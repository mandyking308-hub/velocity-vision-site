import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CONTACT_NOTIFY_TO = Deno.env.get("CONTACT_NOTIFY_TO");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Velocity Vision <notifications@velocity-outreach.com>";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body: Record<string, any> = {};
  try { body = await req.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const ticketId = String(body.ticket_id ?? "").trim();
  if (!ticketId) return json({ ok: false, error: "missing_ticket_id" }, 400);

  const sb = admin();
  const { data: ticket, error } = await sb
    .from("support_tickets")
    .select("id, user_id, email, workspace_id, route, category, severity, subject, message, diagnostics, browser_info, source, created_at")
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !ticket) {
    return json({ ok: false, error: "ticket_not_found" }, 404);
  }

  if (!RESEND_API_KEY || !CONTACT_NOTIFY_TO) {
    await logError("support-notify: missing config");
    return json({ ok: true, notified: false, reason: "missing_config" });
  }

  const severity = String(ticket.severity ?? "normal");
  const subject = `[Velocity Vision Support] ${severity.toUpperCase()} — ${ticket.subject ?? "New ticket"}`;

  const diagPretty = (() => {
    try { return JSON.stringify(ticket.diagnostics ?? {}, null, 2); } catch { return String(ticket.diagnostics ?? ""); }
  })();

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px">New support ticket — ${esc(severity)}</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Ticket ID</td><td><code>${esc(ticket.id)}</code></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Source</td><td>${esc(ticket.source)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Category</td><td>${esc(ticket.category)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Severity</td><td>${esc(severity)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Customer email</td><td>${esc(ticket.email ?? "(none)")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">User ID</td><td>${esc(ticket.user_id ?? "(anon)")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Workspace ID</td><td>${esc(ticket.workspace_id ?? "(none)")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Route</td><td>${esc(ticket.route ?? "")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Created</td><td>${esc(ticket.created_at ?? "")}</td></tr>
      </table>
      <h3 style="margin:20px 0 6px">Message</h3>
      <div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${esc(ticket.message ?? "")}</div>
      <h3 style="margin:20px 0 6px">Diagnostics</h3>
      <pre style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px">${esc(diagPretty)}</pre>
      <h3 style="margin:20px 0 6px">Browser</h3>
      <div style="background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px">${esc(ticket.browser_info ?? "")}</div>
      <p style="margin-top:20px;font-size:13px;color:#444">
        Review and respond in the founder Support Queue at <strong>/crm/support</strong>.
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [CONTACT_NOTIFY_TO],
        reply_to: ticket.email || undefined,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      await logError(`support-notify: resend ${res.status}`, detail.slice(0, 500));
      return json({ ok: true, notified: false });
    }
    return json({ ok: true, notified: true });
  } catch (e) {
    await logError("support-notify: exception", String(e).slice(0, 500));
    return json({ ok: true, notified: false });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logError(message: string, detail?: string) {
  try {
    await admin().from("error_logs").insert({
      category: "support-notify",
      message,
      details: detail ?? null,
      severity: "error",
    });
  } catch {
    // swallow
  }
}
