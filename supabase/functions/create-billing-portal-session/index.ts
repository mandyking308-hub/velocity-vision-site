import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

function resolveEnv(): StripeEnv {
  // Prefer live if configured; fall back to sandbox for dev.
  return Deno.env.get("STRIPE_LIVE_API_KEY") ? "live" : "sandbox";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve stripe customer id: subscription first, then payment_intents.meta.customer
    let customerId: string | null = null;
    const { data: sub } = await admin
      .from("stripe_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub?.stripe_customer_id) customerId = sub.stripe_customer_id as string;

    if (!customerId) {
      const { data: pi } = await admin
        .from("payment_intents")
        .select("meta")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      const row = (pi || []).find((r: any) => r?.meta?.customer);
      if (row) customerId = (row as any).meta.customer;
    }

    if (!customerId) {
      return new Response(JSON.stringify({ noCustomer: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try { body = await req.json(); } catch { /* empty body ok */ }
    const returnPath = typeof body?.returnPath === "string" ? body.returnPath : "/app/billing";
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const returnUrl = origin ? `${origin.replace(/\/$/, "")}${returnPath}` : returnPath;

    const env = resolveEnv();
    const stripe = createStripeClient(env);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: portal.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // Detail stays server-side only; the client gets a safe generic message.
    console.error("create-billing-portal-session error", e);
    return new Response(JSON.stringify({ error: "Could not open billing portal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
