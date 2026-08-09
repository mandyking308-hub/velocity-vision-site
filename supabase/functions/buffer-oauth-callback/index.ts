import { createClient } from "npm:@supabase/supabase-js@2";
import { loadBufferConfig } from "../_shared/buffer.ts";
import {
  BUFFER_SCOPES,
  BUFFER_TOKEN_URL,
  computeAccessTokenExpiry,
  safeReturnTo,
  tokenResponseIsUsable,
} from "../_shared/buffer-shared.ts";
import { encryptSecret } from "../_shared/email-crypto.ts";

// Public browser callback: Buffer redirects here with ?code&state. The user is
// resolved ONLY through the one-time server-stored state row. Redirects back
// to the app with a safe status query (?buffer=connected | ?buffer=error) —
// never tokens, never provider error dumps.
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const appOrigin = (Deno.env.get("APP_PUBLIC_ORIGIN") || "https://velocity-outreach.com").replace(/\/$/, "");

  function redirectBack(returnTo: string | null, params: Record<string, string>) {
    const target = new URL(`${appOrigin}${safeReturnTo(returnTo)}`);
    for (const [k, v] of Object.entries(params)) target.searchParams.set(k, v);
    return Response.redirect(target.toString(), 302);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    // Buffer denial / provider error: consume the state if present, then
    // redirect with a whitelisted reason only.
    if (errorParam) {
      if (state) {
        await admin
          .from("buffer_oauth_states")
          .update({ consumed_at: new Date().toISOString() })
          .eq("state", state)
          .is("consumed_at", null);
      }
      return redirectBack(null, {
        buffer: "error",
        reason: errorParam === "access_denied" ? "denied" : "provider_error",
      });
    }
    if (!code || !state) return redirectBack(null, { buffer: "error", reason: "missing_params" });

    const { data: stateRow } = await admin
      .from("buffer_oauth_states")
      .select("*")
      .eq("state", state)
      .maybeSingle();
    if (!stateRow) return redirectBack(null, { buffer: "error", reason: "unknown_state" });
    if (stateRow.consumed_at) return redirectBack(stateRow.return_to, { buffer: "error", reason: "state_consumed" });
    if (Date.parse(stateRow.expires_at) < Date.now()) {
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "state_expired" });
    }

    // Atomic one-time consume: only the first concurrent callback wins.
    const { data: consumed } = await admin
      .from("buffer_oauth_states")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", stateRow.id)
      .is("consumed_at", null)
      .select("id");
    if (!consumed || consumed.length === 0) {
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "state_consumed" });
    }

    const config = loadBufferConfig();
    if (!config.configured) {
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "buffer_not_configured" });
    }

    // Exchange the authorization code (exact redirect URI + PKCE verifier).
    const tokenRes = await fetch(BUFFER_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code_verifier: stateRow.code_verifier,
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => null);
    if (!tokenRes.ok || !tokenResponseIsUsable(tokenJson)) {
      console.error("buffer token exchange failed", { status: tokenRes.status });
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "token_exchange_failed" });
    }

    // Upsert the user's single account-level connection (safe metadata only).
    const { data: conn, error: connErr } = await admin
      .from("buffer_connections")
      .upsert(
        {
          user_id: stateRow.user_id,
          scopes: BUFFER_SCOPES,
          status: "connected",
          connected_at: new Date().toISOString(),
          access_token_expires_at: computeAccessTokenExpiry((tokenJson as any).expires_in),
          last_error: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();
    if (connErr || !conn) {
      console.error("buffer_connections upsert failed", connErr);
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "connection_save_failed" });
    }

    const encAccess = await encryptSecret(tokenJson.access_token);
    const encRefresh = await encryptSecret(tokenJson.refresh_token);
    const { error: secErr } = await admin.from("buffer_connection_secrets").upsert({
      connection_id: conn.id,
      encrypted_access_token: encAccess,
      encrypted_refresh_token: encRefresh,
      updated_at: new Date().toISOString(),
    });
    if (secErr) {
      console.error("buffer_connection_secrets upsert failed", secErr);
      return redirectBack(stateRow.return_to, { buffer: "error", reason: "connection_save_failed" });
    }

    return redirectBack(stateRow.return_to, { buffer: "connected" });
  } catch (e) {
    console.error("buffer-oauth-callback error:", e);
    return redirectBack(null, { buffer: "error", reason: "internal_error" });
  }
});
