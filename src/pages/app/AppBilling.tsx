import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/contexts/CreditsContext";
import { PLANS, PlanId, HUMAN_REVIEW_PRICE, ACTION_LABELS, CreditAction } from "@/lib/credits";
import CreditMeter from "@/components/app/CreditMeter";
import TopUpModal from "@/components/app/TopUpModal";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PRICE_IDS } from "@/lib/stripe";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { priceFor, taxNotice, type SkuId } from "@/lib/currency";
import PricingCurrencySelector from "@/components/PricingCurrencySelector";
import BillingTermsSummary from "@/components/BillingTermsSummary";

const PLAN_TO_SKU: Record<PlanId, SkuId> = {
  starter: "vv_starter_oneoff",
  growth: "vv_growth_monthly",
  agency: "vv_agency_monthly",
};
const PLAN_TO_PRICE: Record<PlanId, string> = {
  starter: PRICE_IDS.starter,
  growth: PRICE_IDS.growth,
  agency: PRICE_IDS.agency,
};


export default function AppBilling() {
  const { user } = useAuth();
  const tc = useTranslation("common").t;
  const { plan, planConfig, periodEnd, starterExpired, refresh } = useCredits();
  const { currency, country } = useCurrency();
  const [topupOpen, setTopupOpen] = useState(false);

  const [ledger, setLedger] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [emailConn, setEmailConn] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stripeSub, setStripeSub] = useState<any>(null);
  const { openCheckout, element } = useStripeCheckout();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);

  const load = async () => {
    if (!user) return;
    const [l, t, r, e, p, s] = await Promise.all([
      supabase.from("credit_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("credit_topups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("human_reviews").select("*, campaigns(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("email_connections").select("id, from_email, status, is_default").eq("user_id", user.id),
      supabase.from("payment_intents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("stripe_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setLedger(l.data || []); setTopups(t.data || []); setReviews(r.data || []);
    setEmailConn(e.data || []); setPayments(p.data || []); setStripeSub(s.data);
  };

  useEffect(() => { load(); }, [user]);

  // Post-payment provisioning: handle ?checkout=success and route the user
  useEffect(() => {
    const flag = params.get("checkout");
    if (!flag) return;
    (async () => {
      toast.success(tc("toasts.paymentReceived"));
      // Webhook normally writes within 1-3s; refresh credits + tables a couple times
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        await refresh();
        await load();
      }
      // Route based on what was bought
      if (flag === "plan_starter" || flag.startsWith("checkout=plan_starter") || flag === "starter") {
        navigate("/app/campaigns/new", { replace: true });
      } else if (flag === "growth" || flag === "agency") {
        navigate("/app", { replace: true });
      } else {
        // strip the query param
        params.delete("checkout"); params.delete("session_id"); setParams(params, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyPlan = (id: PlanId) => setPendingPlan(id);

  const confirmBuyPlan = async () => {
    if (!pendingPlan) return;
    const id = pendingPlan;
    setPendingPlan(null);
    openCheckout({
      priceId: PLAN_TO_PRICE[id],
      title: `Subscribe to ${PLANS[id].name}`,
      returnPath: `/app/billing?checkout=${id}`,
    });
  };

  const planEntries = (Object.keys(PLANS) as PlanId[]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Manage your plan, Campaign Credits and add-ons.
            {country && <> · Detected region <strong className="text-foreground">{country}</strong></>}
          </p>
        </div>
        <PricingCurrencySelector align="right" className="md:max-w-md" />
      </div>
      <p className="text-xs text-muted-foreground -mt-4">{taxNotice(currency)}</p>


      {stripeSub?.status === "past_due" && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-destructive">Payment failed</div>
              <p className="text-sm text-muted-foreground">Your last renewal didn't go through. Update your payment method to keep your plan active.</p>
            </div>
            <Button onClick={() => buyPlan((stripeSub.plan as PlanId) || "growth")}>Retry payment</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email sending</CardTitle>
          <CardDescription>
            {emailConn.length === 0
              ? "No inbox connected — you can't send follow-ups yet."
              : `${emailConn.length} connection${emailConn.length === 1 ? "" : "s"} · sending ${emailConn.some((c) => c.status === "connected") ? "active" : "needs attention"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 flex-wrap">
          {emailConn.map((c) => (
            <Badge key={c.id} variant={c.status === "connected" ? "default" : "destructive"}>
              {c.from_email} · {c.status}
            </Badge>
          ))}
          <a href="/app/settings/email"><Button variant="outline" size="sm">Manage email connections</Button></a>
        </CardContent>
      </Card>

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
            <div className="text-sm">{priceFor(PLAN_TO_SKU[plan], currency).formatted} <span className="text-muted-foreground">{planConfig.unit}</span></div>
            <div className="text-xs text-muted-foreground">
              {planConfig.pooledCredits
                ? "Agency credits are pooled across all client workspaces."
                : "Credits apply to this workspace."}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setTopupOpen(true)}>Buy credit top-up</Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Plans</h2>
        <BillingTermsSummary className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planEntries.map((id) => {
            const cfg = PLANS[id];
            const current = id === plan && !starterExpired;
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
                  <div><span className="text-2xl font-bold">{priceFor(PLAN_TO_SKU[id], currency).formatted}</span> <span className="text-sm text-muted-foreground">{cfg.unit}</span></div>
                  <div className="text-sm font-medium">{cfg.includedCredits} Campaign Credits {cfg.cadence === "monthly" ? "/ month" : "included"}</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {cfg.features.map((f) => (<li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}</li>))}
                  </ul>
                  <Button className="w-full" variant={current ? "outline" : "default"} disabled={current} onClick={() => buyPlan(id)}>
                    {current ? "Current plan" : id === "starter" ? "Start Starter" : `Start ${cfg.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>


      <section>
        <h2 className="text-xl font-semibold mb-3">Billing history</h2>
        <Card>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No charges yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((p) => (
                  <div key={p.id} className="p-3 flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {p.status === "paid" && <CheckCircle2 className="h-4 w-4 text-accent" />}
                      <span className="font-medium">{p.product_kind.replace(/_/g, " ")}</span>
                      <Badge variant="outline">{p.status}</Badge>
                    </div>
                    <div className="text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: ((p as any).currency || "GBP").toUpperCase() }).format(p.amount / 100)} · {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Top-up history</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {topups.length === 0 && <p className="text-muted-foreground">No top-ups yet.</p>}
            {topups.map((t) => (
              <div key={t.id} className="flex justify-between border-b border-border last:border-0 pb-2">
                <span>+{t.credits} credits <span className="text-muted-foreground">({t.pack})</span></span>
                <span className="text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: ((t as any).currency || "GBP").toUpperCase() }).format(t.amount)} · {new Date(t.created_at).toLocaleDateString()}</span>
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

      <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
      {element}
      <LegalAcceptanceGate
        open={pendingPlan !== null}
        onOpenChange={(v) => { if (!v) setPendingPlan(null); }}
        title={pendingPlan ? `Confirm before subscribing to ${PLANS[pendingPlan].name}` : "Confirm"}
        description={
          pendingPlan
            ? `You'll be charged ${priceFor(PLAN_TO_SKU[pendingPlan], currency).formatted} ${PLANS[pendingPlan].unit} in ${currency}. Stripe checkout opens in the same currency. You must accept the legal stack before activating a paid plan.`
            : "You must accept the legal stack before activating a paid plan."
        }
        confirmLabel={pendingPlan ? `Continue to checkout in ${currency}` : "Continue to checkout"}
        onConfirm={confirmBuyPlan}
      />
    </div>
  );
}
