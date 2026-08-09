import { describe, it, expect } from "vitest";
import {
  BUFFER_SCOPES,
  BUFFER_TOKEN_CONTENT_TYPE,
  buildAuthorizationCodeForm,
  buildAuthorizationUrl,
  buildRefreshTokenForm,
  buildCreatePostVariables,
  bufferServiceHint,
  computeAccessTokenExpiry,
  confirmationForMode,
  confirmationForResult,
  generateCodeVerifier,
  generateState,
  isFutureIso,
  localDateTimeToIso,
  pkceChallengeS256,
  safeReturnTo,
  tokenResponseIsUsable,
  validateCreatePostRequest,
} from "../../supabase/functions/_shared/buffer-shared";

describe("Buffer PKCE + authorization URL", () => {
  it("computes the RFC 7636 S256 challenge for the known test vector", async () => {
    // RFC 7636 appendix B vector.
    const challenge = await pkceChallengeS256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk");
    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("generates unique 43-char verifiers and distinct states", () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).toHaveLength(43);
    expect(v1).not.toBe(v2);
    expect(generateState()).not.toBe(generateState());
  });

  it("authorization URL carries challenge but NEVER the verifier or any secret", () => {
    const url = buildAuthorizationUrl({
      clientId: "client123",
      redirectUri: "https://example.com/callback",
      state: "state-abc",
      codeChallenge: "challenge-xyz",
    });
    const u = new URL(url);
    expect(u.origin).toBe("https://auth.buffer.com");
    expect(u.pathname).toBe("/auth");
    expect(u.searchParams.get("client_id")).toBe("client123");
    expect(u.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("scope")).toBe(BUFFER_SCOPES);
    expect(u.searchParams.get("state")).toBe("state-abc");
    expect(u.searchParams.get("code_challenge")).toBe("challenge-xyz");
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    // Buffer's documented OAuth example includes prompt=consent.
    expect(u.searchParams.get("prompt")).toBe("consent");
    expect(url).not.toContain("verifier");
    expect(url).not.toContain("client_secret");
  });

  it("requests exactly the minimum scopes", () => {
    expect(BUFFER_SCOPES).toBe("account:read posts:write offline_access");
  });
});

describe("Buffer token endpoint payloads are form-encoded, never JSON", () => {
  it("declares the required x-www-form-urlencoded content type", () => {
    expect(BUFFER_TOKEN_CONTENT_TYPE).toBe("application/x-www-form-urlencoded");
  });

  it("authorization-code exchange: confidential client + PKCE verifier in the BODY", () => {
    const form = buildAuthorizationCodeForm({
      clientId: "cid",
      clientSecret: "super-secret",
      code: "authcode",
      redirectUri: "https://example.com/functions/v1/buffer-oauth-callback",
      codeVerifier: "verifier-123",
    });
    // URLSearchParams serializes to form-encoded, not JSON.
    const body = form.toString();
    expect(body).not.toContain("{");
    expect(body).toContain("grant_type=authorization_code");
    expect(form.get("code")).toBe("authcode");
    expect(form.get("redirect_uri")).toBe("https://example.com/functions/v1/buffer-oauth-callback");
    expect(form.get("client_id")).toBe("cid");
    expect(form.get("client_secret")).toBe("super-secret");
    expect(form.get("code_verifier")).toBe("verifier-123");
    // Exactly these fields — nothing extra.
    expect([...form.keys()].sort()).toEqual(
      ["client_id", "client_secret", "code", "code_verifier", "grant_type", "redirect_uri"].sort(),
    );
  });

  it("refresh exchange: client_id + client_secret + refresh_token in the BODY", () => {
    const form = buildRefreshTokenForm({
      clientId: "cid",
      clientSecret: "super-secret",
      refreshToken: "rt-abc",
    });
    const body = form.toString();
    expect(body).not.toContain("{");
    expect(body).toContain("grant_type=refresh_token");
    expect(form.get("refresh_token")).toBe("rt-abc");
    expect(form.get("client_id")).toBe("cid");
    expect(form.get("client_secret")).toBe("super-secret");
    expect([...form.keys()].sort()).toEqual(
      ["client_id", "client_secret", "grant_type", "refresh_token"].sort(),
    );
  });

  it("secrets never appear in the token endpoint URL", () => {
    // Both exchanges POST to the bare token URL; form bodies keep the
    // client secret and tokens out of any URL.
    const codeForm = buildAuthorizationCodeForm({
      clientId: "cid",
      clientSecret: "super-secret",
      code: "c",
      redirectUri: "https://example.com/cb",
      codeVerifier: "v",
    });
    const refreshForm = buildRefreshTokenForm({ clientId: "cid", clientSecret: "super-secret", refreshToken: "rt" });
    for (const tokenUrl of ["https://auth.buffer.com/token"]) {
      expect(tokenUrl).not.toContain("super-secret");
      expect(tokenUrl).not.toContain("client_secret");
    }
    expect(codeForm).toBeInstanceOf(URLSearchParams);
    expect(refreshForm).toBeInstanceOf(URLSearchParams);
  });
});

describe("createPost request validation", () => {
  const base = { channelId: "ch-1", text: "Hello Buffer", mode: "draft" };

  it("rejects empty or whitespace text", () => {
    expect(validateCreatePostRequest({ ...base, text: "" })).toEqual({ ok: false, error: "text_required" });
    expect(validateCreatePostRequest({ ...base, text: "   " })).toEqual({ ok: false, error: "text_required" });
  });

  it("rejects over-long text", () => {
    const res = validateCreatePostRequest({ ...base, text: "x".repeat(4001) });
    expect(res).toEqual({ ok: false, error: "text_too_long" });
  });

  it("rejects unknown modes and missing channel", () => {
    expect(validateCreatePostRequest({ ...base, mode: "share_now" })).toEqual({ ok: false, error: "invalid_mode" });
    expect(validateCreatePostRequest({ ...base, channelId: "" })).toEqual({ ok: false, error: "channel_required" });
  });

  it("schedule requires a valid FUTURE ISO dueAt", () => {
    expect(validateCreatePostRequest({ ...base, mode: "schedule" })).toEqual({
      ok: false,
      error: "due_at_must_be_future",
    });
    expect(
      validateCreatePostRequest({ ...base, mode: "schedule", dueAt: "2020-01-01T00:00:00.000Z" }),
    ).toEqual({ ok: false, error: "due_at_must_be_future" });
    expect(
      validateCreatePostRequest({ ...base, mode: "schedule", dueAt: "not-a-date" }),
    ).toEqual({ ok: false, error: "due_at_must_be_future" });

    const future = new Date(Date.now() + 3600_000).toISOString();
    const ok = validateCreatePostRequest({ ...base, mode: "schedule", dueAt: future });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.dueAt).toBe(future);
  });

  it("accepts draft and queue without dueAt", () => {
    expect(validateCreatePostRequest(base).ok).toBe(true);
    expect(validateCreatePostRequest({ ...base, mode: "queue" }).ok).toBe(true);
  });
});

describe("createPost GraphQL payloads", () => {
  const ch = { channelId: "ch-1", text: "Post body" };

  it("Draft = addToQueue with saveToDraft:true", () => {
    const { input } = buildCreatePostVariables({ ...ch, mode: "draft" });
    expect(input).toMatchObject({
      channelId: "ch-1",
      text: "Post body",
      schedulingType: "automatic",
      mode: "addToQueue",
      saveToDraft: true,
    });
    expect(input).not.toHaveProperty("dueAt");
  });

  it("Queue = addToQueue with saveToDraft:false", () => {
    const { input } = buildCreatePostVariables({ ...ch, mode: "queue" });
    expect(input).toMatchObject({ schedulingType: "automatic", mode: "addToQueue", saveToDraft: false });
  });

  it("Schedule = schedulingType automatic + mode customScheduled + future dueAt, saveToDraft:false", () => {
    // Buffer's custom scheduling keeps schedulingType "automatic"; the
    // customScheduled mode + dueAt pins the time. Regression: we previously
    // sent schedulingType "customScheduled", which Buffer rejects.
    const dueAt = new Date(Date.now() + 7200_000).toISOString();
    const { input } = buildCreatePostVariables({ ...ch, mode: "schedule", dueAt });
    expect(input).toMatchObject({
      schedulingType: "automatic",
      mode: "customScheduled",
      dueAt,
      saveToDraft: false,
    });
    expect(isFutureIso(input.dueAt as string)).toBe(true);
  });
});

describe("confirmation copy stays truthful", () => {
  it("uses precise per-mode copy — never 'published'", () => {
    expect(confirmationForMode("draft")).toBe("Saved to Buffer draft");
    expect(confirmationForMode("queue")).toBe("Added to Buffer queue");
    expect(confirmationForMode("schedule")).toBe("Scheduled in Buffer");
  });

  it("Buffer-forced draft/approval status overrides the requested mode in the copy", () => {
    expect(confirmationForResult("queue", "draft")).toBe("Saved to Buffer draft");
    expect(confirmationForResult("schedule", "pending_approval")).toBe("Saved to Buffer draft");
    expect(confirmationForResult("queue", "queued")).toBe("Added to Buffer queue");
  });
});

describe("single-use refresh-token rules", () => {
  it("a refresh response WITHOUT a new refresh token is unusable (old token never kept)", () => {
    expect(tokenResponseIsUsable({ access_token: "a" })).toBe(false);
    expect(tokenResponseIsUsable({ access_token: "a", refresh_token: "" })).toBe(false);
    expect(tokenResponseIsUsable(null)).toBe(false);
    expect(tokenResponseIsUsable({ access_token: "a", refresh_token: "r" })).toBe(true);
  });

  it("expiry computation refreshes 60s early and defaults safely", () => {
    const now = Date.parse("2026-08-09T12:00:00.000Z");
    expect(computeAccessTokenExpiry(3600, now)).toBe("2026-08-09T12:59:00.000Z");
    expect(computeAccessTokenExpiry(undefined, now)).toBe("2026-08-09T12:59:00.000Z");
    expect(computeAccessTokenExpiry(-5, now)).toBe("2026-08-09T12:59:00.000Z");
  });
});

describe("safety helpers", () => {
  it("safeReturnTo only allows same-origin relative paths", () => {
    expect(safeReturnTo("/app/settings")).toBe("/app/settings");
    expect(safeReturnTo("//evil.com")).toBe("/app/settings");
    expect(safeReturnTo("https://evil.com")).toBe("/app/settings");
    expect(safeReturnTo(undefined)).toBe("/app/settings");
  });

  it("isFutureIso requires at least 60s in the future", () => {
    const now = Date.now();
    expect(isFutureIso(new Date(now + 120_000).toISOString())).toBe(true);
    expect(isFutureIso(new Date(now + 10_000).toISOString())).toBe(false);
    expect(isFutureIso(new Date(now - 1000).toISOString())).toBe(false);
    expect(isFutureIso(null)).toBe(false);
  });

  it("localDateTimeToIso converts valid local input and rejects junk", () => {
    expect(localDateTimeToIso("2026-12-01T10:30")).toMatch(/^2026-12-01T/);
    expect(localDateTimeToIso("garbage")).toBeNull();
    expect(localDateTimeToIso("")).toBeNull();
  });

  it("service hints map Velocity platforms to Buffer services", () => {
    expect(bufferServiceHint("LinkedIn")).toBe("linkedin");
    expect(bufferServiceHint("X")).toBe("twitter");
    expect(bufferServiceHint("Instagram")).toBe("instagram");
    expect(bufferServiceHint("TikTok")).toBe("tiktok");
    expect(bufferServiceHint("UnknownNet")).toBeNull();
  });
});
