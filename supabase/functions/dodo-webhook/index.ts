/**
 * Dodo Payments webhook — the only Dodo fulfilment path.
 * Signature verification and event/financial idempotency are mandatory.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  DODO_HANDLED_EVENTS,
  DODO_PRODUCT_CATALOG,
  dodoSubscriptionStatus,
  isAllowedProductKey,
  verifyDodoWebhook,
} from "../_shared/dodo.ts";
import { userPlanStatusForSubscription } from "../_shared/entitlements.ts";

let _db: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_db) {
    _db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  }
  return _db;
}

const ok = (extra: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ received: true, ...extra }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

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
    if ((error as { code?: string }).code === "23505") return false;
    console.error("dodo grantCreditsOnce error", error);
    return false;
  }
  return !!data && data.length > 0;
}

async function ensurePlan(
  userId: string,
  plan: string,
  periodEndIso?: string | null,
  status = "active",
) {
  const periodEnd = periodEndIso ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db().from("user_plans").select("id").eq("user_id", userId).maybeSingle();
  const upd = {
    plan,
    status,
    period_start: new Date().toISOString(),
    period_end: periodEnd,
    updated_at: new Date().toISOString(),
  };
  if (data) await db().from("user_plans").update(upd).eq("user_id", userId);
  else await db().from("user_plans").insert({ user_id: userId, ...upd });
}

async function syncPlanLifecycle(
  userId: string,
  plan: string | null | undefined,
  status: string,
  periodEnd?: string | null,
) {
  const { data } = await db().from("user_plans").select("id").eq("user_id", userId).maybeSingle();
  if (!data) {
    // Do not manufacture an entitlement from a failure/cancel event that has no
    // existing plan. Activation/payment events create the plan separately.
    if (!plan || !["active", "trialing", "canceling"].includes(status)) return;
    await db().from("user_plans").insert({
      user_id: userId,
      plan,
      status,
      period_start: new Date().toISOString(),
      period_end: periodEnd ?? null,
      updated_at: new Date().toISOString(),
    });
    return;
  }
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (plan) update.plan = plan;
  if (periodEnd !== undefined) update.period_end = periodEnd;
  await db().from("user_plans").update(update).eq("user_id", userId);
}

function metaOf(payload: Record<string, any>): Record<string, string> {
  const m = payload?.metadata;
  return m && typeof m === "object" ? m as Record<string, string> : {};
}

async function handlePaymentSucceeded(payload: Record<string, any>, mode: string) {
  const meta = metaOf(payload);
  const userId = meta.userId;
  const productKey = meta.productKey;
  if (!userId || !isAllowedProductKey(productKey)) return;
  const entry = DODO_PRODUCT_CATALOG[productKey];
  const externalId = payload.payment_id ?? payload.id ?? null;
  if (!externalId) return;

  const { error: piErr } = await db().from("payment_intents").insert({
    user_id: userId,
    provider: "dodo",
    stripe_session_id: `dodo:${externalId}`,
    stripe_payment_intent_id: externalId,
    price_id: productKey,
    product_kind: entry.kind,
    amount: payload.total_amount ?? payload.settlement_amount ?? 0,
    currency: (payload.currency || "usd").toLowerCase(),
    status: "paid",
    environment: mode === "live_mode" ? "live" : "sandbox",
    meta: { provider: "dodo", subscription_id: payload.subscription_id ?? null },
  });
  if (piErr) {
    if ((piErr as { code?: string }).code === "23505") return;
    console.error("dodo payment_intents insert error", piErr);
    return;
  }

  if (entry.kind === "plan_starter" && entry.plan && entry.credits) {
    await ensurePlan(userId, entry.plan, null, "active");
    await grantCreditsOnce(userId, entry.credits, "plan_grant", `dodo_payment:${externalId}`, {
      plan: entry.plan, source: "dodo", payment: externalId,
    });
  } else if (entry.kind.startsWith("topup_") && entry.credits) {
    // Checkout creation already requires a currently entitled paid plan. The
    // webhook remains the sole fulfiller and is idempotent.
    await db().from("credit_topups").upsert({
      user_id: userId,
      pack: entry.kind.replace("topup_", ""),
      credits: entry.credits,
      amount: (payload.total_amount ?? 0) / 100,
      stripe_session_id: `dodo:${externalId}`,
    }, { onConflict: "stripe_session_id" });
    await grantCreditsOnce(userId, entry.credits, "topup", `dodo_payment:${externalId}`, {
      pack: entry.kind, source: "dodo", payment: externalId,
    });
  } else if (entry.kind === "human_review") {
    await db().from("human_reviews").upsert({
      user_id: userId,
      campaign_id: meta.refId || null,
      status: "purchased",
      amount: (payload.total_amount ?? 0) / 100,
      stripe_session_id: `dodo:${externalId}`,
    }, { onConflict: "stripe_session_id" });
  }
}

async function handlePaymentFailed(payload: Record<string, any>) {
  const subId = payload.subscription_id;
  if (!subId) return;
  const externalSubId = `dodo:${subId}`;
  const { data: sub } = await db().from("stripe_subscriptions")
    .select("user_id, plan")
    .eq("provider", "dodo")
    .eq("stripe_subscription_id", externalSubId)
    .maybeSingle();

  await db().from("stripe_subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("provider", "dodo")
    .eq("stripe_subscription_id", externalSubId);

  if (sub?.user_id) await syncPlanLifecycle(sub.user_id, sub.plan, "past_due");
}

async function handleSubscriptionEvent(
  eventType: string,
  payload: Record<string, any>,
  mode: string,
) {
  const meta = metaOf(payload);
  const subId = payload.subscription_id ?? payload.id;
  if (!subId) return;
  const externalSubId = `dodo:${subId}`;

  const { data: existing } = await db().from("stripe_subscriptions")
    .select("user_id, plan, price_id, current_period_end")
    .eq("stripe_subscription_id", externalSubId)
    .maybeSingle();

  const userId = meta.userId || existing?.user_id || null;
  const candidateKey = isAllowedProductKey(meta.productKey)
    ? meta.productKey
    : isAllowedProductKey(existing?.price_id)
      ? existing!.price_id
      : null;
  const entry = candidateKey ? DODO_PRODUCT_CATALOG[candidateKey] : null;
  const resolvedPlan = entry?.plan || existing?.plan || null;
  const providerStatus = dodoSubscriptionStatus(eventType, payload.status);
  const periodEnd = payload.next_billing_date
    ?? payload.current_period_end
    ?? existing?.current_period_end
    ?? payload.previous_billing_date
    ?? null;
  const cancelAtPeriodEnd = !!payload.cancel_at_next_billing_date;
  const userPlanStatus = userPlanStatusForSubscription({
    subscriptionStatus: providerStatus,
    periodEnd,
    cancelAtPeriodEnd,
  });

  if (userId) {
    await db().from("stripe_subscriptions").upsert({
      user_id: userId,
      provider: "dodo",
      stripe_subscription_id: externalSubId,
      stripe_customer_id: payload.customer?.customer_id ?? "dodo_unknown",
      ...(payload.product_id ? { product_id: payload.product_id } : {}),
      ...(candidateKey ? { price_id: candidateKey } : {}),
      ...(resolvedPlan ? { plan: resolvedPlan } : {}),
      status: providerStatus,
      current_period_end: periodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      environment: mode === "live_mode" ? "live" : "sandbox",
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });
  } else {
    await db().from("stripe_subscriptions")
      .update({
        status: providerStatus,
        current_period_end: periodEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", externalSubId);
  }

  const grants = eventType === "subscription.active" || eventType === "subscription.renewed";
  if (grants && userId && resolvedPlan && entry?.credits) {
    await ensurePlan(userId, resolvedPlan, periodEnd, userPlanStatus);
    const cycleKey = payload.payment_id ?? periodEnd ?? eventType;
    await grantCreditsOnce(
      userId,
      entry.credits,
      "plan_grant",
      `dodo_sub:${subId}:${cycleKey}`,
      { plan: resolvedPlan, source: "dodo", subscription: subId, event: eventType },
    );
  } else if (userId && resolvedPlan) {
    // plan_changed updates the plan immediately; cancellation/failure/hold/
    // expiry update status so all product gates see the same billing truth.
    await syncPlanLifecycle(userId, resolvedPlan, userPlanStatus, periodEnd);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const secret = Deno.env.get("DODO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("dodo-webhook: DODO_WEBHOOK_SECRET is not configured");
    return new Response("webhook not configured", { status: 503 });
  }

  const body = await req.text();
  const webhookId = req.headers.get("webhook-id");
  const verified = await verifyDodoWebhook({
    secret,
    webhookId,
    webhookTimestamp: req.headers.get("webhook-timestamp"),
    webhookSignature: req.headers.get("webhook-signature"),
    body,
    toleranceSeconds: 300,
  });
  if (!verified.valid) {
    console.error("dodo-webhook rejected:", verified.reason);
    return new Response("invalid signature", { status: 400 });
  }

  let event: Record<string, any>;
  try { event = JSON.parse(body); }
  catch { return new Response("invalid json", { status: 400 }); }
  const eventType = String(event?.type ?? "");

  const { error: dupErr } = await db().from("payment_webhook_events").insert({
    provider: "dodo",
    event_id: webhookId,
    event_type: eventType,
  });
  if (dupErr) {
    if ((dupErr as { code?: string }).code === "23505") return ok({ duplicate: true });
    console.error("dodo-webhook event log error", dupErr);
    return new Response("event log failed", { status: 500 });
  }

  if (!DODO_HANDLED_EVENTS.has(eventType)) return ok({ ignored: eventType || "unknown" });

  const mode = Deno.env.get("DODO_ENVIRONMENT") === "live_mode" ? "live_mode" : "test_mode";
  try {
    const payload = (event.data ?? {}) as Record<string, any>;
    if (eventType === "payment.succeeded") await handlePaymentSucceeded(payload, mode);
    else if (eventType === "payment.failed") await handlePaymentFailed(payload);
    else await handleSubscriptionEvent(eventType, payload, mode);

    await db().from("payment_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "dodo").eq("event_id", webhookId);
    return ok({ handled: eventType });
  } catch (e) {
    console.error("dodo-webhook handler error:", e);
    await db().from("payment_webhook_events")
      .delete().eq("provider", "dodo").eq("event_id", webhookId).is("processed_at", null);
    return new Response("handler error", { status: 500 });
  }
});
