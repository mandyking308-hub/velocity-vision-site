// Locale-aware formatters. Driven by i18next current language + optional timezone.
import i18n from "@/i18n";
import type { Currency } from "@/lib/currency";

function bcp47(lang?: string): string {
  // Map our short codes to a reasonable BCP-47 default.
  const l = (lang || i18n.language || "en").toLowerCase();
  if (l.startsWith("es")) return "es-ES";
  if (l.startsWith("en")) return "en-GB";
  return l;
}

export function formatCurrency(
  amount: number,
  currency: Currency | string,
  opts: { lang?: string; maximumFractionDigits?: number } = {},
): string {
  try {
    return new Intl.NumberFormat(bcp47(opts.lang), {
      style: "currency",
      currency,
      maximumFractionDigits: opts.maximumFractionDigits ?? 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function formatNumber(n: number, lang?: string): string {
  try {
    return new Intl.NumberFormat(bcp47(lang)).format(n);
  } catch {
    return String(n);
  }
}

export function formatDate(
  d: Date | string | number,
  opts: { lang?: string; timeZone?: string; dateStyle?: "short" | "medium" | "long" | "full" } = {},
): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat(bcp47(opts.lang), {
      dateStyle: opts.dateStyle ?? "medium",
      timeZone: opts.timeZone,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function formatDateTime(
  d: Date | string | number,
  opts: { lang?: string; timeZone?: string } = {},
): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat(bcp47(opts.lang), {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: opts.timeZone,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function formatRelative(d: Date | string | number, lang?: string): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(bcp47(lang), { numeric: "auto" });
  const minute = 60_000, hour = 60 * minute, day = 24 * hour;
  if (abs < hour) return rtf.format(Math.round(diffMs / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diffMs / hour), "hour");
  return rtf.format(Math.round(diffMs / day), "day");
}

export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
