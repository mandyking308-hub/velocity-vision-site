// Reusable upgrade nudge — inline, banner, modal or card.
// Free Preview never offers credit top-ups: it remains capped at one full pack.
import { useEffect, useMemo, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCredits } from "@/contexts/CreditsContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isBillingTrouble } from "@/lib/checkoutReturn";
import { trackUpgradeEvent } from "@/lib/upgradeEvents";
import TopUpModal from "./TopUpModal";

export type NudgeVariant = "inline" | "banner" | "modal" | "card";
export type NudgeReason =
  | "credits_soft" | "credits_strong" | "credits_exhausted"
  | "free_preview_first_pack_ready" | "free_preview_second_pack_gate"
  | "free_preview_contact_limit" | "free_preview_export_gate" | "free_preview_sending_gate"
  | "free_preview_expiring" | "free_preview_expired"
  | "upgrade_for_growth" | "upgrade_for_agency";

type CtaKind = "buy_credits" | "upgrade_growth" | "upgrade_agency" | "compare_plans" | "learn_credits" | "keep_previewing" | "fix_billing";
interface CtaDef { kind: CtaKind; label: string; }
interface ReasonDef { title: string; body: string; primary: CtaDef; secondary?: CtaDef; hard: boolean; freePreviewOnly?: boolean; tone?: "default" | "warn" | "danger" | "success"; }

const REASONS: Record<NudgeReason, ReasonDef> = {
  credits_soft: {
    title: "You've used 75% of your Campaign Credits",
    body: "Credit-priced AI generation can continue while you have enough balance for the selected action.",
    primary: { kind: "buy_credits", label: "Buy credits" }, secondary: { kind: "compare_plans", label: "Compare plans" }, hard: false,
  },
  credits_strong: {
    title: "Only a few Campaign Credits remain",
    body: "On an eligible paid workspace, add credits or change plan before your next credit-priced generation action.",
    primary: { kind: "buy_credits", label: "Buy credits" }, secondary: { kind: "upgrade_growth", label: "Review Growth" }, hard: false, tone: "warn",
  },
  credits_exhausted: {
    title: "You're out of Campaign Credits",
    body: "Existing work stays available. On eligible paid workspaces, add credits or change plan to resume credit-priced AI generation. Sending is governed separately.",
    primary: { kind: "buy_credits", label: "Buy credits" }, secondary: { kind: "upgrade_growth", label: "Review Growth" }, hard: true, tone: "danger",
  },
  free_preview_first_pack_ready: {
    title: "Your Free Preview campaign pack is ready",
    body: "Keep reviewing it, or compare paid plans when you are ready for another full pack or live sending. Starter supports one-off live campaigns; Growth adds recurring cadence.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, secondary: { kind: "keep_previewing", label: "Keep previewing" }, hard: false, freePreviewOnly: true, tone: "success",
  },
  free_preview_second_pack_gate: {
    title: "You've used your one Free Preview campaign pack",
    body: "Free Preview cannot generate a second full campaign pack, even with additional credits. Move to a paid plan to continue full-pack generation.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, hard: true, freePreviewOnly: true, tone: "warn",
  },
  free_preview_contact_limit: {
    title: "Free Preview supports up to 25 contacts",
    body: "Campaign Credits do not increase the contact limit. Compare paid plans for larger working datasets and live sending.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, hard: true, freePreviewOnly: true, tone: "warn",
  },
  free_preview_export_gate: {
    title: "This action is not available on Free Preview",
    body: "Free Preview is for building and reviewing the first workflow. Compare paid plans for the applicable paid functionality.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, hard: true, freePreviewOnly: true, tone: "warn",
  },
  free_preview_sending_gate: {
    title: "Live sending is not available on Free Preview",
    body: "Starter, Growth and Agency can support live sending after the applicable sender, legal and send-safety checks. Starter is one-off; Growth and Agency add recurring cadence.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, secondary: { kind: "learn_credits", label: "Review activation steps" }, hard: true, freePreviewOnly: true, tone: "warn",
  },
  free_preview_expiring: {
    title: "Your Free Preview is ending soon",
    body: "Review the paid plans before the preview period ends. Top-up packs are not sold into Free Preview.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, secondary: { kind: "keep_previewing", label: "Keep previewing" }, hard: false, freePreviewOnly: true, tone: "warn",
  },
  free_preview_expired: {
    title: "Free Preview has ended",
    body: "Choose a paid plan to continue paid-plan functionality. Free Preview top-ups are not available.",
    primary: { kind: "compare_plans", label: "Compare paid plans" }, hard: true, freePreviewOnly: true, tone: "danger",
  },
  upgrade_for_growth: {
    title: "Need recurring campaigns?",
    body: "Growth adds recurring weekly, monthly or custom cadence, reusable recurring templates, 80 Campaign Credits per month and a normal send ceiling of 50/day subject to sender safety.",
    primary: { kind: "upgrade_growth", label: "Review Growth" }, secondary: { kind: "compare_plans", label: "Compare plans" }, hard: false,
  },
  upgrade_for_agency: {
    title: "Running multiple client workspaces?",
    body: "Agency adds unlimited isolated client workspaces, 250 pooled Campaign Credits, cross-client outcome visibility and account-wide send-usage visibility.",
    primary: { kind: "upgrade_agency", label: "Review Agency" }, secondary: { kind: "compare_plans", label: "Compare plans" }, hard: false,
  },
};

const DISMISS_KEY = (reason: NudgeReason) => `vv_nudge_dismissed_${reason}`;
const MODAL_SESSION_KEY = "vv_nudge_modal_shown_this_session";
export function markModalShownThisSession() { try { sessionStorage.setItem(MODAL_SESSION_KEY, "1"); } catch { /* ignore */ } }
export function modalAlreadyShownThisSession() { try { return sessionStorage.getItem(MODAL_SESSION_KEY) === "1"; } catch { return false; } }

interface UpgradeNudgeProps { reason: NudgeReason; variant?: NudgeVariant; open?: boolean; onOpenChange?: (v: boolean) => void; title?: string; body?: string; className?: string; children?: ReactNode; }

export default function UpgradeNudge({ reason, variant = "inline", open, onOpenChange, title, body, className, children }: UpgradeNudgeProps) {
  const def = REASONS[reason];
  const { plan, isFreePreview } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topupOpen, setTopupOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [billingTrouble, setBillingTrouble] = useState(false);

  useEffect(() => { try { if (localStorage.getItem(DISMISS_KEY(reason)) === "1") setDismissed(true); } catch { /* ignore */ } }, [reason]);
  useEffect(() => {
    let active = true;
    if (!user) { setBillingTrouble(false); return; }
    (async () => {
      const { data } = await supabase.from("stripe_subscriptions").select("status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (active) setBillingTrouble(isBillingTrouble(data?.status));
    })();
    return () => { active = false; };
  }, [user]);

  const suppressForPaid = def.freePreviewOnly && !isFreePreview;
  const suppressForModalSpam = variant === "modal" && !def.hard && modalAlreadyShownThisSession();
  const shouldRender = !suppressForPaid && !suppressForModalSpam && (!dismissed || def.hard);

  useEffect(() => {
    if (!shouldRender) return;
    trackUpgradeEvent("upgrade_nudge_viewed", { reason, plan });
    if (variant === "modal") markModalShownThisSession();
  }, [shouldRender, reason, plan, variant]);

  const finalTitle = title ?? def.title;
  const finalBody = body ?? def.body;
  const FIX_BILLING_CTA: CtaDef = { kind: "fix_billing", label: "Fix billing" };
  const FREE_COMPARE_CTA: CtaDef = { kind: "compare_plans", label: "Compare paid plans" };
  const resolveCta = (cta: CtaDef): CtaDef => {
    if (isFreePreview && cta.kind === "buy_credits") return FREE_COMPARE_CTA;
    if (billingTrouble && (cta.kind === "upgrade_growth" || cta.kind === "upgrade_agency")) return FIX_BILLING_CTA;
    return cta;
  };
  const primaryCta = resolveCta(def.primary);
  const secondaryCta = def.secondary ? resolveCta(def.secondary) : undefined;
  const showSecondary = !!secondaryCta && secondaryCta.kind !== primaryCta.kind;

  const handleDismiss = () => {
    if (def.hard) return;
    try { localStorage.setItem(DISMISS_KEY(reason), "1"); } catch { /* ignore */ }
    setDismissed(true);
    trackUpgradeEvent("upgrade_nudge_dismissed", { reason, plan });
    if (variant === "modal") onOpenChange?.(false);
  };

  const runCta = async (cta: CtaDef) => {
    if (cta.kind === "buy_credits") {
      if (isFreePreview) { navigate("/pricing"); return; }
      await trackUpgradeEvent("upgrade_nudge_clicked_buy_credits", { reason, plan });
      await trackUpgradeEvent("topup_checkout_started", { reason, plan });
      setTopupOpen(true); return;
    }
    if (cta.kind === "upgrade_growth") {
      await trackUpgradeEvent("upgrade_nudge_clicked_upgrade", { reason, plan, meta: { target: "growth" } });
      navigate("/app/billing?buy=growth"); return;
    }
    if (cta.kind === "upgrade_agency") {
      await trackUpgradeEvent("upgrade_nudge_clicked_upgrade", { reason, plan, meta: { target: "agency" } });
      navigate("/app/billing?buy=agency"); return;
    }
    if (cta.kind === "fix_billing") { navigate("/app/billing"); return; }
    if (cta.kind === "compare_plans") { navigate("/pricing"); return; }
    if (cta.kind === "learn_credits") { navigate("/help/getting-started"); return; }
    if (cta.kind === "keep_previewing") handleDismiss();
  };

  const toneClasses = useMemo(() => {
    switch (def.tone) {
      case "danger": return "border-destructive/40 bg-destructive/5 text-foreground";
      case "warn": return "border-accent/40 bg-accent/10 text-foreground";
      case "success": return "border-primary/30 bg-primary/5 text-foreground";
      default: return "border-border bg-muted/40 text-foreground";
    }
  }, [def.tone]);
  const Icon = def.tone === "danger" || def.tone === "warn" ? AlertTriangle : Sparkles;
  const ctas = <div className="flex flex-wrap gap-2">
    <Button size="sm" onClick={() => runCta(primaryCta)}>{primaryCta.label} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
    {showSecondary && <Button size="sm" variant="outline" onClick={() => runCta(secondaryCta!)}>{secondaryCta!.label}</Button>}
    {!def.hard && variant !== "modal" && <Button size="sm" variant="ghost" onClick={handleDismiss}>Not now</Button>}
  </div>;

  if (variant === "modal") {
    if (!shouldRender) return null;
    return <><Dialog open={open ?? true} onOpenChange={(v) => { if (!v && !def.hard) handleDismiss(); onOpenChange?.(v); }}><DialogContent><DialogHeader><DialogTitle>{finalTitle}</DialogTitle><DialogDescription>{finalBody}</DialogDescription></DialogHeader>{children}<DialogFooter className="gap-2 sm:justify-start">{ctas}</DialogFooter></DialogContent></Dialog><TopUpModal open={topupOpen} onOpenChange={setTopupOpen} /></>;
  }
  if (!shouldRender) return null;
  if (variant === "card") {
    return <><Card className={className}><CardContent className="p-4 space-y-3"><div className="flex items-start gap-3"><Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" /><div className="flex-1 min-w-0"><div className="font-semibold">{finalTitle}</div><div className="text-sm text-muted-foreground mt-1">{finalBody}</div></div>{!def.hard && <button aria-label="Dismiss" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}</div>{children}{ctas}</CardContent></Card><TopUpModal open={topupOpen} onOpenChange={setTopupOpen} /></>;
  }
  return <><div className={`rounded-md border px-3 py-2.5 ${toneClasses} ${className ?? ""}`}><div className="flex items-start gap-3"><Icon className="h-4 w-4 mt-0.5 shrink-0" /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{finalTitle}</div><div className="text-xs text-muted-foreground mt-0.5">{finalBody}</div>{children}<div className="mt-2">{ctas}</div></div>{!def.hard && <button aria-label="Dismiss" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}</div></div><TopUpModal open={topupOpen} onOpenChange={setTopupOpen} /></>;
}
