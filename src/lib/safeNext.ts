// Strict same-origin return-path sanitiser for the auth flow.
// Only an internal path on this app may ever be returned to. No external URL,
// protocol-relative host, javascript:, data:, or encoded open redirect.

const ALLOWED_NEXT_PATHS = new Set(["/app/billing"]);
const ALLOWED_BUY_VALUES = new Set(["starter", "growth", "agency"]);

/**
 * Returns a safe internal path, or null when the value is missing/unsafe.
 * Currently only `/app/billing` (optionally with an allow-listed `buy` plan)
 * is permitted, which is all the pricing bridge needs.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value) return null;

  // Tolerate a single layer of encoding from query-string round trips.
  if (!value.startsWith("/") && /%2f/i.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch {
      return null;
    }
  }
  if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.startsWith("/\t") || value.startsWith("/ ")) return null;

  let url: URL;
  try {
    url = new URL(value, "https://velocity-outreach.com");
  } catch {
    return null;
  }
  if (url.origin !== "https://velocity-outreach.com") return null;
  if (!ALLOWED_NEXT_PATHS.has(url.pathname)) return null;

  const buy = url.searchParams.get("buy");
  if (buy && !ALLOWED_BUY_VALUES.has(buy)) return null;

  return buy ? `${url.pathname}?buy=${buy}` : url.pathname;
}

/** Builds the auth link used by live-ready pricing CTAs. */
export function authNextForPlan(plan: string): string {
  const safe = ALLOWED_BUY_VALUES.has(plan) ? plan : null;
  const next = safe ? `/app/billing?buy=${safe}` : "/app/billing";
  return `/auth?next=${encodeURIComponent(next)}`;
}

/** Allow-list parse for the `?buy=` param on the billing page. */
export function parseBuyParam(raw: string | null | undefined): "starter" | "growth" | "agency" | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  return ALLOWED_BUY_VALUES.has(v) ? (v as "starter" | "growth" | "agency") : null;
}
