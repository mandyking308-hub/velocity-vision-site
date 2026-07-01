import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const CONTACT_NOTIFY_TO = Deno.env.get('CONTACT_NOTIFY_TO');
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') ?? 'Velocity Vision <notifications@velocity-outreach.com>';

// Human-readable labels for each supported contact route.
const ROUTE_LABELS: Record<string, string> = {
  general_support: 'General support',
  billing: 'Billing & account',
  privacy_data_request: 'Privacy / data request',
  security_report: 'Security report',
  abuse_acceptable_use: 'Abuse / acceptable use',
  marketing_compliance_complaint: 'Marketing compliance complaint',
  cookie_tracking: 'Cookie / tracking question',
  legal_notice: 'Legal notice',
  subprocessor_question: 'Subprocessor question',
  partnerships: 'Partnerships & integrations',
  enterprise_volume: 'Enterprise / agency volume',
  other: 'Other',
  demo_booking: 'Demo booking',
  website_contact: 'Website enquiry',
};

// Optional per-route internal recipient override via env vars.
// Names are uppercased and prefixed with CONTACT_NOTIFY_TO_.
// Falls back to CONTACT_NOTIFY_TO if no override is configured.
function recipientFor(route: string): string | undefined {
  const key = `CONTACT_NOTIFY_TO_${route.toUpperCase()}`;
  return Deno.env.get(key) || CONTACT_NOTIFY_TO || undefined;
}

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let payload: Record<string, any> = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = String(payload.name ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const company = String(payload.company ?? '').trim();
  const message = String(payload.message ?? '').trim();
  const rawRoute = String(payload.route ?? 'general_support').slice(0, 64);
  const route = ROUTE_LABELS[rawRoute] ? rawRoute : 'other';
  const routeLabel = ROUTE_LABELS[route] ?? 'Other';
  const source = route === 'demo_booking' ? 'demo_booking' : 'website_contact';

  if (!name || !email) {
    return json({ ok: false, error: 'missing_fields' }, 400);
  }
  if (name.length > 200 || email.length > 320 || company.length > 200 || message.length > 5000) {
    return json({ ok: false, error: 'field_too_long' }, 400);
  }

  const supabase = admin();
  let companyId: string | null = null;
  let contactId: string | null = null;
  let leadId: string | null = null;

  try {
    if (company) {
      const { data: c } = await supabase
        .from('companies')
        .insert({ name: company, status: 'prospect' as const })
        .select('id')
        .single();
      companyId = c?.id ?? null;
    }

    const parts = name.split(/\s+/);
    const { data: ct } = await supabase
      .from('contacts')
      .insert({
        first_name: parts[0] ?? name,
        last_name: parts.slice(1).join(' ') || '',
        email,
        company_id: companyId,
      })
      .select('id')
      .single();
    contactId = ct?.id ?? null;

    const { data: ld } = await supabase
      .from('leads')
      .insert({
        source,
        contact_id: contactId,
        company_id: companyId,
        marketing_interest: message || null,
        status: 'new' as const,
      })
      .select('id')
      .single();
    leadId = ld?.id ?? null;
  } catch (e) {
    await logError('notify-contact: db insert failed', String(e).slice(0, 500));
    // continue — we still try to send the notification email
  }

  const timestamp = new Date().toISOString();

  const notifyTo = recipientFor(route);
  if (!notifyTo || !RESEND_API_KEY) {
    await logError('notify-contact: missing config');
    return json({ ok: true, lead_id: leadId, contact_id: contactId, company_id: companyId, notified: false });
  }

  const subject = `[${routeLabel}] Website enquiry — ${name || 'Unknown'}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <h2 style="margin:0 0 12px">New website enquiry — ${esc(routeLabel)}</h2>
      <table style="border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Route</td><td><strong>${esc(routeLabel)}</strong> <span style="color:#888">(${esc(route)})</span></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td>${esc(name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${esc(email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company</td><td>${esc(company)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Timestamp</td><td>${esc(timestamp)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Lead ID</td><td>${esc(leadId || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Contact ID</td><td>${esc(contactId || '')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company ID</td><td>${esc(companyId || '')}</td></tr>
      </table>
      <h3 style="margin:20px 0 6px">Message</h3>
      <div style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${esc(message)}</div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: EMAIL_FROM, to: [notifyTo], reply_to: email || undefined, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text();
      await logError(`notify-contact: resend ${res.status}`, detail.slice(0, 500));
      return json({ ok: true, lead_id: leadId, contact_id: contactId, company_id: companyId, notified: false });
    }
    return json({ ok: true, lead_id: leadId, contact_id: contactId, company_id: companyId, notified: true });
  } catch (e) {
    await logError('notify-contact: exception', String(e).slice(0, 500));
    return json({ ok: true, lead_id: leadId, contact_id: contactId, company_id: companyId, notified: false });
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function logError(message: string, detail?: string) {
  try {
    await admin().from('error_logs').insert({
      category: 'notify-contact',
      message,
      details: detail ?? null,
      severity: 'error',
    });
  } catch {
    // swallow
  }
}
