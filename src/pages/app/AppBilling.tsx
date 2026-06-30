import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/contexts/CreditsContext";
import { PLANS, PlanId, HUMAN_REVIEW_PRICE, ACTION_LABELS, CreditAction } from "@/lib/credits";
import CreditMeter from "@/components/app/CreditMeter";
import TopUpModal from "@/components/app/TopUpModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowUpRight } from "lucide-react";

export default function AppBilling() {
  const { user } = useAuth();
  const { plan, planConfig, periodEnd, starterExpired, upgradePlan } = useCredits();
  const [topupOpen, setTopupOpen] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [l, t, r] = await Promise.all([
        supabase.from("credit_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("credit_topups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("human_reviews").select("*, campaigns(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setLedger(l.data || []); setTopups(t.data || []); setReviews(r.data || []);
    })();
  }, [user]);

  const planEntries = (Object.keys(PLANS) as PlanId[]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your plan, Campaign Credits and add-ons.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><CreditMeter /></div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current plan</CardTitle>
            <CardDescription>{planConfig.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{planConfig.name}</div>
              <Badge variant={starterExpired ? "destructive" : "secondary"}>{starterExpired ? "Ended" : "Active"}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {planConfig.cadence === "monthly" ? "Renews" : "Access until"} {periodEnd?.toLocaleDateString() ?? "—"}
            </div>
            <div className="text-sm">{planConfig.price} <span className="text-muted-foreground">{planConfig.unit}</span></div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setTopupOpen(true)}>Buy credit top-up</Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planEntries.map((id) => {
            const cfg = PLANS[id];
            const current = id === plan;
            return (
              <Card key={id} className={current ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{cfg.name}</CardTitle>
                    {current && <Badge>Current</Badge>}
                  </div>
                  <CardDescription>{cfg.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div><span className="text-2xl font-bold">{cfg.price}</span> <span className="text-sm text-muted-foreground">{cfg.unit}</span></div>
                  <div className="text-sm font-medium">{cfg.includedCredits} Campaign Credits {cfg.cadence === "monthly" ? "/ month" : "included"}</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {cfg.features.map((f) => (<li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}</li>))}
                  </ul>
                  <Button className="w-full" variant={current ? "outline" : "default"} disabled={current} onClick={() => upgradePlan(id)}>
                    {current ? "Current plan" : id === "starter" ? "Switch to Starter" : `Upgrade to ${cfg.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Premium Human Review</h2>
        <Card>
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold">Optional add-on — £{HUMAN_REVIEW_PRICE} per review</div>
              <p className="text-sm text-muted-foreground">Senior strategist review of one campaign pack, written recommendations and one async revision pass. Purchase from inside any campaign.</p>
            </div>
            <Button variant="outline" asChild><a href="/app/campaigns">Choose a campaign <ArrowUpRight className="h-4 w-4 ml-2" /></a></Button>
          </CardContent>
        </Card>
        {reviews.length > 0 && (
          <div className="mt-3 space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="flex justify-between border border-border rounded-md p-3 text-sm">
                <div>{r.campaigns?.name || "Campaign"} — <span className="text-muted-foreground">{r.status}</span></div>
                <div className="text-muted-foreground">£{r.amount}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Top-up history</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {topups.length === 0 && <p className="text-muted-foreground">No top-ups yet.</p>}
            {topups.map((t) => (
              <div key={t.id} className="flex justify-between border-b border-border last:border-0 pb-2">
                <span>+{t.credits} credits <span className="text-muted-foreground">({t.pack})</span></span>
                <span className="text-muted-foreground">£{t.amount} · {new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2 max-h-72 overflow-auto">
            {ledger.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
            {ledger.map((l) => {
              const isSpend = l.reason.startsWith("spend_");
              const actionKey = l.reason.replace("spend_", "") as CreditAction;
              const label = isSpend ? (ACTION_LABELS[actionKey] || l.reason) : l.reason === "plan_grant" ? `Plan grant (${l.meta?.plan || ""})` : l.reason === "topup" ? "Top-up" : l.reason;
              return (
                <div key={l.id} className="flex justify-between border-b border-border last:border-0 pb-2">
                  <span>{label}</span>
                  <span className={l.delta < 0 ? "text-destructive" : "text-accent"}>{l.delta > 0 ? "+" : ""}{l.delta}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancel or downgrade</CardTitle>
            <CardDescription>Manage subscription state. You keep access to existing campaigns and reports.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" disabled>Pause renewal</Button>
            <Button variant="outline" disabled>Cancel plan</Button>
            <span className="text-xs text-muted-foreground self-center">Available once payments are connected.</span>
          </CardContent>
        </Card>
      </section>

      <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
    </div>
  );
}
