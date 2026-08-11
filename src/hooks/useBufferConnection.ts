import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BufferConnectionState = "loading" | "not_connected" | "connected" | "reconnect_required";

/**
 * Reads the workspace's single Buffer connection row — the same record the
 * Buffer settings card and Send-to-Buffer dialog use. One integration, one
 * source of truth; this hook only exposes its status.
 */
export function useBufferConnection(): BufferConnectionState {
  const [state, setState] = useState<BufferConnectionState>("loading");

  useEffect(() => {
    let cancelled = false;
    (supabase.from as any)("buffer_connections")
      .select("status")
      .maybeSingle()
      .then(({ data }: any) => {
        if (cancelled) return;
        if (!data) setState("not_connected");
        else setState(data.status === "reconnect_required" ? "reconnect_required" : "connected");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
