// Buffer OAuth + GraphQL shared PURE helpers.
// No env access, no secrets, no network — safe to import from edge functions,
// frontend code and unit tests. Never put tokens or client secrets here.

export const BUFFER_AUTH_URL = "https://auth.buffer.com/auth";
export const BUFFER_TOKEN_URL = "https://auth.buffer.com/token";
export const BUFFER_GRAPHQL_URL = "https://api.buffer.com";

// Minimum scopes for the connect flow. No posts:read — we never read posts back.
export const BUFFER_SCOPES = "account:read posts:write offline_access";

export const BUFFER_STATE_TTL_MS = 10 * 60 * 1000;
export const MAX_POST_TEXT_LENGTH = 4000;

// Velocity platform label -> Buffer channel service. Used ONLY to recommend
// channels in the UI; the customer always makes the final channel choice.
export const BUFFER_SERVICE_HINTS: Record<string, string> = {
  linkedin: "linkedin",
  instagram: "instagram",
  x: "twitter",
  twitter: "twitter",
  facebook: "facebook",
  tiktok: "tiktok",
};

export function bufferServiceHint(platform: string | null | undefined): string | null {
  if (!platform) return null;
  return BUFFER_SERVICE_HINTS[platform.trim().toLowerCase()] ?? null;
}

// ---------------------------------------------------------------- PKCE ----
function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateState(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

// RFC 7636: 43-char verifier from 32 random bytes (base64url, no padding).
export function generateCodeVerifier(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function pkceChallengeS256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

// ----------------------------------------------------- Authorization URL ----
export function buildAuthorizationUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(BUFFER_AUTH_URL);
  url.searchParams.set("client_id", opts.clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", BUFFER_SCOPES);
  url.searchParams.set("state", opts.state);
  url.searchParams.set("code_challenge", opts.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

// ------------------------------------------------------------ GraphQL docs ----
export const ORGANIZATIONS_QUERY = `query BufferOrganizations {
  account {
    organizations {
      id
    }
  }
}`;

export const CHANNELS_QUERY = `query BufferChannels($organizationId: ID!) {
  channels(input: { organizationId: $organizationId }) {
    id
    name
    displayName
    service
    avatar
    isQueuePaused
  }
}`;

export const CREATE_POST_MUTATION = `mutation BufferCreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess {
      post {
        id
        status
        dueAt
      }
    }
    ... on MutationError {
      message
    }
  }
}`;

// -------------------------------------------------------------- createPost ----
export type BufferPostMode = "draft" | "queue" | "schedule";

export interface CreatePostRequest {
  channelId: string;
  text: string;
  mode: BufferPostMode;
  dueAt?: string | null;
}

export function isFutureIso(value: string | null | undefined, nowMs: number = Date.now()): boolean {
  if (!value || typeof value !== "string") return false;
  const t = Date.parse(value);
  // Require at least 60s in the future to avoid "just-past" races.
  return Number.isFinite(t) && t > nowMs + 60_000;
}

export function validateCreatePostRequest(
  body: unknown,
): { ok: true; value: CreatePostRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_body" };
  const b = body as Record<string, unknown>;

  const text = typeof b.text === "string" ? b.text.trim() : "";
  if (!text) return { ok: false, error: "text_required" };
  if (text.length > MAX_POST_TEXT_LENGTH) return { ok: false, error: "text_too_long" };

  const channelId = typeof b.channelId === "string" ? b.channelId.trim() : "";
  if (!channelId) return { ok: false, error: "channel_required" };

  const mode = b.mode;
  if (mode !== "draft" && mode !== "queue" && mode !== "schedule") {
    return { ok: false, error: "invalid_mode" };
  }

  let dueAt: string | null = null;
  if (mode === "schedule") {
    const raw = typeof b.dueAt === "string" ? b.dueAt : null;
    if (!isFutureIso(raw)) return { ok: false, error: "due_at_must_be_future" };
    dueAt = new Date(Date.parse(raw as string)).toISOString();
  }

  return { ok: true, value: { channelId, text, mode, dueAt } };
}

export function buildCreatePostVariables(args: CreatePostRequest): { input: Record<string, unknown> } {
  const { channelId, text, mode, dueAt } = args;
  if (mode === "schedule") {
    return {
      input: {
        channelId,
        text,
        schedulingType: "customScheduled",
        mode: "customScheduled",
        dueAt,
        saveToDraft: false,
      },
    };
  }
  // Draft = queued into Buffer but held as a draft; Queue = straight to queue.
  return {
    input: {
      channelId,
      text,
      schedulingType: "automatic",
      mode: "addToQueue",
      saveToDraft: mode === "draft",
    },
  };
}

// ----------------------------------------------------------- safe UI copy ----
export function confirmationForMode(mode: BufferPostMode): string {
  if (mode === "draft") return "Saved to Buffer draft";
  if (mode === "queue") return "Added to Buffer queue";
  return "Scheduled in Buffer";
}

// Buffer may force a post into draft/approval regardless of requested mode —
// preserve that truth rather than claiming the requested outcome.
export function confirmationForResult(mode: BufferPostMode, bufferStatus: string | null | undefined): string {
  const s = (bufferStatus || "").toLowerCase();
  if (s.includes("draft") || s.includes("approval")) return "Saved to Buffer draft";
  return confirmationForMode(mode);
}

// ----------------------------------------------------------- misc helpers ----
// Only same-origin relative paths may be used as a post-OAuth return target.
export function safeReturnTo(value: unknown, fallback = "/app/settings"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function computeAccessTokenExpiry(expiresInSeconds: unknown, nowMs: number = Date.now()): string {
  const secs =
    typeof expiresInSeconds === "number" && Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
      ? expiresInSeconds
      : 3600;
  // Refresh 60s before actual expiry to avoid borderline failures.
  return new Date(nowMs + Math.max(secs - 60, 60) * 1000).toISOString();
}

// Buffer refresh tokens are single-use: a successful refresh MUST return a new
// refresh token. A response without one is unusable — we never keep the old
// refresh token after a refresh attempt.
export function tokenResponseIsUsable(
  json: unknown,
): json is { access_token: string; refresh_token: string } {
  const j = json as Record<string, unknown> | null;
  return (
    !!j &&
    typeof j.access_token === "string" &&
    j.access_token.length > 0 &&
    typeof j.refresh_token === "string" &&
    j.refresh_token.length > 0
  );
}

// Convert a <input type="datetime-local"> value to a UTC ISO string.
export function localDateTimeToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = new Date(value);
  if (!Number.isFinite(t.getTime())) return null;
  return t.toISOString();
}
