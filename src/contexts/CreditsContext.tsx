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
  isFreePreview: boolean;
  freePreviewExpired: boolean;
  freePreviewDaysLeft: number | null;
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
    // New account: provision Free Preview (welcome credits + 14-day preview).
    // Idempotent — safe on repeat calls. Paid upgrades happen via Stripe webhook.
    const { data: fp, error: fpErr } = await supabase.rpc("grant_free_preview_welcome" as any);
    if (!fpErr && fp) {
      return {
        plan: "free_preview" as PlanId,
        status: "active",
        period_start: (fp as any).preview_started_at,
        period_end: (fp as any).preview_expires_at,
      };
    }
    // Fallback to legacy starter provisioning if the free-preview RPC is unavailable.
    const { data: provisioned } = await supabase.rpc("provision_starter_plan");
    if (!provisioned) return null;
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

  const planId: PlanId = (userPlan?.plan as PlanId) || "free_preview";
  const planConfig = PLANS[planId] ?? PLANS.free_preview;
  const periodStart = userPlan ? new Date(userPlan.period_start) : null;
  const periodEnd = userPlan?.period_end ? new Date(userPlan.period_end) : null;
  const starterExpired = planId === "starter" && !!periodEnd && periodEnd.getTime() < Date.now();
  const isFreePreview = planId === "free_preview";
  const freePreviewExpired = isFreePreview && !!periodEnd && periodEnd.getTime() < Date.now();
  const freePreviewDaysLeft = isFreePreview && periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / 86400000))
    : null;

  // Compute included + used balances. Free-preview credits (welcome + daily)
  // count towards remaining; stripe_topup and legacy `topup` count as top-up.
  const { included, used, topupBalance, remaining } = useMemo(() => {
    const startMs = periodStart?.getTime() ?? 0;
    let inc = 0, usedC = 0, topup = 0, freeInc = 0, freeUsed = 0;
    for (const row of ledger) {
      const t = new Date(row.created_at).getTime();
      if (row.reason === "plan_grant" && t >= startMs) inc += row.delta;
      else if (row.reason.startsWith("spend_") && t >= startMs) usedC += -row.delta;
      else if (row.reason === "topup" || row.reason === "stripe_topup") topup += row.delta;
      else if (row.reason === "free_welcome_grant" || row.reason === "free_daily_grant") freeInc += row.delta;
      else if (row.reason === "free_preview_spend") freeUsed += -row.delta;
      // Admin / QA / manual grants — counted as positive balance so credits
      // are usable, but meta.source / meta.not_stripe let paid reporting
      // distinguish them from real Stripe top-ups.
      else if (row.reason === "qa_manual_grant" || row.reason === "manual_grant") topup += row.delta;
    }
    const remain = inc - usedC + topup + freeInc - freeUsed;
    return {
      included: inc + freeInc,
      used: usedC + freeUsed,
      topupBalance: topup,
      remaining: Math.max(remain, 0),
    };
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
    if (freePreviewExpired) {
      toast.error("Free Preview has ended", { description: "Upgrade or buy credits to continue generating." });
      return false;
    }
    const reason = isFreePreview ? "free_preview_spend" : `spend_${action}`;
    const { error } = await supabase.from("credit_ledger").insert({
      user_id: user.id,
      delta: -cost,
      reason,
      ref_id: refId,
      meta: { action, label: label ?? action, cost, tier: isFreePreview ? "free_preview" : planId },
    });
    if (error) { toast.error("Could not record credit usage"); return false; }
    await load();
    return true;
  }, [user, remaining, starterExpired, freePreviewExpired, isFreePreview, planId, load]);

  // NOTE: Human Review purchases MUST go through Stripe checkout —
  // `HumanReviewButton` calls openCheckout() and the Stripe webhook inserts
  // the `human_reviews` row via service_role after payment clears. This stub
  // remains only to preserve the public type; it does not write to the DB.
  const purchaseHumanReview = useCallback<CreditsContextValue["purchaseHumanReview"]>(async () => {
    toast.error("Use the Buy button to start checkout.");
  }, []);


  const value: CreditsContextValue = {
    loading, plan: planId, planConfig, periodStart, periodEnd, starterExpired,
    isFreePreview, freePreviewExpired, freePreviewDaysLeft,
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
