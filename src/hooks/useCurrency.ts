import { useCallback, useEffect, useState } from "react";
import {
  type Currency,
  resolveCurrency,
  readStoredCurrency,
  writeStoredCurrency,
  readStoredCountry,
  writeStoredCountry,
} from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

/**
 * Active currency + country for the current user/visitor.
 * US baseline: the default display currency is USD. Only an explicit choice may
 * move away from USD — URL override → stored selection → profile preference.
 * IP/geo and browser locale never auto-switch the default currency.
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
    // US baseline: default USD. Only an explicit stored/URL choice overrides it.
    return resolveCurrency({ explicit: url || readStoredCurrency() });
  });

  // Detect visitor country via Cloudflare trace (zero-auth, no key) for
  // display/diagnostics only. US baseline: geo never changes the currency —
  // only an explicit user selection or URL override may do that.
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
        // US baseline: only the explicit stored/profile preference wins over USD.
        const resolved = resolveCurrency({
          explicit: readStoredCurrency() || (profile as any).preferred_currency,
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
