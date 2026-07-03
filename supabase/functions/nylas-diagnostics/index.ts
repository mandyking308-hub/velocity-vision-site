import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Founder/admin-only Nylas configuration diagnostic.
// Returns non-secret metadata (env-var presence, region, mode, client ID
// suffix). Never returns API keys or full client IDs.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);
    const userClient = createClient(supabaseUrl, publishable, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const roleSet = new Set((roles || []).map((r: any) => r.role));
    if (!roleSet.has("admin") && !roleSet.has("founder")) return json({ error: "forbidden" }, 403);

    const isProd = (Deno.env.get("NYLAS_ENV") || "production").toLowerCase() !== "dev";
    const usClientId = Deno.env.get("NYLAS_US_CLIENT_ID");
    const usApiKey = Deno.env.get("NYLAS_US_API_KEY");
    const genericClientId = Deno.env.get("NYLAS_CLIENT_ID");
    const genericApiKey = Deno.env.get("NYLAS_API_KEY");
    const apiUri = Deno.env.get("NYLAS_US_API_URI") || "https://api.us.nylas.com";
    const callback = Deno.env.get("NYLAS_CALLBACK_URI");

    const productionReady = Boolean(usClientId && usApiKey && callback);
    const sandboxRisk = isProd && !usClientId && Boolean(genericClientId);
    const mode = !isProd ? "dev"
      : productionReady ? "production"
      : sandboxRisk ? "sandbox_risk"
      : "not_configured";

    return json({
      mode,
      region: "us",
      api_uri: apiUri,
      callback_uri_configured: Boolean(callback),
      client_id_suffix: usClientId ? usClientId.slice(-6) : null,
      secrets_present: {
        NYLAS_US_CLIENT_ID: Boolean(usClientId),
        NYLAS_US_API_KEY: Boolean(usApiKey),
        NYLAS_US_API_URI: Boolean(Deno.env.get("NYLAS_US_API_URI")),
        NYLAS_CALLBACK_URI: Boolean(callback),
        NYLAS_CLIENT_ID_generic: Boolean(genericClientId),
        NYLAS_API_KEY_generic: Boolean(genericApiKey),
      },
      connectors: {
        google: "setup_required",
        microsoft: "setup_required",
        icloud: "setup_required",
        imap: "setup_required",
        ews: "setup_required",
      },
      notes: sandboxRisk
        ? "Generic NYLAS_CLIENT_ID/NYLAS_API_KEY present without US-specific secrets — remove them or add NYLAS_US_* to avoid sandbox risk."
        : null,
    });
  } catch (e) {
    console.error("nylas-diagnostics error", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
