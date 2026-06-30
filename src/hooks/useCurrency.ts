import { useCallback, useEffect, useState } from "react";
import {
  type Currency,
  resolveCurrency,
  readStoredCurrency,
  writeStoredCurrency,
} from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for the user's active currency.
 * Resolution order: explicit (stored / profile) -> billing country -> browser locale -> USD.
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(() =>
    resolveCurrency({
      explicit: readStoredCurrency(),
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    }),
  );

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
        const resolved = resolveCurrency({
          explicit: readStoredCurrency() || profile.preferred_currency,
          billingCountry: profile.billing_country,
          locale: navigator.language,
        });
        setCurrencyState(resolved);
      } catch {
        /* anonymous */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback(async (c: Currency) => {
    setCurrencyState(c);
    writeStoredCurrency(c);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ preferred_currency: c })
          .eq("user_id", data.user.id);
      }
    } catch {
      /* anonymous */
    }
  }, []);

  return { currency, setCurrency };
}
