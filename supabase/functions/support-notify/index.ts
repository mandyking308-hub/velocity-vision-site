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
    .select("id, user_id, email, workspace_id, route, category, severity, subject, message, diagnostics, browser_info, source, created_at, contact_name, contact_phone, company_name, account_reference, preferred_contact_method")
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
  const urgencyTag = (ticket.diagnostics as any)?.urgency === "urgent" ? "URGENT" : severity.toUpperCase();
  const subject = `[Velocity Vision Support] ${urgencyTag} — ${ticket.subject ?? "New ticket"}`;

  const diag = (ticket.diagnostics ?? {}) as Record<string, any>;
  const assistantQ = diag.assistant_question ?? "";
  const assistantA = diag.assistant_answer ?? "";
  const transcript = Array.isArray(diag.chat_transcript) ? diag.chat_transcript : [];

  const transcriptHtml = transcript.length
    ? transcript.map((m: any) => `<div style="margin:4px 0"><strong style="color:#666">${esc(m.role)}:</strong> <span style="white-space:pre-wrap">${esc(m.content)}</span></div>`).join("")
    : "<em style='color:#999'>(no transcript)</em>";

  const diagPretty = (() => {
    try { return JSON.stringify(ticket.diagnostics ?? {}, null, 2); } catch { return String(ticket.diagnostics ?? ""); }
  })();

  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(label)}</td><td>${esc(value ?? "(none)")}</td></tr>`;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px">New support ticket — ${esc(urgencyTag)}</h2>
      <h3 style="margin:16px 0 6px">Contact</h3>
      <table style="border-collapse:collapse;font-size:14px">
        ${row("Name", ticket.contact_name)}
        ${row("Email", ticket.email)}
        ${row("Phone", ticket.contact_phone)}
        ${row("Company", ticket.company_name)}
        ${row("Preferred contact", ticket.preferred_contact_method)}
        ${row("Account / workspace ref", ticket.account_reference)}
      </table>
      <h3 style="margin:20px 0 6px">Ticket</h3>
      <table style="border-collapse:collapse;font-size:14px">
        ${row("Ticket ID", ticket.id)}
        ${row("Source", ticket.source)}
        ${row("Route", ticket.route)}
        ${row("Category", ticket.category)}
        ${row("Severity", severity)}
        ${row("Urgency", diag.urgency ?? "normal")}
        ${row("User ID", ticket.user_id ?? "(anon)")}
        ${row("Workspace ID", ticket.workspace_id)}
        ${row("Created", ticket.created_at)}
      </table>
      <h3 style="margin:20px 0 6px">Message</h3>
      <div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${esc(ticket.message ?? "")}</div>
      <h3 style="margin:20px 0 6px">Assistant Q&amp;A</h3>
      <div style="background:#f7f7f7;padding:12px;border-radius:6px;font-size:13px">
        <div><strong>Q:</strong> <span style="white-space:pre-wrap">${esc(assistantQ)}</span></div>
        <div style="margin-top:6px"><strong>A:</strong> <span style="white-space:pre-wrap">${esc(assistantA)}</span></div>
      </div>
      <h3 style="margin:20px 0 6px">Chat transcript</h3>
      <div style="background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px">${transcriptHtml}</div>
      <h3 style="margin:20px 0 6px">Diagnostics</h3>
      <pre style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px">${esc(diagPretty)}</pre>
      <h3 style="margin:20px 0 6px">Browser</h3>
      <div style="background:#f7f7f7;padding:12px;border-radius:6px;font-size:12px">${esc(ticket.browser_info ?? "")}</div>
      <p style="margin-top:20px;font-size:13px;color:#444">
        Review and respond in the founder Support Queue at <strong>/crm/support</strong>.
      </p>
    </div>
  `;

  let notified = false;
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
    } else {
      notified = true;
    }
  } catch (e) {
    await logError("support-notify: exception", String(e).slice(0, 500));
  }

  // Best-effort customer confirmation. Does not affect `notified` for the ops team notification.
  const customerEmail = String(ticket.email ?? "").trim();
  const validCustomer = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  if (validCustomer) {
    const ref = String(ticket.id).slice(0, 8);
    const confirmHtml = `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h2 style="margin:0 0 12px">We've received your support ticket</h2>
        <p>Thanks for getting in touch with Velocity Vision. Our support team has your request and will reply by email.</p>
        <p><strong>Ticket reference:</strong> <span style="font-family:monospace">${esc(ref)}</span></p>
        <p style="color:#555;font-size:13px">
          For your security, please never include passwords, API keys, or card details in support messages.
          If you sent any of these by mistake, rotate them and let us know.
        </p>
        <p style="color:#555;font-size:13px">— The Velocity Vision team</p>
      </div>
    `;
    try {
      const confirmRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [customerEmail],
          subject: "Velocity Vision support ticket received",
          html: confirmHtml,
        }),
      });
      if (!confirmRes.ok) {
        const detail = await confirmRes.text();
        await logError(`support-notify: customer confirm ${confirmRes.status}`, detail.slice(0, 500));
      }
    } catch (e) {
      await logError("support-notify: customer confirm exception", String(e).slice(0, 500));
    }
  }

  return json({ ok: true, notified });
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
