import { useEffect, useState } from "react";
import { AlertTriangle, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";

/**
 * Visible payment environment indicator for internal/admin users.
 * Warns admins not to perform live self-payments for QA.
 * Renders nothing for regular customers.
 */
export default function PaymentEnvBadge() {
  const { user } = useAuth();
  const [privileged, setPrivileged] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return;
      const [adminRes, founderRes] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" as any }),
        supabase.rpc("has_role", { _user_id: user.id, _role: "founder" as any }),
      ]);
      if (alive) setPrivileged(!!adminRes.data || !!founderRes.data);
    })();
    return () => { alive = false; };
  }, [user]);

  if (!privileged || !paymentsConfigured()) return null;
  let env: "sandbox" | "live";
  try { env = getStripeEnvironment(); } catch { return null; }

  // Live mode is the intended production state for real customer payments.
  // The internal QA warning must never appear on a customer billing page —
  // only the sandbox/test indicator is surfaced.
  if (env === "live") return null;
  return (
    <div className="w-full rounded-md border border-orange-300 bg-orange-50 text-orange-800 px-3 py-2 text-xs flex items-start gap-2">
      <FlaskConical className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold uppercase tracking-wide">Sandbox / test mode</div>
        <div>Test cards only (e.g. 4242 4242 4242 4242). No real charges.</div>
      </div>
    </div>
  );
}
