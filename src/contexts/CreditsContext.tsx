import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PlanId } from "@/lib/credits";
import { computeCreditBalance, type CreditBalanceSnapshot, type CreditLedgerLike } from "@/lib/creditBalance";
import { isPlanEntitled } from "@/lib/planEntitlement";
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
  planStatus: string;
  planConfig: typeof PLANS[PlanId];
  periodStart: Date | null;
  periodEnd: Date | null;
  entitled: boolean;
  entitlementEnded: boolean;
  starterExpired: boolean;
  isFreePreview: boolean;
  freePreviewExpired: boolean;
  freePreviewDaysLeft: number | null;
  included: number;
  used: number;
  topupBalance: number;
  remaining: number;
  refresh: () => Promise<void>;
  purchaseHumanReview: (campaignId: string) => Promise<void>;
}

const Ctx = createContext<CreditsContextValue | null>(null);
const EMPTY_BALANCE: CreditBalanceSnapshot = { included: 0, used: 0, topupBalance: 0, remaining: 0 };

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [balance, setBalance] = useState<CreditBalanceSnapshot>(EMPTY_BALANCE);

  const ensurePlan = useCallback(async (): Promise<UserPlan | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from("user_plans")
      .select("plan, status, period_start, period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) return data as UserPlan;

    const { data: fp, error: fpErr } = await supabase.rpc("grant_free_preview_welcome" as any);
    if (!fpErr && fp) {
      return {
        plan: "free_preview" as PlanId,
        status: "active",
        period_start: (fp as any).preview_started_at,
        period_end: (fp as any).preview_expires_at,
      };
    }
    console.error("Free Preview provisioning failed:", fpErr);
    return null;
  }, [user]);

  const load = useCallback(async () => {
    if (!user) {
      setUserPlan(null);
      setBalance(EMPTY_BALANCE);
      setLoading(false);
      return;
    }
    setLoading(true);
    const p = await ensurePlan();
    setUserPlan(p);

    const { data: serverBalance, error: serverBalanceError } = await (supabase as any).rpc("get_current_credit_balance");
    if (!serverBalanceError && serverBalance && typeof serverBalance === "object") {
      setBalance({
        included: Math.max(0, Number(serverBalance.included) || 0),
        used: Math.max(0, Number(serverBalance.used) || 0),
        topupBalance: Math.max(0, Number(serverBalance.topup_balance) || 0),
        remaining: Math.max(0, Number(serverBalance.remaining) || 0),
      });
    } else {
      // Backward-compatible fallback while the DB migration rolls out. This
      // uses the same allocation rule: cycle credits first, then carried top-ups.
      const { data: ld } = await supabase
        .from("credit_ledger")
        .select("delta, reason, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(2000);
      const periodStart = p ? new Date(p.period_start) : null;
      const periodEnd = p?.period_end ? new Date(p.period_end) : null;
      const freeExpired = p?.plan === "free_preview" && (!periodEnd || periodEnd.getTime() <= Date.now());
      setBalance(computeCreditBalance((ld as CreditLedgerLike[]) || [], {
        plan: p?.plan || "free_preview",
        periodStart,
        freePreviewExpired: freeExpired,
      }));
    }
    setLoading(false);
  }, [user, ensurePlan]);

  useEffect(() => { load(); }, [load]);

  const planId: PlanId = (userPlan?.plan as PlanId) || "free_preview";
  const planConfig = PLANS[planId] ?? PLANS.free_preview;
  const planStatus = userPlan?.status || "missing";
  const periodStart = userPlan ? new Date(userPlan.period_start) : null;
  const periodEnd = userPlan?.period_end ? new Date(userPlan.period_end) : null;
  const entitled = !!userPlan && isPlanEntitled({
    plan: planId,
    status: planStatus,
    periodEnd,
  });
  const entitlementEnded = !!userPlan && !entitled;
  const starterExpired = planId === "starter" && !entitled;
  const isFreePreview = planId === "free_preview";
  const freePreviewExpired = isFreePreview && !entitled;
  const freePreviewDaysLeft = isFreePreview && periodEnd
    ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / 86400000))
    : null;

  // Human Review purchases must go through hosted checkout; the provider
  // webhook is the only fulfilment path.
  const purchaseHumanReview = useCallback<CreditsContextValue["purchaseHumanReview"]>(async () => {
    toast.error("Use the Buy button to start checkout.");
  }, []);

  const value: CreditsContextValue = {
    loading,
    plan: planId,
    planStatus,
    planConfig,
    periodStart,
    periodEnd,
    entitled,
    entitlementEnded,
    starterExpired,
    isFreePreview,
    freePreviewExpired,
    freePreviewDaysLeft,
    included: balance.included,
    used: balance.used,
    topupBalance: balance.topupBalance,
    remaining: balance.remaining,
    refresh: load,
    purchaseHumanReview,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCredits() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCredits must be used inside CreditsProvider");
  return v;
}
