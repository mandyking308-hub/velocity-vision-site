import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, PlanId, CREDIT_COSTS, CreditAction, TOPUP_PACKS, HUMAN_REVIEW_PRICE } from "@/lib/credits";
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
  buyTopup: (packId: typeof TOPUP_PACKS[number]["id"]) => Promise<void>;
  upgradePlan: (next: PlanId) => Promise<void>;
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
    const { data } = await supabase.from("user_plans").select("plan, status, period_start, period_end").eq("user_id", user.id).maybeSingle();
    if (data) return data as UserPlan;
    // Lazy-create starter plan + initial credit grant
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: created } = await supabase.from("user_plans").insert({
      user_id: user.id,
      plan: "starter",
      status: "active",
      period_end: periodEnd,
    }).select("plan, status, period_start, period_end").single();
    await supabase.from("credit_ledger").insert({
      user_id: user.id,
      delta: PLANS.starter.includedCredits,
      reason: "plan_grant",
      meta: { plan: "starter" },
    });
    return created as UserPlan;
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
      // topup spend already counted in spend_*
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

  const buyTopup = useCallback<CreditsContextValue["buyTopup"]>(async (packId) => {
    if (!user) return;
    const pack = TOPUP_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    await supabase.from("credit_topups").insert({ user_id: user.id, pack: pack.id, credits: pack.credits, amount: pack.price });
    await supabase.from("credit_ledger").insert({ user_id: user.id, delta: pack.credits, reason: "topup", meta: { pack: pack.id, price: pack.price } });
    toast.success(`Added ${pack.credits} Campaign Credits`);
    await load();
  }, [user, load]);

  const upgradePlan = useCallback<CreditsContextValue["upgradePlan"]>(async (next) => {
    if (!user) return;
    const cfg = PLANS[next];
    const periodEndIso = cfg.cadence === "monthly"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + (cfg.durationDays ?? 30) * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("user_plans").update({
      plan: next,
      status: "active",
      period_start: new Date().toISOString(),
      period_end: periodEndIso,
    }).eq("user_id", user.id);
    await supabase.from("credit_ledger").insert({
      user_id: user.id,
      delta: cfg.includedCredits,
      reason: "plan_grant",
      meta: { plan: next },
    });
    toast.success(`Switched to ${cfg.name}`);
    await load();
  }, [user, load]);

  const purchaseHumanReview = useCallback<CreditsContextValue["purchaseHumanReview"]>(async (campaignId) => {
    if (!user) return;
    await supabase.from("human_reviews").insert({
      user_id: user.id,
      campaign_id: campaignId,
      status: "purchased",
      amount: HUMAN_REVIEW_PRICE,
    });
    toast.success("Premium Human Review purchased", { description: "A strategist will review this campaign and send recommendations." });
  }, [user]);

  const value: CreditsContextValue = {
    loading, plan: planId, planConfig, periodStart, periodEnd, starterExpired,
    included, used, topupBalance, remaining,
    refresh: load, consume, buyTopup, upgradePlan, purchaseHumanReview,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCredits() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCredits must be used inside CreditsProvider");
  return v;
}
