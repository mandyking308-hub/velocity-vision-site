// International payments — currency model.
// Supported launch set: GBP, USD, EUR. Designed to extend cleanly.

export const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "USD";

export const CURRENCY_LABELS: Record<Currency, string> = {
  GBP: "£ GBP",
  USD: "$ USD",
  EUR: "€ EUR",
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

// EU member states (ISO-3166 alpha-2) that bill in EUR by default.
const EUR_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  "MC", "SM", "VA", "AD",
]);

const GBP_COUNTRIES = new Set(["GB", "GG", "IM", "JE"]);

export function countryToCurrency(country?: string | null): Currency | null {
  if (!country) return null;
  const c = country.toUpperCase();
  if (GBP_COUNTRIES.has(c)) return "GBP";
  if (EUR_COUNTRIES.has(c)) return "EUR";
  if (c === "US") return "USD";
  return null;
}

function localeToCurrency(locale?: string | null): Currency | null {
  if (!locale) return null;
  const region = locale.split("-")[1]?.toUpperCase();
  return countryToCurrency(region);
}

export interface ResolveCurrencyInput {
  explicit?: string | null;       // user-selected
  billingCountry?: string | null; // from profile / tax address
  locale?: string | null;         // browser locale
}

/**
 * Order: explicit selection -> billing/tax country -> browser locale -> USD.
 */
export function resolveCurrency(input: ResolveCurrencyInput = {}): Currency {
  const explicit = (input.explicit || "").toUpperCase();
  if ((SUPPORTED_CURRENCIES as readonly string[]).includes(explicit)) {
    return explicit as Currency;
  }
  const byCountry = countryToCurrency(input.billingCountry);
  if (byCountry) return byCountry;
  const byLocale = localeToCurrency(input.locale);
  if (byLocale) return byLocale;
  return DEFAULT_CURRENCY;
}

/**
 * Map a base price id to its localized variant.
 * Convention: base = USD; GBP appends "_gbp"; EUR appends "_eur".
 */
export function priceIdFor(baseId: string, currency: Currency): string {
  if (currency === "USD") return baseId;
  const suffix = currency.toLowerCase();
  // If the base id already encodes the currency, return as-is.
  if (baseId.endsWith(`_${suffix}`)) return baseId;
  return `${baseId}_${suffix}`;
}

const STORAGE_KEY = "vv_currency";

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
