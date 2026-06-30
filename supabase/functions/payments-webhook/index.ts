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

async function grantCredits(userId: string, credits: number, reason: string, meta: Record<string, unknown>) {
  await db().from("credit_ledger").insert({ user_id: userId, delta: credits, reason, meta });
}

async function ensurePlan(userId: string, plan: string, recurring: boolean, currency?: string, billingCountry?: string | null) {
  const periodEnd = new Date(Date.now() + (recurring ? 30 : 30) * 24 * 60 * 60 * 1000).toISOString();
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

async function handleSubscriptionEvent(subscription: any, env: StripeEnv) {
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

  // On a fresh active subscription, set the user_plan + grant included credits
  if (subscription.status === "active" && planEntry?.plan && planEntry.credits) {
    const subCurrency = (item?.price?.currency || "usd").toUpperCase();
    await ensurePlan(userId, planEntry.plan, true, subCurrency);
    await grantCredits(userId, planEntry.credits, "plan_grant", { plan: planEntry.plan, source: "stripe", subscription: subscription.id });
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await db().from("stripe_subscriptions").update({
    status: "canceled", updated_at: new Date().toISOString(),
  }).eq("stripe_subscription_id", subscription.id).eq("environment", env);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  const userId = session.metadata?.userId;
  const priceKey = session.metadata?.priceId;
  if (!userId || !priceKey) return;
  const entry = PRICE_CATALOG[priceKey];
  if (!entry) return;

  // Record the payment_intent row
  await db().from("payment_intents").upsert({
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
  }, { onConflict: "stripe_session_id" });

  // Side effects
  if (entry.kind === "plan_starter" && entry.credits && entry.plan) {
    const sessCurrency = (session.currency || "usd").toUpperCase();
    const country = session.customer_details?.address?.country ?? null;
    await ensurePlan(userId, entry.plan, false, sessCurrency, country);
    await grantCredits(userId, entry.credits, "plan_grant", { plan: entry.plan, source: "stripe", session: session.id });
  } else if (entry.kind.startsWith("topup_") && entry.credits) {
    await db().from("credit_topups").insert({
      user_id: userId, pack: entry.kind.replace("topup_", ""), credits: entry.credits, amount: (session.amount_total ?? 0) / 100,
    });
    await grantCredits(userId, entry.credits, "topup", { pack: entry.kind, session: session.id });
  } else if (entry.kind === "human_review") {
    const campaignId = session.metadata?.refId;
    await db().from("human_reviews").insert({
      user_id: userId,
      campaign_id: campaignId || null,
      status: "purchased",
      amount: (session.amount_total ?? 0) / 100,
    });
  }
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
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object, env); break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env); break;
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
