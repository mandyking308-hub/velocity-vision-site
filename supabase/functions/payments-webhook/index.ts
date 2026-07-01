import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, PRICE_CATALOG } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

function lookupKey(price: any): string | null {
  return price?.lookup_key ?? price?.metadata?.lovable_external_id ?? null;
}

// Idempotent credit grant. Returns true only on the first successful insert
// for a given dedupe_key; duplicate deliveries are silently no-ops.
async function grantCreditsOnce(
  userId: string,
  credits: number,
  reason: string,
  dedupeKey: string,
  meta: Record<string, unknown>,
): Promise<boolean> {
  const { error, data } = await db()
    .from("credit_ledger")
    .insert({ user_id: userId, delta: credits, reason, dedupe_key: dedupeKey, meta })
    .select("id");
  if (error) {
    // 23505 = unique_violation on dedupe_key ⇒ duplicate delivery, safe to skip.
    if ((error as any).code === "23505") return false;
    console.error("grantCreditsOnce error", error);
    return false;
  }
  return !!data && data.length > 0;
}

async function ensurePlan(
  userId: string,
  plan: string,
  recurring: boolean,
  currency?: string,
  billingCountry?: string | null,
  periodEndUnix?: number | null,
) {
  const periodEnd = periodEndUnix
    ? new Date(periodEndUnix * 1000).toISOString()
    : new Date(Date.now() + (recurring ? 30 : 30) * 24 * 60 * 60 * 1000).toISOString();
  const upd: Record<string, unknown> = {
    plan,
    status: "active",
    period_start: new Date().toISOString(),
    period_end: periodEnd,
  };
  if (currency) upd.currency = currency.toUpperCase();
  if (billingCountry) upd.billing_country = billingCountry;
  const { data } = await db().from("user_plans").select("id").eq("user_id", userId).maybeSingle();
  if (data) {
    await db().from("user_plans").update(upd).eq("user_id", userId);
  } else {
    await db().from("user_plans").insert({
      user_id: userId, plan, status: "active", period_end: periodEnd,
      ...(currency && { currency: currency.toUpperCase() }),
      ...(billingCountry && { billing_country: billingCountry }),
    });
  }
}

// ── Subscription lifecycle ────────────────────────────────────────────────
// On created/updated: sync the stripe_subscriptions row and (for a fresh
// subscription) grant included credits once, keyed on subscription id.
// Recurring renewals are handled by `invoice.paid`, keyed on invoice id.
async function handleSubscriptionEvent(subscription: any, env: StripeEnv, isCreate: boolean) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;
  const item = subscription.items?.data?.[0];
  const priceKey = lookupKey(item?.price);
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;
  const planEntry = priceKey ? PRICE_CATALOG[priceKey] : null;

  await db().from("stripe_subscriptions").upsert({
    user_id: userId,
    workspace_id: subscription.metadata?.workspaceId || null,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    product_id: productId,
    price_id: priceKey,
    status: subscription.status,
    plan: planEntry?.plan ?? null,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  // Initial grant only. Renewals come from invoice.paid to avoid double-granting
  // every time Stripe emits a subscription.updated (e.g. card updates).
  if (isCreate && subscription.status === "active" && planEntry?.plan && planEntry.credits) {
    const subCurrency = (item?.price?.currency || "usd").toUpperCase();
    await ensurePlan(userId, planEntry.plan, true, subCurrency, null, periodEnd);
    await grantCreditsOnce(
      userId,
      planEntry.credits,
      "plan_grant",
      `sub_initial:${subscription.id}`,
      { plan: planEntry.plan, source: "stripe", subscription: subscription.id },
    );
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await db().from("stripe_subscriptions").update({
    status: "canceled", updated_at: new Date().toISOString(),
  }).eq("stripe_subscription_id", subscription.id).eq("environment", env);
}

// ── One-off checkout (Starter, top-ups, human review) ────────────────────
async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const priceKey = session.metadata?.priceId;
  if (!userId || !priceKey) return;
  const entry = PRICE_CATALOG[priceKey];
  if (!entry) return;

  // First-writer-wins on stripe_session_id (UNIQUE). If this insert succeeds
  // we own the side-effects; a duplicate delivery hits the unique violation
  // and we exit before granting credits again.
  const { error: piErr } = await db().from("payment_intents").insert({
    user_id: userId,
    workspace_id: session.metadata?.workspaceId || null,
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent || null,
    price_id: priceKey,
    product_kind: entry.kind,
    amount: session.amount_total ?? 0,
    currency: (session.currency || "gbp"),
    status: "paid",
    ref_id: session.metadata?.refId || null,
    environment: env,
    meta: { customer: session.customer },
  });
  if (piErr) {
    if ((piErr as any).code === "23505") return; // duplicate delivery
    console.error("payment_intents insert error", piErr);
    return;
  }

  // Side effects — each keyed on session.id so subscription-side handlers
  // and any manual retry stay idempotent even if the payment_intents guard
  // is bypassed one day.
  if (entry.kind === "plan_starter" && entry.credits && entry.plan) {
    const sessCurrency = (session.currency || "usd").toUpperCase();
    const country = session.customer_details?.address?.country ?? null;
    await ensurePlan(userId, entry.plan, false, sessCurrency, country);
    await grantCreditsOnce(
      userId,
      entry.credits,
      "plan_grant",
      `session:${session.id}`,
      { plan: entry.plan, source: "stripe", session: session.id },
    );
  } else if (entry.kind.startsWith("topup_") && entry.credits) {
    // Upsert-on-session so duplicate deliveries don't insert a second topup row.
    await db().from("credit_topups").upsert({
      user_id: userId,
      pack: entry.kind.replace("topup_", ""),
      credits: entry.credits,
      amount: (session.amount_total ?? 0) / 100,
      stripe_session_id: session.id,
    }, { onConflict: "stripe_session_id" });
    await grantCreditsOnce(
      userId,
      entry.credits,
      "topup",
      `session:${session.id}`,
      { pack: entry.kind, session: session.id },
    );
  } else if (entry.kind === "human_review") {
    const campaignId = session.metadata?.refId;
    await db().from("human_reviews").upsert({
      user_id: userId,
      campaign_id: campaignId || null,
      status: "purchased",
      amount: (session.amount_total ?? 0) / 100,
      stripe_session_id: session.id,
    }, { onConflict: "stripe_session_id" });
  }
}

// ── Recurring subscription renewals ──────────────────────────────────────
// invoice.paid fires on the initial subscription invoice AND every renewal.
// We grant credits once per invoice id so each billing period tops up the
// customer's included allowance without double-granting on webhook retries.
// ── Recurring subscription renewals ──────────────────────────────────────
// invoice.paid fires on BOTH the initial subscription invoice and every
// renewal. The initial invoice is handled by customer.subscription.created
// (dedupe key `sub_initial:${subscription.id}`), so here we must skip any
// invoice whose billing_reason marks it as the creation invoice — otherwise
// a Growth/Agency signup would receive its included credits twice (once
// from subscription.created, once from the initial invoice.paid).
//
// Dedupe key map (do not change without migrating credit_ledger):
//   initial subscription grant → sub_initial:${subscription.id}
//   renewal grant              → invoice:${invoice.id}
//   one-off checkout / top-up  → session:${session.id}
async function handleInvoicePaid(invoice: any, env: StripeEnv) {
  const subId = invoice.subscription;
  if (!subId) return;

  // Skip the initial subscription invoice — credits for it are granted by
  // handleSubscriptionEvent(..., isCreate=true). Only true recurring cycle
  // invoices should top up the included allowance here.
  const billingReason = invoice.billing_reason;
  const RENEWAL_REASONS = new Set([
    "subscription_cycle",
    "subscription_update", // proration/plan change mid-cycle renewal
    "subscription_threshold",
  ]);
  if (!RENEWAL_REASONS.has(billingReason)) {
    // subscription_create, manual, upcoming, etc. → no renewal grant.
    return;
  }

  const line = invoice.lines?.data?.[0];
  const priceKey = lookupKey(line?.price);
  if (!priceKey) return;
  const entry = PRICE_CATALOG[priceKey];
  if (!entry || !entry.plan || !entry.credits) return;

  // Look up userId from the subscription row we already synced.
  const { data: sub } = await db()
    .from("stripe_subscriptions")
    .select("user_id, current_period_end")
    .eq("stripe_subscription_id", subId)
    .eq("environment", env)
    .maybeSingle();
  const userId = sub?.user_id;
  if (!userId) return;

  const currency = (invoice.currency || "usd").toUpperCase();
  const periodEnd = line?.period?.end ?? null;
  await ensurePlan(userId, entry.plan, true, currency, null, periodEnd);
  await grantCreditsOnce(
    userId,
    entry.credits,
    "plan_grant",
    `invoice:${invoice.id}`,
    { plan: entry.plan, source: "stripe_renewal", invoice: invoice.id, subscription: subId, billing_reason: billingReason },
  );
}


async function handleInvoicePaymentFailed(invoice: any, env: StripeEnv) {
  const subId = invoice.subscription;
  if (!subId) return;
  await db().from("stripe_subscriptions").update({
    status: "past_due", updated_at: new Date().toISOString(),
  }).eq("stripe_subscription_id", subId).eq("environment", env);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200 });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env); break;
      case "customer.subscription.created":
        await handleSubscriptionEvent(event.data.object, env, true); break;
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object, env, false); break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env); break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        await handleInvoicePaid(event.data.object, env); break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object, env); break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
