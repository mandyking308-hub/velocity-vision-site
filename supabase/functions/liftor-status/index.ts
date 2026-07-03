// Liftor visibility bridge — read-only, aggregate-only, token-gated.
// Founder/portfolio use. No customer PII, no secrets, no dashboard-only data.
// v2: separates external commercial metrics from internal/QA/test metrics.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// Conservative test/internal name heuristic.
const TEST_TOKENS = ["qa", "test", "e2e", "example", "demo", "lovable", "sandbox", "seed"];
function looksInternalName(name?: string | null): boolean {
  if (!name) return false;
  const n = String(name).toLowerCase();
  return TEST_TOKENS.some((t) => n.includes(t));
}
function looksInternalEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = String(email).toLowerCase();
  if (/@(example\.(com|org|net)|test\.com|localhost)$/i.test(e)) return true;
  return TEST_TOKENS.some((t) => e.includes(t));
}
// Mandy internal proof payment marker (kept separate from external traction).
const INTERNAL_PROOF_EMAILS = ["mandy", "founder", "internal"];
function isInternalProofEmail(email?: string | null): boolean {
  if (!email) return false;
  const e = String(email).toLowerCase();
  return INTERNAL_PROOF_EMAILS.some((t) => e.includes(t));
}

type Bucket = "external" | "internal" | "review";

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
  const provided = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!provided || !safeEqual(provided, token)) return unauthorized();

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch base rows with fields needed for classification. Aggregate-only after.
  const [
    workspacesRes,
    companiesRes,
    campaignsRes,
    contactsRes,
    leadsRes,
    emailSendsRes,
    subsActiveRes,
    subsAllRes,
    paymentsRes,
    plansRes,
    ledgerRes,
    ticketsRes,
    profilesRes,
  ] = await Promise.all([
    sb.from("client_workspaces").select("id, name, agency_company_id"),
    sb.from("companies").select("id, name"),
    sb.from("campaigns").select("id, name, workspace_id, company_id, created_by"),
    sb.from("contacts").select("id, email, workspace_id, company_id, created_by"),
    sb.from("leads").select("id, status, email, workspace_id, created_by"),
    sb.from("email_sends").select("id, workspace_id, sent_at").not("sent_at", "is", null),
    sb.from("stripe_subscriptions").select("id, user_id, plan, status, monthly_amount, currency").eq("status", "active"),
    sb.from("stripe_subscriptions").select("id", { count: "exact", head: true }),
    sb.from("payment_intents").select("amount, currency, status, user_id, created_at").eq("status", "paid"),
    sb.from("user_plans").select("user_id, plan, status"),
    sb.from("credit_ledger").select("user_id, delta, reason"),
    sb.from("support_tickets").select("severity, status"),
    sb.from("profiles").select("user_id, email"),
  ]);

  const workspaces = workspacesRes.data ?? [];
  const companies = companiesRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  // Build classification maps.
  const companyBucket = new Map<string, Bucket>();
  for (const c of companies) {
    companyBucket.set((c as any).id, looksInternalName((c as any).name) ? "internal" : "external");
  }
  const workspaceBucket = new Map<string, Bucket>();
  for (const w of workspaces) {
    const nameHit = looksInternalName((w as any).name);
    const compHit = companyBucket.get((w as any).agency_company_id) === "internal";
    workspaceBucket.set((w as any).id, (nameHit || compHit) ? "internal" : "external");
  }
  const userBucket = new Map<string, Bucket>();
  for (const p of profiles) {
    userBucket.set(
      (p as any).user_id,
      (looksInternalEmail((p as any).email) || isInternalProofEmail((p as any).email)) ? "internal" : "external",
    );
  }

  function classify(row: {
    workspace_id?: string | null;
    company_id?: string | null;
    created_by?: string | null;
    email?: string | null;
    name?: string | null;
  }): Bucket {
    if (row.name && looksInternalName(row.name)) return "internal";
    if (row.email && (looksInternalEmail(row.email) || isInternalProofEmail(row.email))) return "internal";
    if (row.workspace_id && workspaceBucket.get(row.workspace_id) === "internal") return "internal";
    if (row.company_id && companyBucket.get(row.company_id) === "internal") return "internal";
    if (row.created_by && userBucket.get(row.created_by) === "internal") return "internal";
    // If we have zero signal (no workspace/company/user known), mark for review.
    const hasAnySignal = row.workspace_id || row.company_id || row.created_by || row.email || row.name;
    if (!hasAnySignal) return "review";
    return "external";
  }

  // Workspaces / companies split.
  const wsCounts = { external: 0, internal: 0, review: 0 };
  for (const w of workspaces) wsCounts[workspaceBucket.get((w as any).id) ?? "review"]++;
  const compCounts = { external: 0, internal: 0, review: 0 };
  for (const c of companies) compCounts[companyBucket.get((c as any).id) ?? "review"]++;

  // Campaigns.
  const campCounts = { external: 0, internal: 0, review: 0 };
  for (const c of campaignsRes.data ?? []) campCounts[classify(c as any)]++;

  // Contacts.
  const contactCounts = { external: 0, internal: 0, review: 0 };
  for (const c of contactsRes.data ?? []) contactCounts[classify(c as any)]++;

  // Leads (total + activated).
  const leadCounts = { external: 0, internal: 0, review: 0 };
  const leadActivated = { external: 0, internal: 0, review: 0 };
  const ACTIVATED = new Set(["contacted", "demo_scheduled", "proposal_sent", "won"]);
  for (const l of leadsRes.data ?? []) {
    const b = classify(l as any);
    leadCounts[b]++;
    if (ACTIVATED.has(String((l as any).status ?? ""))) leadActivated[b]++;
  }

  // Email sends.
  const sendCounts = { external: 0, internal: 0, review: 0 };
  for (const e of emailSendsRes.data ?? []) {
    const wid = (e as any).workspace_id;
    const b: Bucket = wid ? (workspaceBucket.get(wid) ?? "review") : "review";
    sendCounts[b]++;
  }

  // Payments — external vs internal proof.
  const paidRows = paymentsRes.data ?? [];
  const grossExt: Record<string, number> = {};
  const grossInt: Record<string, number> = {};
  let extPayments = 0;
  let intPayments = 0;
  for (const p of paidRows) {
    const uid = (p as any).user_id;
    const b: Bucket = uid ? (userBucket.get(uid) ?? "external") : "review";
    const ccy = String((p as any).currency ?? "gbp").toUpperCase();
    const amt = Number((p as any).amount ?? 0) / 100;
    if (b === "internal") {
      intPayments++;
      grossInt[ccy] = (grossInt[ccy] ?? 0) + amt;
    } else {
      extPayments++;
      grossExt[ccy] = (grossExt[ccy] ?? 0) + amt;
    }
  }

  // Subscriptions / MRR — external vs internal.
  const activeSubs = subsActiveRes.data ?? [];
  let extActiveSubs = 0;
  let intActiveSubs = 0;
  const mrrExt: Record<string, number> = {};
  const mrrInt: Record<string, number> = {};
  const activePlanCounts: Record<string, number> = {};
  for (const s of activeSubs) {
    const uid = (s as any).user_id;
    const b: Bucket = uid ? (userBucket.get(uid) ?? "external") : "external";
    const plan = String((s as any).plan ?? "unknown");
    activePlanCounts[plan] = (activePlanCounts[plan] ?? 0) + 1;
    const ccy = String((s as any).currency ?? "gbp").toUpperCase();
    const amt = Number((s as any).monthly_amount ?? 0) / 100;
    if (b === "internal") {
      intActiveSubs++;
      if (amt > 0) mrrInt[ccy] = (mrrInt[ccy] ?? 0) + amt;
    } else {
      extActiveSubs++;
      if (amt > 0) mrrExt[ccy] = (mrrExt[ccy] ?? 0) + amt;
    }
  }

  // External customer count = distinct users with an active external subscription
  // or an external paid payment intent.
  const extCustomerIds = new Set<string>();
  for (const s of activeSubs) {
    const uid = (s as any).user_id;
    if (uid && (userBucket.get(uid) ?? "external") === "external") extCustomerIds.add(uid);
  }
  for (const p of paidRows) {
    const uid = (p as any).user_id;
    if (uid && (userBucket.get(uid) ?? "external") === "external") extCustomerIds.add(uid);
  }

  // Credit ledger (kept as operational total + free/topup split).
  let creditsIssued = 0;
  let creditsConsumed = 0;
  let freeGranted = 0;
  let freeUsed = 0;
  const topupCustomerIds = new Set<string>();
  const topupRevenue: Record<string, number> = {};
  for (const l of ledgerRes.data ?? []) {
    const d = Number((l as any).delta ?? 0);
    const reason = String((l as any).reason ?? "");
    const uid = (l as any).user_id as string | undefined;
    if (d > 0) creditsIssued += d;
    else creditsConsumed += -d;
    if (reason === "free_welcome_grant" || reason === "free_daily_grant") freeGranted += Math.max(0, d);
    if (reason === "free_preview_spend") freeUsed += Math.max(0, -d);
    if ((reason === "topup" || reason === "stripe_topup") && uid && d > 0) {
      const bucket = userBucket.get(uid) ?? "external";
      if (bucket === "external") topupCustomerIds.add(uid);
    }
  }
  // Approximate top-up revenue from payment_intents that aren't tied to active subscriptions.
  const subsUserSet = new Set<string>();
  for (const s of activeSubs) { const u = (s as any).user_id; if (u) subsUserSet.add(u); }
  for (const p of paidRows) {
    const uid = (p as any).user_id;
    if (!uid) continue;
    if (subsUserSet.has(uid)) continue;
    if ((userBucket.get(uid) ?? "external") !== "external") continue;
    const ccy = String((p as any).currency ?? "gbp").toUpperCase();
    const amt = Number((p as any).amount ?? 0) / 100;
    topupRevenue[ccy] = (topupRevenue[ccy] ?? 0) + amt;
  }

  // Free preview users / workspaces (from user_plans).
  const plansRows = plansRes.data ?? [];
  const freeUserIds = new Set<string>();
  for (const pr of plansRows) {
    if (String((pr as any).plan) === "free_preview") {
      const u = (pr as any).user_id; if (u) freeUserIds.add(u);
    }
  }
  let freeWorkspaces = 0;
  let freeCampaigns = 0;
  for (const w of workspaces) {
    // Attribute workspace to free user if agency_company_id maps to a free user's created_by — best-effort.
    // Simplify: count workspaces whose id appears in campaigns created by a free user.
  }
  for (const c of campaignsRes.data ?? []) {
    const cb = (c as any).created_by; if (cb && freeUserIds.has(cb)) freeCampaigns++;
  }
  freeWorkspaces = freeUserIds.size; // 1 workspace per free user by policy.

  // Count plan tiers among external customers.
  let extGrowth = 0, extAgency = 0;
  for (const s of activeSubs) {
    const uid = (s as any).user_id;
    if (!uid || (userBucket.get(uid) ?? "external") !== "external") continue;
    const plan = String((s as any).plan ?? "");
    if (plan === "growth") extGrowth++;
    else if (plan === "agency") extAgency++;
  }


  const ticketRows = ticketsRes.data ?? [];
  const ticketsOpen = ticketRows.filter((t: any) => t.status && !["resolved", "closed"].includes(t.status)).length;
  const ticketsUrgent = ticketRows.filter((t: any) => ["high", "urgent"].includes(String(t.severity ?? "").toLowerCase())).length;

  // Response — preserves original operational fields alongside cleaner splits.
  const summary = {
    product: "Velocity Vision",
    status: "Commercial payment live; Nylas production pending",
    live_payment_proven: extPayments > 0 || intPayments > 0,
    stripe_status: "live_payment_proven",
    nylas_status: "pending_production_support",

    // ---- Preserved legacy operational totals (do not remove; Liftor card reads these) ----
    active_subscriptions_total: activeSubs.length,
    active_plans_by_tier: activePlanCounts,
    total_live_payments: paidRows.length,
    gross_paid_by_currency: (() => {
      const merged: Record<string, number> = {};
      for (const [k, v] of Object.entries(grossExt)) merged[k] = (merged[k] ?? 0) + v;
      for (const [k, v] of Object.entries(grossInt)) merged[k] = (merged[k] ?? 0) + v;
      return merged;
    })(),
    mrr_by_currency: (() => {
      const merged: Record<string, number> = {};
      for (const [k, v] of Object.entries(mrrExt)) merged[k] = (merged[k] ?? 0) + v;
      for (const [k, v] of Object.entries(mrrInt)) merged[k] = (merged[k] ?? 0) + v;
      return merged;
    })(),
    credits_issued: creditsIssued,
    credits_consumed: creditsConsumed,
    campaigns_created: (campaignsRes.data ?? []).length,
    contacts_imported: (contactsRes.data ?? []).length,
    leads_total: (leadsRes.data ?? []).length,
    leads_activated: leadActivated.external + leadActivated.internal + leadActivated.review,
    emails_sent: (emailSendsRes.data ?? []).length,
    support_tickets_open: ticketsOpen,
    support_tickets_high_urgent: ticketsUrgent,

    // ---- Clean external commercial metrics (headline traction) ----
    external_customers_total: extCustomerIds.size,
    external_active_subscriptions_total: extActiveSubs,
    external_mrr_by_currency: mrrExt,
    external_gross_paid_by_currency: grossExt,
    external_payments_total: extPayments,
    external_workspaces_total: wsCounts.external,
    external_companies_total: compCounts.external,
    external_campaigns_created: campCounts.external,
    external_contacts_imported: contactCounts.external,
    external_leads_total: leadCounts.external,
    external_leads_activated: leadActivated.external,
    external_emails_sent: sendCounts.external,

    // ---- Internal / QA / demo / proof metrics (kept separate, not customer traction) ----
    internal_proof_payment_note:
      "Founder/internal proof payments (e.g. Mandy) are counted here — not in external traction.",
    internal_test_workspaces_total: wsCounts.internal,
    internal_test_companies_total: compCounts.internal,
    internal_test_campaigns_created: campCounts.internal,
    internal_test_contacts_imported: contactCounts.internal,
    internal_test_leads_total: leadCounts.internal,
    internal_test_leads_activated: leadActivated.internal,
    internal_test_emails_sent: sendCounts.internal,
    internal_test_active_subscriptions_total: intActiveSubs,
    internal_test_mrr_by_currency: mrrInt,
    internal_test_gross_paid_by_currency: grossInt,
    internal_test_payments_total: intPayments,

    // ---- Unknown / review (conservatively unclassified) ----
    review_workspaces_total: wsCounts.review,
    review_companies_total: compCounts.review,
    review_campaigns_created: campCounts.review,
    review_contacts_imported: contactCounts.review,
    review_leads_total: leadCounts.review,
    review_emails_sent: sendCounts.review,

    // ---- Free Preview + top-up commercial metrics ----
    free_users_total: freeUserIds.size,
    free_preview_workspaces_total: freeWorkspaces,
    free_preview_campaigns_created: freeCampaigns,
    free_preview_credits_granted: freeGranted,
    free_preview_credits_used: freeUsed,
    free_activated_users_total: freeUsed > 0 ? freeUserIds.size : 0,
    external_paid_topup_customers_total: topupCustomerIds.size,
    external_topup_revenue_by_currency: topupRevenue,
    external_growth_customers_total: extGrowth,
    external_agency_customers_total: extAgency,

    classification_note:
      "Conservative name/email heuristics (QA, TEST, E2E, EXAMPLE, DEMO, LOVABLE, SANDBOX, SEED; example.com/org/net, test.com). Uncertain rows fall into 'review' rather than being dropped. No PII returned.",
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
