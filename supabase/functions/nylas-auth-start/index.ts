import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Region-aware Nylas config resolver.
// Production strict mode: when NYLAS_ENV !== "dev", ONLY region-specific
// secrets (NYLAS_US_* / NYLAS_EU_*) are used. The generic NYLAS_CLIENT_ID /
// NYLAS_API_KEY (historically sandbox) are ignored in production so we can
// never silently fall through to a sandbox Nylas application.
function nylasConfig(region: string) {
  const r = (region || "us").toLowerCase() === "eu" ? "EU" : "US";
  const isProd = (Deno.env.get("NYLAS_ENV") || "production").toLowerCase() !== "dev";
  const defaultUri = r === "US" ? "https://api.us.nylas.com" : "https://api.eu.nylas.com";
  const regionApiKey = Deno.env.get(`NYLAS_${r}_API_KEY`);
  const regionClientId = Deno.env.get(`NYLAS_${r}_CLIENT_ID`);
  const fallbackApiKey = Deno.env.get("NYLAS_API_KEY");
  const fallbackClientId = Deno.env.get("NYLAS_CLIENT_ID");
  const apiKey = isProd ? regionApiKey : (regionApiKey ?? fallbackApiKey);
  const clientId = isProd ? regionClientId : (regionClientId ?? fallbackClientId);
  const apiUri = (Deno.env.get(`NYLAS_${r}_API_URI`) ?? defaultUri).replace(/\/$/, "");
  const callback = Deno.env.get("NYLAS_CALLBACK_URI");
  return {
    mode: isProd ? "production" : "dev",
    region: r.toLowerCase(),
    envNames: {
      apiKey: `NYLAS_${r}_API_KEY`,
      fallbackApiKey: "NYLAS_API_KEY",
      clientId: `NYLAS_${r}_CLIENT_ID`,
      fallbackClientId: "NYLAS_CLIENT_ID",
      apiUri: `NYLAS_${r}_API_URI`,
      callback: "NYLAS_CALLBACK_URI",
    },
    exists: {
      regionApiKey: Boolean(regionApiKey),
      regionClientId: Boolean(regionClientId),
      apiUri: Boolean(Deno.env.get(`NYLAS_${r}_API_URI`)),
      callback: Boolean(callback),
      fallbackApiKey: Boolean(fallbackApiKey),
      fallbackClientId: Boolean(fallbackClientId),
    },
    productionStrict: isProd,
    missingProductionSecrets: isProd && (!regionApiKey || !regionClientId),
    apiKey,
    clientId,
    apiUri,
    callback,
  };
}

function edgeRequestId(req: Request) {
  return req.headers.get("sb-request-id")
    ?? req.headers.get("x-sb-request-id")
    ?? req.headers.get("x-request-id")
    ?? "unavailable";
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
    const region = (body?.region || "us").toString().toLowerCase();

    // Providers must be enabled on the active Nylas application (dev or
    // production) for the region being used. Yahoo/EWS/etc. are added here
    // only when the corresponding Nylas connector is enabled.
    if (!["google", "microsoft", "icloud", "imap", "ews", "yahoo"].includes(provider)) {
      return json({ error: "invalid_provider" }, 400);
    }
    if (!["eu", "us"].includes(region)) {
      return json({ error: "invalid_region" }, 400);
    }

    const cfg = nylasConfig(region);
    console.info("nylas-auth-start diagnostics", {
      request_id: edgeRequestId(req),
      mode: cfg.mode,
      selected_region: cfg.region,
      env_var_names_read: cfg.envNames,
      env_exists: cfg.exists,
      client_id_suffix: cfg.clientId ? cfg.clientId.slice(-6) : null,
      api_uri: cfg.apiUri,
      callback_uri_configured: Boolean(cfg.callback),
      provider_requested: provider,
    });
    if (cfg.missingProductionSecrets) {
      return json({ error: "nylas_production_not_configured", detail: "Production requires NYLAS_US_CLIENT_ID and NYLAS_US_API_KEY. Sandbox fallback disabled." }, 500);
    }
    if (!cfg.clientId || !cfg.apiKey || !cfg.callback) return json({ error: "nylas_not_configured" }, 500);

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
      url.searchParams.set(
        "scope",
        [
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
          "openid",
        ].join(" "),
      );
    } else if (provider === "microsoft") {
      url.searchParams.set(
        "scope",
        [
          "https://graph.microsoft.com/Mail.Send",
          "https://graph.microsoft.com/User.Read",
          "offline_access",
          "openid",
        ].join(" "),
      );
    }
    // For icloud / imap / ews, do not set explicit provider scopes — Nylas
    // Hosted Auth applies the connector's default scopes. Passing Gmail or
    // Microsoft Graph scopes here would break the flow.

    console.info("nylas-auth-start hosted auth url", {
      request_id: edgeRequestId(req),
      provider_requested: provider,
      hosted_auth_url: url.toString(),
    });

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
