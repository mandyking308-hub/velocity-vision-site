import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DODO_READINESS_OFFLINE,
  parseDodoReadiness,
  type DodoReadiness,
} from "@/lib/dodoReadiness";

/**
 * Runtime probe of the safe, secret-free `dodo-readiness` endpoint.
 * Any failure keeps the app in the safe onboarding state.
 */
export function useDodoReadiness() {
  const [readiness, setReadiness] = useState<DodoReadiness>(DODO_READINESS_OFFLINE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("dodo-readiness", { method: "GET" });
        if (!active) return;
        setReadiness(error ? DODO_READINESS_OFFLINE : parseDodoReadiness(data));
      } catch {
        if (active) setReadiness(DODO_READINESS_OFFLINE);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { readiness, loading };
}
