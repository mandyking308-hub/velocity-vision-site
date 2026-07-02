import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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

    if (!["google", "microsoft"].includes(provider)) {
      return json({ error: "invalid_provider" }, 400);
    }

    const clientId = Deno.env.get("NYLAS_EU_CLIENT_ID");
    const apiUri = Deno.env.get("NYLAS_EU_API_URI") || "https://api.eu.nylas.com";
    const callback = Deno.env.get("NYLAS_CALLBACK_URI");
    if (!clientId || !callback) return json({ error: "nylas_not_configured" }, 500);

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
    });
    if (insertErr) {
      console.error("nylas_oauth_states insert", insertErr);
      return json({ error: "state_persist_failed" }, 500);
    }

    const url = new URL(`${apiUri.replace(/\/$/, "")}/v3/connect/auth`);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("provider", provider);
    url.searchParams.set("state", state);
    // Request the scopes we need for sending mail.
    if (provider === "google") {
      url.searchParams.set("scope", "https://www.googleapis.com/auth/gmail.send openid email profile");
    } else if (provider === "microsoft") {
      url.searchParams.set("scope", "Mail.Send offline_access openid email profile");
    }

    return json({ auth_url: url.toString(), state });
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
