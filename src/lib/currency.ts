// International payments — currency, locale, pricing catalogue.
// Launch set: GBP (base), USD, EUR, CAD, AUD, MXN.
// Pricing strategy: direct FX, rounded to clean local numbers (Jun 2026 rates).

export const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR", "CAD", "AUD", "MXN"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
// Founder decision: unconfigured/unknown locales fall back cleanly to USD
// (international-first). GBP remains the base pricing currency for Stripe
// lookup keys — see priceIdFor below.
export const DEFAULT_CURRENCY: Currency = "USD";

export const CURRENCY_LABELS: Record<Currency, string> = {
  GBP: "£ GBP",
  USD: "$ USD",
  EUR: "€ EUR",
  CAD: "C$ CAD",
  AUD: "A$ AUD",
  MXN: "MX$ MXN",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: "£", USD: "$", EUR: "€", CAD: "C$", AUD: "A$", MXN: "MX$",
};

const EUR_COUNTRIES = new Set([
  "AT","BE","CY","DE","EE","ES","FI","FR","GR","HR",
  "IE","IT","LT","LU","LV","MT","NL","PT","SI","SK",
  "MC","SM","VA","AD",
]);
const GBP_COUNTRIES = new Set(["GB","GG","IM","JE"]);
const USD_COUNTRIES = new Set(["US","PR","EC","SV","PA"]);
const CAD_COUNTRIES = new Set(["CA"]);
const AUD_COUNTRIES = new Set(["AU","NZ","NF"]);
const MXN_COUNTRIES = new Set(["MX"]);

export function countryToCurrency(country?: string | null): Currency | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (GBP_COUNTRIES.has(c)) return "GBP";
  if (EUR_COUNTRIES.has(c)) return "EUR";
  if (USD_COUNTRIES.has(c)) return "USD";
  if (CAD_COUNTRIES.has(c)) return "CAD";
  if (AUD_COUNTRIES.has(c)) return "AUD";
  if (MXN_COUNTRIES.has(c)) return "MXN";
  return null;
}

function localeToCurrency(locale?: string | null): Currency | null {
  if (!locale) return null;
  const region = locale.split("-")[1]?.toUpperCase();
  return countryToCurrency(region);
}

export interface ResolveCurrencyInput {
  explicit?: string | null;
  billingCountry?: string | null;
  locale?: string | null;
}

/** Order: explicit -> billing country -> browser locale -> USD fallback. */
export function resolveCurrency(input: ResolveCurrencyInput = {}): Currency {
  const explicit = (input.explicit || "").toUpperCase();
  if ((SUPPORTED_CURRENCIES as readonly string[]).includes(explicit)) {
    return explicit as Currency;
  }
  return (
    countryToCurrency(input.billingCountry) ||
    localeToCurrency(input.locale) ||
    DEFAULT_CURRENCY
  );
}

/**
 * Stripe price lookup-key for a base SKU in a given currency.
 * Base currency is GBP — GBP uses the bare id, other currencies append `_<ccy>`.
 */
export function priceIdFor(baseId: string, currency: Currency): string {
  // Strip any existing _<ccy> suffix first (defensive — calls may pass already-resolved ids)
  const stripped = baseId.replace(/_(gbp|usd|eur|cad|aud|mxn)$/i, "");
  if (currency === "GBP") return stripped;
  return `${stripped}_${currency.toLowerCase()}`;
}

const STORAGE_KEY = "vv_currency";
const COUNTRY_KEY = "vv_country";

export function readStoredCurrency(): Currency | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY)?.toUpperCase();
  if (v && (SUPPORTED_CURRENCIES as readonly string[]).includes(v)) return v as Currency;
  return null;
}
export function writeStoredCurrency(c: Currency) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, c);
}
export function readStoredCountry(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COUNTRY_KEY);
}
export function writeStoredCountry(cc: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTRY_KEY, cc.toUpperCase());
}

// ---------- Formatting ----------
const LOCALE_FOR: Record<Currency, string> = {
  GBP: "en-GB", USD: "en-US", EUR: "de-DE", CAD: "en-CA", AUD: "en-AU", MXN: "es-MX",
};
export function formatPrice(amount: number, currency: Currency, opts: { decimals?: number } = {}): string {
  const fractionDigits = opts.decimals ?? (amount % 1 === 0 ? 0 : 2);
  try {
    return new Intl.NumberFormat(LOCALE_FOR[currency], {
      style: "currency", currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(fractionDigits)}`;
  }
}

// ---------- Catalogue: localised prices (rounded direct FX) ----------
// Keys are base SKU IDs that match PRICE_IDS in src/lib/stripe.ts
export type SkuId =
  | "vv_starter_oneoff"
  | "vv_growth_monthly"
  | "vv_agency_monthly"
  | "vv_human_review_oneoff"
  | "vv_topup_small"
  | "vv_topup_medium"
  | "vv_topup_large";

export const PRICE_CATALOGUE: Record<SkuId, Record<Currency, number>> = {
  vv_starter_oneoff:      { GBP: 149, USD: 189, EUR: 175, CAD: 259, AUD: 289, MXN: 3490 },
  vv_growth_monthly:      { GBP: 249, USD: 315, EUR: 289, CAD: 429, AUD: 479, MXN: 5790 },
  vv_agency_monthly:      { GBP: 499, USD: 629, EUR: 579, CAD: 859, AUD: 959, MXN: 11590 },
  vv_human_review_oneoff: { GBP: 199, USD: 249, EUR: 229, CAD: 339, AUD: 379, MXN: 4590 },
  vv_topup_small:         { GBP: 49,  USD: 59,  EUR: 55,  CAD: 79,  AUD: 89,  MXN: 1090 },
  vv_topup_medium:        { GBP: 119, USD: 149, EUR: 139, CAD: 199, AUD: 219, MXN: 2690 },
  vv_topup_large:         { GBP: 279, USD: 349, EUR: 329, CAD: 469, AUD: 529, MXN: 6290 },
};

/** Display the localised price for an SKU. Falls back gracefully to GBP if SKU unknown. */
export function priceFor(sku: SkuId | string, currency: Currency): { amount: number; formatted: string; currency: Currency } {
  const row = (PRICE_CATALOGUE as Record<string, Record<Currency, number>>)[sku];
  if (!row) {
    return { amount: 0, formatted: "—", currency };
  }
  const amount = row[currency] ?? row.GBP;
  return { amount, formatted: formatPrice(amount, currency), currency };
}

/** Short tax notice line shown near checkout / pricing CTAs. */
export function taxNotice(currency: Currency): string {
  if (currency === "GBP") return "Prices exclude VAT. Tax is calculated at checkout.";
  if (currency === "EUR") return "Prix HT. La TVA est calculée à la caisse selon votre pays.";
  if (currency === "USD" || currency === "CAD") return "Prices exclude sales tax. Tax is calculated at checkout based on your billing address.";
  if (currency === "AUD") return "Prices exclude GST. Tax is calculated at checkout.";
  if (currency === "MXN") return "Los precios no incluyen IVA. El impuesto se calcula al finalizar la compra.";
  return "Tax is calculated at checkout based on your billing address.";
}
