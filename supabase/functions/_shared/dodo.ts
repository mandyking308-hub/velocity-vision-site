/**
 * Dodo Payments shared helpers.
 *
 * IMPORTANT: this module is deliberately dependency-free and side-effect free
 * so it can be imported both by Deno edge functions and by the Vitest suite in
 * `src/test/`. It never touches the existing Stripe code path.
 *
 * Everything here is inert until the following server secrets exist:
 *   DODO_API_KEY        — server-side bearer key (never exposed to the client)
 *   DODO_ENVIRONMENT    — "test_mode" | "live_mode" (defaults to test_mode)
 *   DODO_PRODUCT_MAP    — JSON object: internal product key -> Dodo product id
 *   DODO_WEBHOOK_SECRET — Standard Webhooks signing secret
 */

export type DodoMode = "test_mode" | "live_mode";

export const DODO_BASE_URLS: Record<DodoMode, string> = {
  test_mode: "https://test.dodopayments.com",
  live_mode: "https://live.dodopayments.com",
};

/**
 * Internal product keys the client is allowed to reference. These mirror the
 * existing Stripe catalog keys so fulfilment semantics stay identical. The
 * client NEVER sends a Dodo product id or a price.
 */
export const DODO_ALLOWED_PRODUCT_KEYS = [
  "vv_starter_oneoff",
  "vv_growth_monthly",
  "vv_agency_monthly",
  "vv_human_review_oneoff",
  "vv_topup_small",
  "vv_topup_medium",
  "vv_topup_large",
] as const;

export type DodoProductKey = typeof DODO_ALLOWED_PRODUCT_KEYS[number];

export function isAllowedProductKey(value: unknown): value is DodoProductKey {
  return typeof value === "string" &&
    (DODO_ALLOWED_PRODUCT_KEYS as readonly string[]).includes(value);
}

/**
 * Fulfilment semantics per internal product key. Mirrors the Stripe
 * PRICE_CATALOG so credits/plan behaviour is identical regardless of provider.
 */
export const DODO_PRODUCT_CATALOG: Record<
  DodoProductKey,
  { kind: string; credits?: number; plan?: string; recurring: boolean }
> = {
  vv_starter_oneoff: { kind: "plan_starter", credits: 25, plan: "starter", recurring: false },
  vv_growth_monthly: { kind: "plan_growth", credits: 80, plan: "growth", recurring: true },
  vv_agency_monthly: { kind: "plan_agency", credits: 250, plan: "agency", recurring: true },
  vv_human_review_oneoff: { kind: "human_review", recurring: false },
  vv_topup_small: { kind: "topup_small", credits: 25, recurring: false },
  vv_topup_medium: { kind: "topup_medium", credits: 75, recurring: false },
  vv_topup_large: { kind: "topup_large", credits: 200, recurring: false },
};

export interface DodoConfig {
  apiKey: string;
  mode: DodoMode;
  baseUrl: string;
  productMap: Record<string, string>;
}

export type DodoConfigResult =
  | { ok: true; config: DodoConfig }
  | { ok: false; reason: string };

export function parseProductMap(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (isAllowedProductKey(k) && typeof v === "string" && v.trim()) out[k] = v.trim();
  }
  return out;
}

export function normaliseMode(raw: string | null | undefined): DodoMode {
  // Default is test-safe. Only an explicit "live_mode" opts into live.
  return raw === "live_mode" ? "live_mode" : "test_mode";
}

/**
 * Reads config from an env accessor. Returns ok:false (never throws, never
 * makes a network call) when anything required is missing.
 */
export function loadDodoConfig(getEnv: (key: string) => string | undefined): DodoConfigResult {
  const apiKey = getEnv("DODO_API_KEY")?.trim();
  if (!apiKey) return { ok: false, reason: "missing_api_key" };
  const mode = normaliseMode(getEnv("DODO_ENVIRONMENT"));
  const productMap = parseProductMap(getEnv("DODO_PRODUCT_MAP"));
  if (Object.keys(productMap).length === 0) return { ok: false, reason: "missing_product_map" };
  return { ok: true, config: { apiKey, mode, baseUrl: DODO_BASE_URLS[mode], productMap } };
}

// ── Return / cancel URL allow-list ────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://velocity-outreach.com",
  "https://www.velocity-outreach.com",
];

export function dodoReturnUrls(origin: string | null | undefined): { return_url: string; cancel_url: string } {
  const safeOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    return_url: `${safeOrigin}/app/billing?checkout=success`,
    cancel_url: `${safeOrigin}/app/billing?checkout=cancelled`,
  };
}

// ── Standard Webhooks verification ────────────────────────────────────────

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Standard Webhooks secrets are `whsec_<base64>`; some are raw strings. */
function secretToKeyBytes(secret: string): Uint8Array {
  const raw = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  try {
    return base64ToBytes(raw);
  } catch {
    return new TextEncoder().encode(raw);
  }
}

export interface VerifyWebhookInput {
  secret: string | undefined | null;
  webhookId: string | null;
  webhookTimestamp: string | null;
  webhookSignature: string | null;
  body: string;
  /** Tight tolerance in seconds. Standard Webhooks recommends 5 minutes; we use 300s. */
  toleranceSeconds?: number;
  /** Injectable for tests. */
  nowSeconds?: number;
}

export type VerifyWebhookResult =
  | { valid: true }
  | { valid: false; reason: string };

export async function verifyDodoWebhook(input: VerifyWebhookInput): Promise<VerifyWebhookResult> {
  const { secret, webhookId, webhookTimestamp, webhookSignature, body } = input;
  if (!secret) return { valid: false, reason: "missing_secret" };
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return { valid: false, reason: "missing_headers" };
  }

  const ts = Number(webhookTimestamp);
  if (!Number.isFinite(ts)) return { valid: false, reason: "invalid_timestamp" };
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = input.toleranceSeconds ?? 300;
  if (Math.abs(now - ts) > tolerance) return { valid: false, reason: "timestamp_out_of_tolerance" };

  const key = await crypto.subtle.importKey(
    "raw",
    secretToKeyBytes(secret) as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${webhookId}.${webhookTimestamp}.${body}`) as unknown as ArrayBuffer,
  );
  const expected = bytesToBase64(new Uint8Array(signed));

  // Header may contain multiple space-separated `v1,<sig>` values (rotation).
  const candidates = webhookSignature
    .split(" ")
    .map((part) => (part.includes(",") ? part.slice(part.indexOf(",") + 1) : part))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (timingSafeEqual(candidate, expected)) return { valid: true };
  }
  return { valid: false, reason: "signature_mismatch" };
}

/** Minimum documented launch events. Anything else is acknowledged, no-op. */
export const DODO_HANDLED_EVENTS = new Set([
  "payment.succeeded",
  "payment.failed",
  "subscription.active",
  "subscription.updated",
  "subscription.on_hold",
  "subscription.renewed",
  "subscription.plan_changed",
  "subscription.cancelled",
  "subscription.failed",
  "subscription.expired",
]);

/** Maps a Dodo subscription event to the status we persist. */
export function dodoSubscriptionStatus(eventType: string, payloadStatus?: string | null): string {
  switch (eventType) {
    case "subscription.active":
    case "subscription.renewed":
      return "active";
    case "subscription.on_hold":
      return "on_hold";
    case "subscription.failed":
      return "past_due";
    case "subscription.cancelled":
      return "canceled";
    case "subscription.expired":
      return "expired";
    default:
      return (payloadStatus || "active").toLowerCase();
  }
}

// ── Customer portal (subscription management) ─────────────────────────────

/** Where the hosted Dodo portal must send the customer back to. Allow-listed, never client supplied. */
export const DODO_PORTAL_RETURN_URL = `${ALLOWED_ORIGINS[0]}/app/billing`;

export interface DodoPortalConfig {
  apiKey: string;
  mode: DodoMode;
  baseUrl: string;
}

export type DodoPortalConfigResult =
  | { ok: true; config: DodoPortalConfig }
  | { ok: false; reason: string };

/**
 * Portal-only config. Deliberately does NOT require DODO_PRODUCT_MAP: opening
 * the management portal is unrelated to the checkout catalog.
 */
export function loadDodoPortalConfig(getEnv: (key: string) => string | undefined): DodoPortalConfigResult {
  const apiKey = getEnv("DODO_API_KEY")?.trim();
  if (!apiKey) return { ok: false, reason: "missing_api_key" };
  const mode = normaliseMode(getEnv("DODO_ENVIRONMENT"));
  return { ok: true, config: { apiKey, mode, baseUrl: DODO_BASE_URLS[mode] } };
}

/** Hostnames the portal link is allowed to live on. */
const DODO_PORTAL_HOST_SUFFIXES = ["dodopayments.com"];

/**
 * Only ever hand the browser an HTTPS link on a Dodo-hosted domain, so a
 * compromised or malformed provider response can't become an open redirect.
 */
export function isSafeDodoPortalLink(link: unknown): link is string {
  if (typeof link !== "string" || !link.trim()) return false;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return DODO_PORTAL_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}

// ── Checkout link safety ──────────────────────────────────────────────────

/** Hostnames a hosted Dodo checkout link is allowed to live on. */
const DODO_CHECKOUT_HOST_SUFFIXES = ["dodopayments.com"];

/**
 * Pure guard: only an HTTPS URL on an official Dodo-hosted domain may ever be
 * returned to (or followed by) the browser. Prevents a malformed or hostile
 * provider response from becoming an open redirect.
 */
export function isSafeDodoCheckoutLink(link: unknown): link is string {
  if (typeof link !== "string" || !link.trim()) return false;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return DODO_CHECKOUT_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}

// ── Checkout reference (refId) contract ──────────────────────────────────

/**
 * Only Human Review is fulfilled against a campaign, so it is the ONLY product
 * allowed to carry a refId. Every other product must be sent without one.
 */
export function isRefIdEligibleProduct(key: unknown): boolean {
  return key === "vv_human_review_oneoff";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Pure shape guard: a campaign reference must be a canonical UUID. */
export function isValidCampaignRefId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

// ── Safe public readiness ─────────────────────────────────────────────────

export interface DodoReadinessPayload {
  provider: "dodo";
  live: boolean;
  ready: boolean;
  products: Record<DodoProductKey, boolean>;
}

/**
 * Pure, secret-free readiness snapshot. Never performs a network call and
 * never leaks a key, product id, environment string or error detail.
 * `live` is true ONLY when an API key exists AND DODO_ENVIRONMENT is
 * explicitly `live_mode` AND at least one allow-listed product is mapped.
 * `ready` FAILS CLOSED for launch: it is true only when ALL SEVEN launch
 * products are mapped. Per-product booleans stay available so surfaces can
 * show exactly what is still missing without leaking ids.
 */
export function computeDodoReadiness(getEnv: (key: string) => string | undefined): DodoReadinessPayload {
  const cfg = loadDodoConfig(getEnv);
  const live = cfg.ok && cfg.config.mode === "live_mode";
  const map = cfg.ok ? cfg.config.productMap : {};
  const products = {} as Record<DodoProductKey, boolean>;
  for (const key of DODO_ALLOWED_PRODUCT_KEYS) {
    products[key] = live && typeof map[key] === "string" && map[key].trim().length > 0;
  }
  const ready = live && Object.values(products).every(Boolean);
  return { provider: "dodo", live: live && Object.values(products).some(Boolean), ready, products };
}
