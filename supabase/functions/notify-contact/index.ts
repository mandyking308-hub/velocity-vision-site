import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CONTACT_NOTIFY_TO = 'contact@velocity-outreach.com';

// Strong-enough email format check + disposable/test domain filter.
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const FAKE_DOMAINS = new Set([
  'example.com', 'example.org', 'example.net',
  'test.com', 'test.org', 'test.net',
  'localhost', 'invalid', 'mailinator.com', 'tempmail.com',
  'yopmail.com', '10minutemail.com', 'guerrillamail.com',
]);
function classifyEmail(email: string): { ok: boolean; fake: boolean; reason?: string } {
  if (!email || email.length > 320) return { ok: false, fake: false, reason: 'invalid_email' };
  if (!EMAIL_RE.test(email)) return { ok: false, fake: false, reason: 'invalid_email' };
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (!domain.includes('.')) return { ok: false, fake: false, reason: 'invalid_email' };
  if (FAKE_DOMAINS.has(domain)) return { ok: false, fake: true, reason: 'fake_email_domain' };
  return { ok: true, fake: false };
}

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

// Every public enquiry route is intentionally delivered to the canonical
// Velocity mailbox. Stale route-specific environment overrides are ignored.
function recipientFor(_route: string): string {
  return CONTACT_NOTIFY_TO;
}

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  let payload: Record<string, any> = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = String(payload.name ?? '').trim();
  const rawEmail = String(payload.email ?? '').trim();
  const email = rawEmail.toLowerCase();
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

  const emailCheck = classifyEmail(email);
  if (!emailCheck.ok) {
    // Fake/test domains are rejected so they never pollute the CRM.
    return json({ ok: false, error: emailCheck.reason ?? 'invalid_email' }, 400);
  }

  const supabase = admin();
  let companyId: string | null = null;
  let contactId: string | null = null;
  let leadId: string | null = null;
  let saved = false;

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

    const { data: ld, error: leadErr } = await supabase
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
    if (leadErr) throw leadErr;
    leadId = ld?.id ?? null;
    saved = Boolean(leadId);
  } catch (e) {
    await logError('notify-contact: db insert failed', String(e).slice(0, 500));
  }

  // Persistence is the visitor-facing outcome. If nothing was saved we fail loudly
  // so the form keeps its values and the visitor can retry.
  if (!saved) {
    return json({ ok: false, saved: false, notified: false, error: 'enquiry_not_saved' }, 500);
  }

  const notifyTo = recipientFor(route);

  // Post-save delivery work. Failures here are logged for retry/diagnosis but do
  // NOT change the visitor's saved-submission result and never re-insert records.
  let notified = false;
  try {
    const { error: notifyErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'contact-notification',
        recipientEmail: notifyTo,
        idempotencyKey: `contact-notify-${leadId}`,
        templateData: { name, email, company, topic: routeLabel, message, leadId: leadId ?? '' },
      },
    });
    if (notifyErr) throw notifyErr;
    notified = true;
  } catch (e) {
    await logError('notify-contact: notification send failed', String(e).slice(0, 500));
  }

  let acknowledged = false;
  try {
    const { error: ackErr } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'contact-confirmation',
        recipientEmail: email,
        idempotencyKey: `contact-confirm-${leadId}`,
        templateData: { name, message, topic: routeLabel },
      },
    });
    if (ackErr) throw ackErr;
    acknowledged = true;
  } catch (e) {
    await logError('notify-contact: confirmation send failed', String(e).slice(0, 500));
  }

  return json({
    ok: true,
    saved: true,
    notified,
    acknowledged,
    lead_id: leadId,
    contact_id: contactId,
    company_id: companyId,
  });
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
