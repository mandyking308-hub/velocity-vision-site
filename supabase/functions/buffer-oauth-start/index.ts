import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { loadBufferConfig } from "../_shared/buffer.ts";
import {
  BUFFER_STATE_TTL_MS,
  buildAuthorizationUrl,
  generateCodeVerifier,
  generateState,
  pkceChallengeS256,
  safeReturnTo,
} from "../_shared/buffer-shared.ts";

// Starts the Buffer OAuth Authorization Code + PKCE flow. Authenticated
// Velocity users only. Returns ONLY the authorization URL — the PKCE verifier
// and state stay server-side in buffer_oauth_states.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

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

    // Fail closed with a safe, configuration-only message.
    const config = loadBufferConfig();
    if (!config.configured) {
      return json({ error: "buffer_not_configured", message: "Buffer isn't configured yet." }, 503);
    }

    const body = await req.json().catch(() => ({}));
    const returnTo = safeReturnTo((body as Record<string, unknown>)?.return_to);

    const state = generateState();
    const verifier = generateCodeVerifier();
    const challenge = await pkceChallengeS256(verifier);

    const admin = createClient(supabaseUrl, serviceKey);
    const { error: insertErr } = await admin.from("buffer_oauth_states").insert({
      user_id: user.id,
      state,
      code_verifier: verifier,
      return_to: returnTo,
      expires_at: new Date(Date.now() + BUFFER_STATE_TTL_MS).toISOString(),
    });
    if (insertErr) {
      console.error("buffer_oauth_states insert failed", insertErr);
      return json({ error: "state_persist_failed" }, 500);
    }

    // Best-effort cleanup of long-expired states for this user.
    await admin
      .from("buffer_oauth_states")
      .delete()
      .eq("user_id", user.id)
      .lt("expires_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());

    const authorizationUrl = buildAuthorizationUrl({
      clientId: config.clientId!,
      redirectUri: config.redirectUri!,
      state,
      codeChallenge: challenge,
    });

    return json({ authorizationUrl });
  } catch (e) {
    console.error("buffer-oauth-start error:", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
