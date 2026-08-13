/**
 * Dodo Payments webhook — INERT until DODO_WEBHOOK_SECRET exists.
 *
 * Verification: Standard Webhooks (webhook-id / webhook-timestamp /
 * webhook-signature), 300s tolerance, constant-time comparison.
 *
 * Idempotency is two-layered:
 *  1. Event level  — `payment_webhook_events` unique (provider, event_id).
 *  2. Financial    — `credit_ledger.dedupe_key` + unique payment/session ids,
 *                    exactly as the existing Stripe handler does.
 *
 * Fulfilment happens ONLY here — never from a browser return URL.
 * The existing Stripe webhook (`payments-webhook`) is untouched.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  DODO_HANDLED_EVENTS,
  DODO_PRODUCT_CATALOG,
  dodoSubscriptionStatus,
  isAllowedProductKey,
  verifyDodoWebhook,
} from "../_shared/dodo.ts";

let _db: ReturnType<typeof createClient> | null = null;
function db() {
  if (!_db) {
    _db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _db;
}

const ok = (extra: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ received: true, ...extra }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

/** Idempotent credit grant, identical semantics to the Stripe handler. */
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

async function ensurePlan(userId: string, plan: string, periodEndIso?: string | null) {
  const periodEnd = periodEndIso ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db().from("user_plans").select("id").eq("user_id", userId).maybeSingle();
  const upd = {
    plan,
    status: "active",
    period_start: new Date().toISOString(),
    period_end: periodEnd,
  };
  if (data) {
    await db().from("user_plans").update(upd).eq("user_id", userId);
  } else {
    await db().from("user_plans").insert({ user_id: userId, ...upd });
  }
}

function metaOf(payload: Record<string, any>): Record<string, string> {
  const m = payload?.metadata;
  return m && typeof m === "object" ? m as Record<string, string> : {};
}

// ── Payment events ────────────────────────────────────────────────────────
async function handlePaymentSucceeded(payload: Record<string, any>, mode: string) {
  const meta = metaOf(payload);
  const userId = meta.userId;
  const productKey = meta.productKey;
  if (!userId || !isAllowedProductKey(productKey)) return;
  const entry = DODO_PRODUCT_CATALOG[productKey];
  const externalId = payload.payment_id ?? payload.id ?? null;
  if (!externalId) return;

  // First-writer-wins on the external payment id (UNIQUE on stripe_session_id).
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
    if ((piErr as { code?: string }).code === "23505") return; // duplicate delivery
    console.error("dodo payment_intents insert error", piErr);
    return;
  }

  if (entry.kind === "plan_starter" && entry.plan && entry.credits) {
    await ensurePlan(userId, entry.plan);
    await grantCreditsOnce(userId, entry.credits, "plan_grant", `dodo_payment:${externalId}`, {
      plan: entry.plan, source: "dodo", payment: externalId,
    });
  } else if (entry.kind.startsWith("topup_") && entry.credits) {
    // `credit_topups.stripe_session_id` is a PARTIAL unique index, which
    // PostgREST upsert/ON CONFLICT cannot target — a plain insert with 23505
    // tolerance gives the same idempotency and actually writes the row.
    const { error: topupErr } = await db().from("credit_topups").insert({
      user_id: userId,
      pack: entry.kind.replace("topup_", ""),
      credits: entry.credits,
      amount: (payload.total_amount ?? 0) / 100,
      currency: (payload.currency || "usd").toLowerCase(),
      stripe_session_id: `dodo:${externalId}`,
    });
    if (topupErr && (topupErr as { code?: string }).code !== "23505") {
      console.error("dodo credit_topups insert error", topupErr);
    }
    await grantCreditsOnce(userId, entry.credits, "topup", `dodo_payment:${externalId}`, {
      pack: entry.kind, source: "dodo", payment: externalId,
    });
  } else if (entry.kind === "human_review") {
    const { error: hrErr } = await db().from("human_reviews").insert({
      user_id: userId,
      campaign_id: meta.refId || null,
      status: "purchased",
      amount: (payload.total_amount ?? 0) / 100,
      stripe_session_id: `dodo:${externalId}`,
    });
    if (hrErr && (hrErr as { code?: string }).code !== "23505") {
      console.error("dodo human_reviews insert error", hrErr);
    }
  }
}

async function handlePaymentFailed(payload: Record<string, any>) {
  const subId = payload.subscription_id;
  if (!subId) return;
  await db().from("stripe_subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("provider", "dodo")
    .eq("stripe_subscription_id", `dodo:${subId}`);
}

// ── Subscription events ───────────────────────────────────────────────────
async function handleSubscriptionEvent(
  eventType: string,
  payload: Record<string, any>,
  mode: string,
) {
  const meta = metaOf(payload);
  const userId = meta.userId;
  const subId = payload.subscription_id ?? payload.id;
  if (!subId) return;
  const productKey = isAllowedProductKey(meta.productKey) ? meta.productKey : null;
  const entry = productKey ? DODO_PRODUCT_CATALOG[productKey] : null;
  const status = dodoSubscriptionStatus(eventType, payload.status);
  const externalSubId = `dodo:${subId}`;
  const periodEnd = payload.next_billing_date ?? payload.previous_billing_date ?? null;

  if (userId) {
    // subscription.updated / subscription.plan_changed can arrive without our
    // checkout metadata. Never let a metadata-less event wipe the stored plan
    // or price: only overwrite them when this event actually identifies the
    // product.
    await db().from("stripe_subscriptions").upsert({
      user_id: userId,
      provider: "dodo",
      stripe_subscription_id: externalSubId,
      stripe_customer_id: payload.customer?.customer_id ?? "dodo_unknown",
      ...(payload.product_id ? { product_id: payload.product_id } : {}),
      ...(productKey ? { price_id: productKey } : {}),
      ...(entry?.plan ? { plan: entry.plan } : {}),
      status,
      current_period_end: periodEnd,
      cancel_at_period_end: !!payload.cancel_at_next_billing_date,
      environment: mode === "live_mode" ? "live" : "sandbox",
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });
  } else {
    await db().from("stripe_subscriptions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", externalSubId);
  }

  // Credits only on activation/renewal, keyed so retries can't double-grant.
  const grants = eventType === "subscription.active" || eventType === "subscription.renewed";
  if (grants && userId && entry?.plan && entry.credits) {
    const cycleKey = payload.payment_id ?? periodEnd ?? eventType;
    await ensurePlan(userId, entry.plan, periodEnd);
    await grantCreditsOnce(
      userId,
      entry.credits,
      "plan_grant",
      `dodo_sub:${subId}:${cycleKey}`,
      { plan: entry.plan, source: "dodo", subscription: subId, event: eventType },
    );
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
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  const eventType = String(event?.type ?? "");

  // Event-level idempotency — first writer owns the side effects.
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

  if (!DODO_HANDLED_EVENTS.has(eventType)) {
    return ok({ ignored: eventType || "unknown" });
  }

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
    // Let Dodo retry; the event row is removed so the retry can be processed.
    await db().from("payment_webhook_events")
      .delete().eq("provider", "dodo").eq("event_id", webhookId).is("processed_at", null);
    return new Response("handler error", { status: 500 });
  }
});
