import { useCallback, useEffect, useState } from "react";
import {
  type Currency,
  resolveCurrency,
  readStoredCurrency,
  writeStoredCurrency,
  readStoredCountry,
  writeStoredCountry,
  countryToCurrency,
} from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

/**
 * Active currency + country for the current user/visitor.
 * Resolution order: URL override → stored selection → profile → IP/geo → browser locale → GBP.
 * URL overrides (for demos/QA): ?ccy=USD ?cc=US
 */
export function useCurrency() {
  const [country, setCountryState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);
    return (url.searchParams.get("cc") || readStoredCountry() || null)?.toUpperCase() ?? null;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const url = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("ccy") : null;
    return resolveCurrency({
      explicit: url || readStoredCurrency(),
      billingCountry: typeof window !== "undefined" ? readStoredCountry() : null,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    });
  });

  // Auto-detect country via Cloudflare trace (zero-auth, no key).
  useEffect(() => {
    if (country) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace");
        const text = await res.text();
        const match = text.match(/loc=([A-Z]{2})/);
        if (!match || cancelled) return;
        const cc = match[1];
        setCountryState(cc);
        writeStoredCountry(cc);
        // Only auto-adjust currency if user hasn't picked one explicitly.
        if (!readStoredCurrency()) {
          const derived = countryToCurrency(cc);
          if (derived) setCurrencyState(derived);
        }
      } catch {
        /* offline / blocked — keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, [country]);

  // Hydrate from profile when signed in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_currency, billing_country")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (cancelled || !profile) return;
        if (profile.billing_country && !readStoredCountry()) {
          setCountryState(profile.billing_country);
          writeStoredCountry(profile.billing_country);
        }
        const resolved = resolveCurrency({
          explicit: readStoredCurrency() || (profile as any).preferred_currency,
          billingCountry: profile.billing_country,
          locale: navigator.language,
        });
        setCurrencyState(resolved);
      } catch { /* anonymous */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const setCurrency = useCallback(async (c: Currency) => {
    setCurrencyState(c);
    writeStoredCurrency(c);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from("profiles").update({ preferred_currency: c } as any).eq("user_id", data.user.id);
      }
    } catch { /* anonymous */ }
  }, []);

  const setCountry = useCallback(async (cc: string) => {
    const upper = cc.toUpperCase();
    setCountryState(upper);
    writeStoredCountry(upper);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from("profiles").update({ billing_country: upper } as any).eq("user_id", data.user.id);
      }
    } catch { /* anonymous */ }
  }, []);

  return { currency, setCurrency, country, setCountry };
}
