import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PlanId, CREDIT_COSTS, CreditAction, HUMAN_REVIEW_PRICE } from "@/lib/credits";
import { toast } from "sonner";

interface UserPlan {
  plan: PlanId;
  status: string;
  period_start: string;
  period_end: string | null;
}

interface CreditsContextValue {
  loading: boolean;
  plan: PlanId;
  planConfig: typeof PLANS[PlanId];
  periodStart: Date | null;
  periodEnd: Date | null;
  starterExpired: boolean;
  included: number;
  used: number;
  topupBalance: number;
  remaining: number;
  refresh: () => Promise<void>;
  /** Returns true on success, false (and shows toast) if not enough credits. */
  consume: (action: CreditAction, refId?: string, label?: string) => Promise<boolean>;
  purchaseHumanReview: (campaignId: string) => Promise<void>;
}

const Ctx = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [ledger, setLedger] = useState<Array<{ delta: number; reason: string; created_at: string }>>([]);

  const ensurePlan = useCallback(async (): Promise<UserPlan | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from("user_plans")
      .select("plan, status, period_start, period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) return data as UserPlan;
    // Lazy-provision the free Starter plan via security-definer RPC.
    // Plan upgrades and credit grants happen exclusively in the Stripe webhook.
    const { data: provisioned, error } = await supabase.rpc("provision_starter_plan");
    if (error || !provisioned) return null;
    return {
      plan: (provisioned as any).plan,
      status: (provisioned as any).status,
      period_start: (provisioned as any).period_start,
      period_end: (provisioned as any).period_end,
    };
  }, [user]);


  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const p = await ensurePlan();
    setUserPlan(p);
    const { data: ld } = await supabase.from("credit_ledger").select("delta, reason, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500);
    setLedger((ld as any) || []);
    setLoading(false);
  }, [user, ensurePlan]);

  useEffect(() => { load(); }, [load]);

  const planId: PlanId = (userPlan?.plan as PlanId) || "starter";
  const planConfig = PLANS[planId];
  const periodStart = userPlan ? new Date(userPlan.period_start) : null;
  const periodEnd = userPlan?.period_end ? new Date(userPlan.period_end) : null;
  const starterExpired = planId === "starter" && !!periodEnd && periodEnd.getTime() < Date.now();

  // Compute included + used for current period
  const { included, used, topupBalance, remaining } = useMemo(() => {
    const startMs = periodStart?.getTime() ?? 0;
    let inc = 0, usedC = 0, topup = 0;
    for (const row of ledger) {
      const t = new Date(row.created_at).getTime();
      if (row.reason === "plan_grant" && t >= startMs) inc += row.delta;
      else if (row.reason.startsWith("spend_") && t >= startMs) usedC += -row.delta;
      else if (row.reason === "topup") topup += row.delta;
      // Admin / QA / manual grants — counted as positive balance so credits
      // are usable, but meta.source / meta.not_stripe let paid reporting
      // distinguish them from real Stripe top-ups.
      else if (row.reason === "qa_manual_grant" || row.reason === "manual_grant") topup += row.delta;
    }
    const remain = inc - usedC + topup;
    return { included: inc, used: usedC, topupBalance: topup, remaining: Math.max(remain, 0) };
  }, [ledger, periodStart]);

  const consume = useCallback<CreditsContextValue["consume"]>(async (action, refId, label) => {
    if (!user) return false;
    const cost = CREDIT_COSTS[action];
    if (remaining < cost) {
      toast.error("You're out of Campaign Credits", { description: "Top up or upgrade to keep generating." });
      return false;
    }
    if (starterExpired) {
      toast.error("Starter access has ended", { description: "Upgrade to Growth or buy another Starter to keep generating." });
      return false;
    }
    const { error } = await supabase.from("credit_ledger").insert({
      user_id: user.id,
      delta: -cost,
      reason: `spend_${action}`,
      ref_id: refId,
      meta: { action, label: label ?? action, cost },
    });
    if (error) { toast.error("Could not record credit usage"); return false; }
    await load();
    return true;
  }, [user, remaining, starterExpired, load]);

  // NOTE: Human Review purchases MUST go through Stripe checkout —
  // `HumanReviewButton` calls openCheckout() and the Stripe webhook inserts
  // the `human_reviews` row via service_role after payment clears. This stub
  // remains only to preserve the public type; it does not write to the DB.
  const purchaseHumanReview = useCallback<CreditsContextValue["purchaseHumanReview"]>(async () => {
    toast.error("Use the Buy button to start checkout.");
  }, []);


  const value: CreditsContextValue = {
    loading, plan: planId, planConfig, periodStart, periodEnd, starterExpired,
    included, used, topupBalance, remaining,
    refresh: load, consume, purchaseHumanReview,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCredits() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCredits must be used inside CreditsProvider");
  return v;
}
