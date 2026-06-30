import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, PlanId, HUMAN_REVIEW_PRICE } from "@/lib/credits";

interface PlanRow { plan: string; period_end: string | null; user_id: string }
interface Ledger { user_id: string; delta: number; reason: string; created_at: string }
interface Topup { user_id: string; pack: string; credits: number; amount: number }
interface Review { user_id: string; status: string; amount: number }

export default function FounderMonetisation() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      const [p, l, t, r] = await Promise.all([
        supabase.from("user_plans").select("plan, period_end, user_id"),
        supabase.from("credit_ledger").select("user_id, delta, reason, created_at"),
        supabase.from("credit_topups").select("user_id, pack, credits, amount"),
        supabase.from("human_reviews").select("user_id, status, amount"),
      ]);
      setPlans((p.data as any) || []);
      setLedger((l.data as any) || []);
      setTopups((t.data as any) || []);
      setReviews((r.data as any) || []);
    })();
  }, []);

  // Plan mix
  const planMix: Record<string, number> = {};
  plans.forEach((p) => (planMix[p.plan] = (planMix[p.plan] || 0) + 1));

  // Revenue (placeholder)
  const planRevenue = plans.reduce((sum, p) => {
    const cfg = PLANS[p.plan as PlanId];
    if (!cfg) return sum;
    const n = parseFloat(cfg.price.replace(/[£,]/g, "")) || 0;
    return sum + n;
  }, 0);
  const topupRevenue = topups.reduce((s, t) => s + Number(t.amount), 0);
  const reviewRevenue = reviews.reduce((s, r) => s + Number(r.amount), 0);

  // Per user usage
  const userUsage: Record<string, { used: number; granted: number; topup: number }> = {};
  ledger.forEach((l) => {
    if (!userUsage[l.user_id]) userUsage[l.user_id] = { used: 0, granted: 0, topup: 0 };
    if (l.delta < 0) userUsage[l.user_id].used += -l.delta;
    else if (l.reason === "topup") userUsage[l.user_id].topup += l.delta;
    else if (l.reason === "plan_grant") userUsage[l.user_id].granted += l.delta;
  });
  const avgUsage = Object.values(userUsage).reduce((s, u) => s + u.used, 0) / Math.max(Object.keys(userUsage).length, 1);
  const nearExhaustion = Object.entries(userUsage).filter(([, u]) => u.granted + u.topup > 0 && u.used / (u.granted + u.topup) >= 0.9).length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Monetisation</h1>
        <p className="text-muted-foreground">Plan mix, credit usage and revenue across the platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total users on a plan" value={plans.length} />
        <Stat label="Avg credits used / user" value={avgUsage.toFixed(1)} />
        <Stat label="Users ≥90% used" value={nearExhaustion} />
        <Stat label="Human reviews purchased" value={reviews.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Plan mix</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(["starter", "growth", "agency"] as PlanId[]).map((p) => (
              <div key={p} className="flex justify-between border-b border-border last:border-0 pb-1">
                <span>{PLANS[p].name}</span>
                <span className="text-muted-foreground">{planMix[p] || 0} users</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue snapshot (placeholder)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Plans (sum of current plan prices)" v={`£${planRevenue.toFixed(2)}`} />
            <Row label="Top-up purchases" v={`£${topupRevenue.toFixed(2)}`} />
            <Row label="Premium Human Review (£${HUMAN_REVIEW_PRICE} each)" v={`£${reviewRevenue.toFixed(2)}`} />
            <Row label="Total" v={`£${(planRevenue + topupRevenue + reviewRevenue).toFixed(2)}`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top-ups</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {topups.length === 0 ? <p className="text-muted-foreground">No top-ups yet.</p> :
            topups.map((t, i) => (
              <div key={i} className="flex justify-between border-b border-border last:border-0 py-1">
                <span>{t.pack} — +{t.credits} credits</span>
                <span className="text-muted-foreground">£{t.amount}</span>
              </div>
            ))
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Premium Human Reviews</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {reviews.length === 0 ? <p className="text-muted-foreground">No human reviews purchased yet.</p> :
            reviews.map((r, i) => (
              <div key={i} className="flex justify-between border-b border-border last:border-0 py-1">
                <span>Status: {r.status}</span>
                <span className="text-muted-foreground">£{r.amount}</span>
              </div>
            ))
          }
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
function Row({ label, v }: { label: string; v: string }) {
  return <div className="flex justify-between border-b border-border last:border-0 py-1"><span>{label}</span><span className="font-medium">{v}</span></div>;
}
