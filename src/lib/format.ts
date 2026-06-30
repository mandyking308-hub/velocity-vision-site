// Locale-aware formatting helpers. All functions are safe to call on the
// server (edge functions) and the client — they only depend on the standard
// Intl APIs.
import i18n, { LANGUAGE_DEFAULTS, type SupportedLanguage } from "@/i18n";

/** Resolve the current UI language as a short code (en/es/fr). */
export function currentLanguage(): SupportedLanguage {
  const raw = (i18n.language || "en").slice(0, 2);
  return (["en", "es", "fr"].includes(raw) ? raw : "en") as SupportedLanguage;
}

/** Resolve the BCP-47 locale to use for Intl formatting. */
export function currentLocale(override?: string): string {
  if (override) return override;
  return LANGUAGE_DEFAULTS[currentLanguage()].locale;
}

export function formatNumber(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(currentLocale(), opts).format(value);
}

export function formatCurrency(value: number, currency: string, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(currentLocale(), { style: "currency", currency, ...opts }).format(value);
}

export function formatDate(value: Date | string | number, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat(currentLocale(), opts ?? { dateStyle: "medium" }).format(d);
}

export function formatDateTime(value: Date | string | number, timezone?: string) {
  const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat(currentLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(d);
}

export function formatRelativeTime(value: Date | string | number) {
  const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(currentLocale(), { numeric: "auto" });
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 604800), "week");
}

/** Country display name in the user's UI language. */
export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames([currentLocale()], { type: "region" }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

/** Language display name in the user's UI language. */
export function languageName(code: string): string {
  try {
    return new Intl.DisplayNames([currentLocale()], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}

/** Resolve the user's effective time zone (browser default fallback). */
export function currentTimezone(override?: string): string {
  if (override) return override;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
