// Server-side Buffer helpers: config, GraphQL transport, and token handling
// with atomic single-use refresh-token rotation. Edge functions ONLY — never
// import this from frontend code. Tokens are AES-GCM encrypted at rest via the
// same EMAIL_ENC_KEY model used for email connection secrets.
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { encryptSecret, decryptSecret } from "./email-crypto.ts";
import {
  BUFFER_GRAPHQL_URL,
  BUFFER_TOKEN_URL,
  CHANNELS_QUERY,
  ORGANIZATIONS_QUERY,
  computeAccessTokenExpiry,
  tokenResponseIsUsable,
} from "./buffer-shared.ts";

export interface BufferConfig {
  configured: boolean;
  clientId: string | null;
  clientSecret: string | null;
  redirectUri: string | null;
}

export function loadBufferConfig(): BufferConfig {
  const clientId = Deno.env.get("BUFFER_CLIENT_ID") || null;
  const clientSecret = Deno.env.get("BUFFER_CLIENT_SECRET") || null;
  const redirectUri = Deno.env.get("BUFFER_REDIRECT_URI") || null;
  return {
    configured: Boolean(clientId && clientSecret && redirectUri),
    clientId,
    clientSecret,
    redirectUri,
  };
}

export interface BufferChannel {
  id: string;
  name: string | null;
  displayName: string | null;
  service: string | null;
  avatar: string | null;
  isQueuePaused: boolean | null;
  organizationId: string;
}

export async function bufferGraphql(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ ok: true; data: any } | { ok: false; status: number; message: string }> {
  try {
    const res = await fetch(BUFFER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, message: `http_${res.status}` };
    }
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      const msg = String(payload.errors[0]?.message ?? "graphql_error").slice(0, 200);
      return { ok: false, status: 200, message: msg };
    }
    return { ok: true, data: payload?.data ?? null };
  } catch (e) {
    return { ok: false, status: 0, message: `network_error:${(e as Error)?.name ?? "unknown"}` };
  }
}

export async function markReconnectRequired(
  admin: SupabaseClient,
  connectionId: string,
  reason: string,
): Promise<void> {
  await admin
    .from("buffer_connections")
    .update({
      status: "reconnect_required",
      last_error: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId);
}

type TokenResult =
  | { ok: true; accessToken: string; connectionId: string }
  | { ok: false; error: "not_connected" | "reconnect_required" | "not_configured" };

// Resolves a valid access token for the user's single Buffer connection,
// refreshing (with atomic rotation of the single-use refresh token) when
// needed. Returns safe error codes only — never token material.
export async function getValidAccessToken(
  admin: SupabaseClient,
  userId: string,
  config: BufferConfig,
): Promise<TokenResult> {
  if (!config.configured) return { ok: false, error: "not_configured" };

  const { data: conn } = await admin
    .from("buffer_connections")
    .select("id, status, access_token_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!conn) return { ok: false, error: "not_connected" };
  if (conn.status === "reconnect_required") return { ok: false, error: "reconnect_required" };

  const { data: secrets } = await admin
    .from("buffer_connection_secrets")
    .select("encrypted_access_token, encrypted_refresh_token")
    .eq("connection_id", conn.id)
    .maybeSingle();
  if (!secrets) {
    await markReconnectRequired(admin, conn.id, "Buffer connection needs to be reconnected.");
    return { ok: false, error: "reconnect_required" };
  }

  const expiresAt = conn.access_token_expires_at ? Date.parse(conn.access_token_expires_at) : 0;
  if (expiresAt > Date.now() + 60_000) {
    try {
      return { ok: true, accessToken: await decryptSecret(secrets.encrypted_access_token), connectionId: conn.id };
    } catch {
      return { ok: false, error: "reconnect_required" };
    }
  }

  // --- Refresh path (single-use refresh token rotation) ---
  const oldRefreshEnc: string = secrets.encrypted_refresh_token;
  let refreshPlain: string;
  try {
    refreshPlain = await decryptSecret(oldRefreshEnc);
  } catch {
    await markReconnectRequired(admin, conn.id, "Buffer connection needs to be reconnected.");
    return { ok: false, error: "reconnect_required" };
  }

  const tokenRes = await fetch(BUFFER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshPlain,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });
  const tokenJson = await tokenRes.json().catch(() => null);

  if (!tokenRes.ok || !tokenResponseIsUsable(tokenJson)) {
    // A failed refresh may mean revocation OR that a concurrent invocation
    // already rotated the token (single-use). Re-read before concluding:
    // if the stored token changed, use the fresh row instead of forcing a
    // reconnect. Never blindly retry an already-rotated refresh token.
    const { data: fresh } = await admin
      .from("buffer_connection_secrets")
      .select("encrypted_access_token, encrypted_refresh_token")
      .eq("connection_id", conn.id)
      .maybeSingle();
    if (fresh && fresh.encrypted_refresh_token !== oldRefreshEnc) {
      try {
        return { ok: true, accessToken: await decryptSecret(fresh.encrypted_access_token), connectionId: conn.id };
      } catch {
        // fall through to reconnect_required
      }
    }
    console.error("buffer token refresh failed", { status: tokenRes.status });
    await markReconnectRequired(admin, conn.id, "Buffer connection expired. Reconnect to continue.");
    return { ok: false, error: "reconnect_required" };
  }

  const encAccess = await encryptSecret(tokenJson.access_token);
  const encRefresh = await encryptSecret(tokenJson.refresh_token);
  const expiresAtIso = computeAccessTokenExpiry((tokenJson as any).expires_in);

  // Optimistic guarded update: only write the rotated tokens if the stored
  // refresh token is still the one we consumed. If another invocation won the
  // race, discard ours and use the stored winner's access token.
  const { data: updated } = await admin
    .from("buffer_connection_secrets")
    .update({
      encrypted_access_token: encAccess,
      encrypted_refresh_token: encRefresh,
      updated_at: new Date().toISOString(),
    })
    .eq("connection_id", conn.id)
    .eq("encrypted_refresh_token", oldRefreshEnc)
    .select("connection_id");

  await admin
    .from("buffer_connections")
    .update({ access_token_expires_at: expiresAtIso, last_error: null, updated_at: new Date().toISOString() })
    .eq("id", conn.id);

  if (updated && updated.length > 0) {
    return { ok: true, accessToken: tokenJson.access_token, connectionId: conn.id };
  }

  // Lost the race — the row now holds a different (newer) rotation. Use it.
  const { data: winner } = await admin
    .from("buffer_connection_secrets")
    .select("encrypted_access_token")
    .eq("connection_id", conn.id)
    .maybeSingle();
  if (winner) {
    try {
      return { ok: true, accessToken: await decryptSecret(winner.encrypted_access_token), connectionId: conn.id };
    } catch {
      // fall through
    }
  }
  await markReconnectRequired(admin, conn.id, "Buffer connection needs to be reconnected.");
  return { ok: false, error: "reconnect_required" };
}

// Lists every channel across all of the account's organizations. Returns safe
// channel metadata only.
export async function listAllChannels(
  accessToken: string,
): Promise<{ ok: true; channels: BufferChannel[] } | { ok: false; message: string }> {
  const orgsRes = await bufferGraphql(accessToken, ORGANIZATIONS_QUERY);
  if (!orgsRes.ok) return { ok: false, message: orgsRes.message };
  const orgs: Array<{ id: string }> = orgsRes.data?.account?.organizations ?? [];

  const channels: BufferChannel[] = [];
  for (const org of orgs) {
    const chRes = await bufferGraphql(accessToken, CHANNELS_QUERY, { organizationId: org.id });
    if (!chRes.ok) return { ok: false, message: chRes.message };
    const list: any[] = chRes.data?.channels ?? [];
    for (const c of list) {
      channels.push({
        id: String(c.id),
        name: typeof c.name === "string" ? c.name : null,
        displayName: typeof c.displayName === "string" ? c.displayName : null,
        service: typeof c.service === "string" ? c.service : null,
        avatar: typeof c.avatar === "string" ? c.avatar : null,
        isQueuePaused: typeof c.isQueuePaused === "boolean" ? c.isQueuePaused : null,
        organizationId: org.id,
      });
    }
  }
  return { ok: true, channels };
}
