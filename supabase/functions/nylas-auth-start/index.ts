import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Region-aware Nylas config resolver. Defaults to EU; US can be added by
// setting NYLAS_US_API_KEY / NYLAS_US_CLIENT_ID / NYLAS_US_API_URI later.
function nylasConfig(region: string) {
  const r = (region || "eu").toLowerCase() === "us" ? "US" : "EU";
  const defaultUri = r === "US" ? "https://api.us.nylas.com" : "https://api.eu.nylas.com";
  return {
    region: r.toLowerCase(),
    apiKey: Deno.env.get(`NYLAS_${r}_API_KEY`) ?? Deno.env.get("NYLAS_API_KEY"),
    clientId: Deno.env.get(`NYLAS_${r}_CLIENT_ID`) ?? Deno.env.get("NYLAS_CLIENT_ID"),
    apiUri: (Deno.env.get(`NYLAS_${r}_API_URI`) ?? defaultUri).replace(/\/$/, ""),
    callback: Deno.env.get("NYLAS_CALLBACK_URI"),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, publishable, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const provider = (body?.provider || "google").toString();
    const workspace_id = body?.workspace_id || null;
    const redirect_to = typeof body?.redirect_to === "string" ? body.redirect_to : null;
    const region = (body?.region || "eu").toString().toLowerCase();

    if (!["google", "microsoft"].includes(provider)) {
      return json({ error: "invalid_provider" }, 400);
    }
    if (!["eu", "us"].includes(region)) {
      return json({ error: "invalid_region" }, 400);
    }

    const cfg = nylasConfig(region);
    if (!cfg.clientId || !cfg.callback) return json({ error: "nylas_not_configured" }, 500);

    const state = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const nonce = crypto.randomUUID();

    const admin = createClient(supabaseUrl, serviceKey);
    const { error: insertErr } = await admin.from("nylas_oauth_states").insert({
      user_id: user.id,
      workspace_id,
      state,
      nonce,
      provider,
      redirect_to,
      region: cfg.region,
    });
    if (insertErr) {
      console.error("nylas_oauth_states insert", insertErr);
      return json({ error: "state_persist_failed" }, 500);
    }

    const url = new URL(`${cfg.apiUri}/v3/connect/auth`);
    url.searchParams.set("client_id", cfg.clientId);
    url.searchParams.set("redirect_uri", cfg.callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("provider", provider);
    url.searchParams.set("state", state);
    if (provider === "google") {
      url.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.send openid email profile");
    } else if (provider === "microsoft") {
      url.searchParams.set("scope", "Mail.Send offline_access openid email profile");
    }

    return json({ auth_url: url.toString(), state, region: cfg.region });
  } catch (e) {
    console.error("nylas-auth-start error:", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
