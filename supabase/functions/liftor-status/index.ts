// Liftor visibility bridge — read-only, aggregate-only, token-gated.
// Founder/portfolio use. No customer PII, no secrets, no dashboard-only data.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Constant-time string compare.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = Deno.env.get("LIFTOR_BRIDGE_TOKEN");
  if (!token) return unauthorized();
  const provided =
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") ||
    new URL(req.url).searchParams.get("token") || "";
  if (!provided || !safeEqual(provided, token)) return unauthorized();

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [
    subsActive, subsAll, payments, plans, ledger,
    campaigns, contacts, leads, emailSends, tickets,
  ] = await Promise.all([
    sb.from("stripe_subscriptions").select("plan, status, monthly_amount, currency").eq("status", "active"),
    sb.from("stripe_subscriptions").select("id", { count: "exact", head: true }),
    sb.from("payment_intents").select("amount, currency, status, created_at").eq("status", "paid"),
    sb.from("user_plans").select("plan, status"),
    sb.from("credit_ledger").select("delta, reason"),
    sb.from("campaigns").select("id", { count: "exact", head: true }),
    sb.from("contacts").select("id", { count: "exact", head: true }),
    sb.from("leads").select("id, status", { count: "exact" }),
    sb.from("email_sends").select("id", { count: "exact", head: true }).not("sent_at", "is", null),
    sb.from("support_tickets").select("severity, status, created_at"),
  ]);

  const paidRows = payments.data ?? [];
  const totalLivePayments = paidRows.length;
  const grossByCurrency: Record<string, number> = {};
  for (const p of paidRows) {
    const ccy = String((p as any).currency ?? "gbp").toUpperCase();
    grossByCurrency[ccy] = (grossByCurrency[ccy] ?? 0) + Number((p as any).amount ?? 0) / 100;
  }

  const mrrByCurrency: Record<string, number> = {};
  const activePlanCounts: Record<string, number> = {};
  for (const s of subsActive.data ?? []) {
    const plan = String((s as any).plan ?? "unknown");
    activePlanCounts[plan] = (activePlanCounts[plan] ?? 0) + 1;
    const ccy = String((s as any).currency ?? "gbp").toUpperCase();
    const amt = Number((s as any).monthly_amount ?? 0) / 100;
    if (amt > 0) mrrByCurrency[ccy] = (mrrByCurrency[ccy] ?? 0) + amt;
  }

  let creditsIssued = 0;
  let creditsConsumed = 0;
  for (const l of ledger.data ?? []) {
    const d = Number((l as any).delta ?? 0);
    if (d > 0) creditsIssued += d;
    else creditsConsumed += -d;
  }

  const ticketRows = tickets.data ?? [];
  const ticketsOpen = ticketRows.filter((t: any) => t.status && !["resolved", "closed"].includes(t.status)).length;
  const ticketsUrgent = ticketRows.filter((t: any) => ["high", "urgent"].includes(String(t.severity ?? "").toLowerCase())).length;

  const leadsActivated = (leads.data ?? []).filter((l: any) =>
    ["contacted", "demo_scheduled", "proposal_sent", "won"].includes(String(l.status ?? ""))
  ).length;

  const summary = {
    product: "Velocity Vision",
    status: "Commercial payment live; Nylas production pending",
    live_payment_proven: true,
    stripe_status: "live_payment_proven",
    nylas_status: "pending_production_support",
    active_subscriptions_total: (subsActive.data ?? []).length,
    active_plans_by_tier: activePlanCounts,
    total_live_payments: totalLivePayments,
    gross_paid_by_currency: grossByCurrency,
    mrr_by_currency: mrrByCurrency,
    credits_issued: creditsIssued,
    credits_consumed: creditsConsumed,
    campaigns_created: campaigns.count ?? 0,
    contacts_imported: contacts.count ?? 0,
    leads_total: leads.count ?? (leads.data?.length ?? 0),
    leads_activated: leadsActivated,
    emails_sent: emailSends.count ?? 0,
    support_tickets_open: ticketsOpen,
    support_tickets_high_urgent: ticketsUrgent,
    last_updated: new Date().toISOString(),
  };

  return new Response(JSON.stringify(summary, null, 2), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
});
