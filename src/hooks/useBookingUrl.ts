import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

/**
 * Workspace-scoped booking link. Read-only hook — writes happen in settings.
 * Never throws: a missing link simply resolves to null so callers can deep-link
 * to the setting instead of failing.
 */
export function useBookingUrl(): { bookingUrl: string | null; loading: boolean; reload: () => void } {
  const { currentId } = useWorkspace();
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!currentId) {
        setBookingUrl(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("client_workspaces")
        .select("booking_url")
        .eq("id", currentId)
        .maybeSingle();
      if (!cancelled) {
        setBookingUrl(((data as any)?.booking_url as string) || null);
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentId, tick]);

  return { bookingUrl, loading, reload: () => setTick((t) => t + 1) };
}
