/**
 * Safe, public, secret-free Dodo readiness probe.
 *
 * Returns ONLY booleans for allow-listed internal product keys so the public
 * Pricing page can switch CTAs at runtime with no code release. It never
 * exposes a secret, key, product id, customer id, environment value or error
 * detail, and it never performs an external Dodo API call.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { computeDodoReadiness } from "../_shared/dodo.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let payload;
  try {
    payload = computeDodoReadiness((k) => Deno.env.get(k));
  } catch {
    // Fail closed: an unreadable config must look "not ready", never leak why.
    payload = {
      provider: "dodo",
      live: false,
      ready: false,
      products: {
        vv_starter_oneoff: false,
        vv_growth_monthly: false,
        vv_agency_monthly: false,
        vv_human_review_oneoff: false,
        vv_topup_small: false,
        vv_topup_medium: false,
        vv_topup_large: false,
      },
    };
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
});
