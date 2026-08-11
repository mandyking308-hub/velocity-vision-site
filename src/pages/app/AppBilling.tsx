import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/contexts/CreditsContext";
import { PLANS, PlanId, ACTION_LABELS, CreditAction } from "@/lib/credits";
import CreditMeter from "@/components/app/CreditMeter";
import TopUpModal from "@/components/app/TopUpModal";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, ArrowUpRight, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";
import { type DodoProductKey } from "@/lib/dodoReadiness";
import { parseBuyParam } from "@/lib/safeNext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice, priceFor, taxNotice, type SkuId } from "@/lib/currency";
import PricingCurrencySelector from "@/components/PricingCurrencySelector";
import { billingTroubleCopy, classifyCheckoutReturn, isBillingTrouble, resolveBillingPortalFunction } from "@/lib/checkoutReturn";
import FeedbackPrompt from "@/components/support/FeedbackPrompt";
import BillingTermsSummary from "@/components/BillingTermsSummary";
import PaymentEnvBadge from "@/components/app/PaymentEnvBadge";

const PLAN_TO_SKU: Record<PlanId, SkuId> = {
  free_preview: "vv_starter_oneoff", // routing compatibility only — never used to display Free Preview price
  starter: "vv_starter_oneoff",
  growth: "vv_growth_monthly",
  agency: "vv_agency_monthly",
};

const PLAN_TO_DODO_PRODUCT: Record<Exclude<PlanId, "free_preview">, DodoProductKey> = {
  starter: "vv_starter_oneoff",
  growth: "vv_growth_monthly",
  agency: "vv_agency_monthly",
};

const PAID_PLAN_ENTRIES: PlanId[] = ["starter", "growth", "agency"];

/** Safe purchase-result flags carried on the Dodo/Stripe browser return URL. */
const PLAN_FLAG_TO_PLAN: Record<string, PlanId> = {
  starter: "starter",
  plan_starter: "starter",
  growth: "growth",
  agency: "agency",
};
const TOPUP_FLAG_RE = /^topup(_small|_medium|_large)?$/;

/** How many times Billing polls for webhook provisioning before showing the
 *  honest "finishing account setup" state (8 × 2.5s ≈ 20 seconds). */
const ACTIVATION_POLL_ATTEMPTS = 8;
const ACTIVATION_POLL_MS = 2500;

export default function AppBilling() {
  const { user } = useAuth();
  const tc = useTranslation("common").t;
  const { plan, planConfig, periodEnd, starterExpired, refresh } = useCredits();
  const { currency, setCurrency, country } = useCurrency();
  const [portalLoading, setPortalLoading] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [topups, setTopups] = useState<any[]>([]);
  const [emailConn, setEmailConn] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stripeSub, setStripeSub] = useState<any>(null);
  const { startCheckout } = useDodoCheckout();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [showCheckoutFeedback, setShowCheckoutFeedback] = useState(false);
  const [activation, setActivation] = useState<null | { kind: "plan" | "topup"; label: string; state: "pending" | "waiting" }>(null);

  const displayPlanPrice = (id: PlanId) => id === "free_preview" ? formatPrice(0, currency) : priceFor(PLAN_TO_SKU[id], currency).formatted;

  const openBillingPortal = async () => {
    setPortalLoading(true);
    const fn = resolveBillingPortalFunction(stripeSub?.provider);
    try {
      if (fn === "dodo-customer-portal") {
        const { data, error } = await supabase.functions.invoke(fn, { body: {} });
        const code = (data as any)?.error;
        if (code === "no_customer" || code === "payments_not_configured") {
          toast.info("Billing management isn't available yet.", { description: "Please contact support and we'll sort this for you." });
          return;
        }
        if (error || !(data as any)?.url) throw error || new Error("no_portal_link");
        window.location.href = (data as any).url;
        return;
      }
      const { data, error } = await supabase.functions.invoke(fn, { body: { returnPath: "/app/billing" } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else if (data?.noCustomer) toast.info("No billing profile yet.");
      else toast.error("Couldn't open billing portal.");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const load = async () => {
    if (!user) return;
    const [l, t, e, p, s] = await Promise.all([
      supabase.from("credit_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("credit_topups").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("email_connections").select("id, from_email, status, is_default").eq("user_id", user.id),
      supabase.from("payment_intents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("stripe_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setLedger(l.data || []); setTopups(t.data || []); setEmailConn(e.data || []); setPayments(p.data || []); setStripeSub(s.data);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const parsed = classifyCheckoutReturn(params.get("checkout"));
    if (!parsed) return;
    const clearParams = () => {
      params.delete("checkout");
      params.delete("session_id");
      setParams(params, { replace: true });
    };

    if (parsed.status !== "success") {
      if (parsed.status === "cancelled") toast.info("Checkout canceled", { description: "No payment was taken. You can try again any time." });
      else if (parsed.status === "failed") toast.error("Payment didn't go through", { description: "No charge was made. Please try again or contact support." });
      else toast.info("Checkout closed", { description: "We couldn't confirm a payment for this return. Your billing details below are up to date." });
      clearParams();
      return;
    }

    const flag = parsed.flag;
    clearParams();
    (async () => {
      setShowCheckoutFeedback(true);
      toast.success(tc("toasts.paymentReceived"));
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        await refresh();
        await load();
      }
      if (flag === "plan_starter" || flag.startsWith("checkout=plan_starter") || flag === "starter") navigate("/app/campaigns/new", { replace: true });
      else if (flag === "growth" || flag === "agency") navigate("/app", { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyPlan = (id: PlanId) => {
    if (id === "free_preview") return;
    setPendingPlan(id);
  };

  useEffect(() => {
    const requested = parseBuyParam(params.get("buy"));
    if (!requested) return;
    setPendingPlan(requested as PlanId);
    params.delete("buy");
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmBuyPlan = async () => {
    if (!pendingPlan || pendingPlan === "free_preview") return;
    const id = pendingPlan;
    setPendingPlan(null);
    const productKey = PLAN_TO_DODO_PRODUCT[id];
    // The server-side dodo-create-checkout function is the authoritative
    // fail-closed gate: it validates auth, the allow-listed product key, live
    // API config, the product map and the returned checkout URL. The
    // client-side readiness probe is advisory only and must never redirect a
    // paying customer away from a valid live checkout.
    await startCheckout(productKey);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <PaymentEnvBadge />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your plan, Campaign Credits and available add-ons.{country && <> · Detected region <strong className="text-foreground">{country}</strong></>}</p>
        </div>
        <PricingCurrencySelector align="right" className="md:max-w-md" currency={currency} onCurrencyChange={setCurrency} />
      </div>
      <p className="text-xs text-muted-foreground -mt-4">{taxNotice(currency)}</p>

      {showCheckoutFeedback && <FeedbackPrompt promptKey="checkout_success" question="Was checkout clear?" feedbackType="pricing_billing" />}

      {isBillingTrouble(stripeSub?.status) && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div><div className="font-semibold text-destructive">{billingTroubleCopy(stripeSub?.status).title}</div><p className="text-sm text-muted-foreground">{billingTroubleCopy(stripeSub?.status).body}</p></div>
            </div>
            {stripeSub?.stripe_customer_id ? <Button onClick={openBillingPortal} disabled={portalLoading}>{portalLoading ? "Opening…" : "Update payment method"}</Button> : <Button variant="outline" onClick={() => navigate("/contact")}>Contact support</Button>}
          </CardContent>
        </Card>
      )}

      {plan === "free_preview" && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Move beyond Free Preview</CardTitle>
            <CardDescription>Free Preview stays {formatPrice(0, currency)} and is limited to one full campaign pack, 25 contacts and no live sending. Top-ups are available after moving to an eligible paid workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Card><CardContent className="p-4 space-y-2"><div className="font-semibold">Starter — {priceFor("vv_starter_oneoff", currency).formatted} one-off</div><p className="text-sm text-muted-foreground">30 days, 25 Campaign Credits, one-off campaigns and live sending up to 20/day subject to sender safety.</p><Button onClick={() => buyPlan("starter")}>Start Starter</Button></CardContent></Card>
            <Card><CardContent className="p-4 space-y-2"><div className="font-semibold">Growth — {priceFor("vv_growth_monthly", currency).formatted}/month</div><p className="text-sm text-muted-foreground">Recurring campaigns, 80 Campaign Credits/month and live sending up to 50/day subject to sender safety.</p><Button onClick={() => buyPlan("growth")}>Start Growth</Button></CardContent></Card>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email sending</CardTitle>
          <CardDescription>{emailConn.length === 0 ? "No inbox connected." : `${emailConn.length} connection${emailConn.length === 1 ? "" : "s"} · ${emailConn.some((c) => c.status === "connected") ? "at least one connected" : "needs attention"}`}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 flex-wrap">
          {emailConn.map((c) => <Badge key={c.id} variant={c.status === "connected" ? "default" : "destructive"}>{c.from_email} · {c.status}</Badge>)}
          <Button variant="outline" size="sm" onClick={() => navigate("/app/settings/email")}>Manage email connections</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><CreditMeter /></div>
        <Card>
          <CardHeader><CardTitle className="text-base">Current plan</CardTitle><CardDescription>{planConfig.tagline}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between"><div className="text-2xl font-bold">{planConfig.name}</div><Badge variant={starterExpired ? "destructive" : "secondary"}>{starterExpired ? "Ended" : "Active"}</Badge></div>
            <div className="text-sm text-muted-foreground">{plan === "free_preview" ? "Preview period" : planConfig.cadence === "monthly" ? "Renews" : "Access until"} {periodEnd?.toLocaleDateString() ?? "—"}</div>
            <div className="text-sm"><strong>{displayPlanPrice(plan)}</strong> <span className="text-muted-foreground">{plan === "free_preview" ? "14-day preview" : planConfig.unit}</span></div>
            <div className="text-xs text-muted-foreground">{planConfig.pooledCredits ? "Agency Campaign Credits are pooled across client workspaces." : "Campaign Credits fund credit-priced AI generation; sending is governed separately by plan and sender limits."}</div>
            {plan !== "free_preview" && <Button variant="outline" size="sm" className="w-full" onClick={() => setTopupOpen(true)}>Buy credit top-up</Button>}
            <Button variant="secondary" size="sm" className="w-full" onClick={openBillingPortal} disabled={portalLoading}>{portalLoading ? "Opening…" : "Manage billing & invoices"}</Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Paid plans</h2>
        <BillingTermsSummary className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAID_PLAN_ENTRIES.map((id) => {
            const cfg = PLANS[id];
            const current = id === plan && !starterExpired;
            return (
              <Card key={id} className={current ? "border-primary" : ""}>
                <CardHeader><div className="flex justify-between"><CardTitle className="text-lg">{cfg.name}</CardTitle>{current && <Badge>Current</Badge>}</div><CardDescription>{cfg.tagline}</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  <div><span className="text-2xl font-bold">{displayPlanPrice(id)}</span> <span className="text-sm text-muted-foreground">{cfg.unit}</span></div>
                  <div className="text-sm font-medium">{cfg.includedCredits} Campaign Credits {cfg.cadence === "monthly" ? "/ month" : "included"}</div>
                  <ul className="text-sm text-muted-foreground space-y-1">{cfg.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />{f}</li>)}</ul>
                  <Button className="w-full" variant={current ? "outline" : "default"} disabled={current} onClick={() => buyPlan(id)}>{current ? "Current plan" : id === "starter" ? "Start Starter" : `Start ${cfg.name}`}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2"><h2 className="text-xl font-semibold">Billing history</h2><Button variant="outline" size="sm" onClick={openBillingPortal} disabled={portalLoading}><ArrowUpRight className="h-4 w-4 mr-1" />{portalLoading ? "Opening…" : "Manage billing & invoices"}</Button></div>
        <Card><CardContent className="p-0">{payments.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No charges yet.</p> : <div className="divide-y divide-border">{payments.map((p) => <div key={p.id} className="p-3 flex justify-between text-sm gap-3"><div className="flex items-center gap-2">{p.status === "paid" && <CheckCircle2 className="h-4 w-4 text-accent" />}<span className="font-medium">{p.product_kind.replace(/_/g, " ")}</span><Badge variant="outline">{p.status}</Badge></div><div className="text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: ((p as any).currency || "GBP").toUpperCase() }).format(p.amount / 100)} · {new Date(p.created_at).toLocaleDateString()}</div></div>)}</div>}</CardContent></Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle className="text-base">Top-up history</CardTitle></CardHeader><CardContent className="text-sm space-y-2">{topups.length === 0 && <p className="text-muted-foreground">No top-ups yet.</p>}{topups.map((t) => <div key={t.id} className="flex justify-between border-b border-border last:border-0 pb-2"><span>+{t.credits} credits <span className="text-muted-foreground">({t.pack})</span></span><span className="text-muted-foreground">{new Intl.NumberFormat(undefined, { style: "currency", currency: ((t as any).currency || "GBP").toUpperCase() }).format(t.amount)} · {new Date(t.created_at).toLocaleDateString()}</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Recent credit activity</CardTitle></CardHeader><CardContent className="text-sm space-y-2 max-h-72 overflow-auto">{ledger.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}{ledger.map((l) => { const isSpend = l.reason.startsWith("spend_"); const actionKey = l.reason.replace("spend_", "") as CreditAction; const label = isSpend ? (ACTION_LABELS[actionKey] || l.reason) : l.reason === "plan_grant" ? `Plan grant (${l.meta?.plan || ""})` : l.reason === "topup" ? "Top-up" : l.reason; return <div key={l.id} className="flex justify-between border-b border-border last:border-0 pb-2"><span>{label}</span><span className={l.delta < 0 ? "text-destructive" : "text-accent"}>{l.delta > 0 ? "+" : ""}{l.delta}</span></div>; })}</CardContent></Card>
      </section>

      <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
      <LegalComplianceGate
        open={pendingPlan !== null && pendingPlan !== "free_preview"}
        onOpenChange={(v) => { if (!v) setPendingPlan(null); }}
        source="plan_checkout"
        title={pendingPlan && pendingPlan !== "free_preview" ? `Confirm current terms before purchasing ${PLANS[pendingPlan].name}` : "Confirm current terms"}
        description={pendingPlan && pendingPlan !== "free_preview" ? `You'll be charged ${displayPlanPrice(pendingPlan)} ${PLANS[pendingPlan].unit} in ${currency}. Please accept the current versions of our platform legal stack to continue to checkout.` : "Please accept the current versions of our platform legal stack to continue to checkout."}
        confirmLabel={pendingPlan ? `Accept and continue in ${currency}` : "Accept and continue"}
        onConfirm={confirmBuyPlan}
      />
    </div>
  );
}
