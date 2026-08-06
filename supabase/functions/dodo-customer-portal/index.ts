/**
 * Dodo Payments customer portal session — INERT until DODO_API_KEY exists.
 *
 * Opens the official hosted portal so a Dodo subscriber can manage their
 * subscription, payment methods, invoices and cancellation.
 *
 * Security model:
 *  - Requires an authenticated Supabase user.
 *  - Accepts NOTHING from the browser: no customer id, no provider id, no URL.
 *  - The Dodo customer id is resolved server-side from the authenticated
 *    user's latest `provider = 'dodo'` subscription row.
 *  - Returns a controlled `payments_not_configured` / `no_customer` response
 *    instead of calling the provider when it cannot proceed.
 *  - The returned link is validated as HTTPS on a Dodo-hosted domain.
 *  - Secrets and customer ids are never logged or returned.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  DODO_PORTAL_RETURN_URL,
  isSafeDodoPortalLink,
  loadDodoPortalConfig,
} from "../_shared/dodo.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
    if (!user) return json({ error: "unauthorized" }, 401);

    // Config gate first — no external call when the provider isn't wired up.
    const cfg = loadDodoPortalConfig((k) => Deno.env.get(k));
    if (!cfg.ok) {
      return json({ error: "payments_not_configured", reason: cfg.reason }, 503);
    }

    const { data: sub } = await supabase
      .from("stripe_subscriptions")
      .select("stripe_customer_id, created_at")
      .eq("user_id", user.id)
      .eq("provider", "dodo")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const customerId = (sub?.stripe_customer_id as string | null | undefined)?.trim();
    if (!customerId) return json({ error: "no_customer" }, 404);

    const url = new URL(
      `${cfg.config.baseUrl}/customers/${encodeURIComponent(customerId)}/customer-portal/session`,
    );
    url.searchParams.set("send_email", "false");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ return_url: DODO_PORTAL_RETURN_URL, send_email: false }),
    });

    if (!response.ok) {
      // Status only — provider bodies can echo customer identifiers.
      console.error(`dodo-customer-portal provider error [${response.status}]`);
      return json({ error: "provider_error", status: response.status }, 502);
    }

    const payload = await response.json().catch(() => ({}));
    const link = (payload as Record<string, unknown>).link;
    if (!isSafeDodoPortalLink(link)) {
      console.error("dodo-customer-portal rejected unsafe portal link");
      return json({ error: "invalid_portal_link" }, 502);
    }

    return json({ url: link });
  } catch (e) {
    console.error("dodo-customer-portal error:", e instanceof Error ? e.message : "unknown");
    return json({ error: "portal_failed" }, 500);
  }
});
