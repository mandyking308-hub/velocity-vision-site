import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CONTACT_NOTIFY_TO = Deno.env.get('CONTACT_NOTIFY_TO');
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? 'Velocity Vision <notifications@velocity-outreach.com>';

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { name, email, company, message, route, lead_id, contact_id, company_id } = payload as Record<string, string | null | undefined>;
  const timestamp = new Date().toISOString();

  if (!CONTACT_NOTIFY_TO || !RESEND_API_KEY) {
    await logError('notify-contact: missing config');
    return new Response(JSON.stringify({ ok: false, error: 'notify_unavailable' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const subject = `New website enquiry — ${name || 'Unknown'}${route ? ` (${route})` : ''}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Route</td><td>${esc(route || 'website_contact')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${esc(name || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${esc(email || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company</td><td>${esc(company || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Timestamp</td><td>${esc(timestamp)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Lead ID</td><td>${esc(lead_id || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Contact ID</td><td>${esc(contact_id || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company ID</td><td>${esc(company_id || '')}</td></tr>
      </table>
      <h3 style="margin:20px 0 6px">Message</h3>
      <div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${esc(message || '')}</div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [CONTACT_NOTIFY_TO],
        reply_to: email || undefined,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      await logError(`notify-contact: resend ${res.status}`, detail.slice(0, 500));
      return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    await logError('notify-contact: exception', String(e).slice(0, 500));
    return new Response(JSON.stringify({ ok: false, error: 'send_failed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function logError(message: string, detail?: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await supabase.from('error_logs').insert({
      category: 'notify-contact',
      message,
      details: detail ?? null,
      severity: 'error',
    });
  } catch {
    // swallow
  }
}
