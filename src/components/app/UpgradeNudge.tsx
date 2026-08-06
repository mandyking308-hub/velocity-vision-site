// Reusable upgrade nudge — inline, banner, modal or card.
// Respects anti-spam suppression (localStorage) and skips paid users
// for free-preview-only reasons. Hard gates never render a dismiss button.
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
import { trackUpgradeEvent, type UpgradeEventName } from "@/lib/upgradeEvents";
import TopUpModal from "./TopUpModal";

export type NudgeVariant = "inline" | "banner" | "modal" | "card";

export type NudgeReason =
  | "credits_soft"
  | "credits_strong"
  | "credits_exhausted"
  | "free_preview_first_pack_ready"
  | "free_preview_second_pack_gate"
  | "free_preview_contact_limit"
  | "free_preview_export_gate"
  | "free_preview_sending_gate"
  | "free_preview_expiring"
  | "free_preview_expired"
  | "upgrade_for_growth"
  | "upgrade_for_agency";

type CtaKind = "buy_credits" | "upgrade_growth" | "upgrade_agency" | "compare_plans" | "learn_credits" | "keep_previewing" | "fix_billing";

interface CtaDef {
  kind: CtaKind;
  label: string;
}

interface ReasonDef {
  title: string;
  body: string;
  primary: CtaDef;
  secondary?: CtaDef;
  hard: boolean;
  freePreviewOnly?: boolean;
  tone?: "default" | "warn" | "danger" | "success";
}

const REASONS: Record<NudgeReason, ReasonDef> = {
  credits_soft: {
    title: "You've used 75% of your credits",
    body: "You're still good to go — top up any time to keep momentum.",
    primary: { kind: "buy_credits", label: "Buy credits" },
    secondary: { kind: "compare_plans", label: "Compare plans" },
    hard: false,
    tone: "default",
  },
  credits_strong: {
    title: "Only a few credits left this cycle",
    body: "Buy credits for one more sprint, or upgrade to keep generating without interruption.",
    primary: { kind: "buy_credits", label: "Buy credits" },
    secondary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    hard: false,
    tone: "warn",
  },
  credits_exhausted: {
    title: "You're out of Campaign Credits",
    body: "Existing work stays available. Buy credits or upgrade to keep generating.",
    primary: { kind: "buy_credits", label: "Buy credits" },
    secondary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    hard: true,
    tone: "danger",
  },
  free_preview_first_pack_ready: {
    title: "Your first campaign pack is ready",
    body: "Upgrade to Growth to run recurring campaigns and prepare safe activation.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "keep_previewing", label: "Keep previewing" },
    hard: false,
    freePreviewOnly: true,
    tone: "success",
  },
  free_preview_second_pack_gate: {
    title: "You've used your Free Preview campaign pack",
    body: "Buy credits or upgrade to keep generating full campaign packs.",
    primary: { kind: "buy_credits", label: "Buy credits" },
    secondary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    hard: true,
    freePreviewOnly: true,
    tone: "warn",
  },
  free_preview_contact_limit: {
    title: "Free Preview supports 25 contacts",
    body: "Upgrade to Growth to work with larger audiences and unlock recurring campaigns.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "buy_credits", label: "Buy credits" },
    hard: true,
    freePreviewOnly: true,
    tone: "warn",
  },
  free_preview_export_gate: {
    title: "Preview exports are limited on Free Preview",
    body: "Upgrade to unlock full campaign export and remove preview watermarks.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "compare_plans", label: "Compare plans" },
    hard: true,
    freePreviewOnly: true,
    tone: "warn",
  },
  free_preview_sending_gate: {
    title: "Live sending unlocks on paid plans",
    body: "Free Preview lets you build and review campaigns. Live sending unlocks after sender verification on Growth.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "learn_credits", label: "Learn about safe activation" },
    hard: true,
    freePreviewOnly: true,
    tone: "warn",
  },
  free_preview_expiring: {
    title: "Your Free Preview is ending soon",
    body: "Your workspace stays available. Upgrade to Growth to keep generating and enable safe activation.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "buy_credits", label: "Buy credits" },
    hard: false,
    freePreviewOnly: true,
    tone: "warn",
  },
  free_preview_expired: {
    title: "Free Preview has ended",
    body: "Paid top-up credits still work. Upgrade to Growth for recurring campaigns and full activation.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "buy_credits", label: "Buy credits" },
    hard: true,
    freePreviewOnly: true,
    tone: "danger",
  },
  upgrade_for_growth: {
    title: "Ready for recurring campaigns?",
    body: "Growth unlocks larger audiences, recurring cadences and safe activation.",
    primary: { kind: "upgrade_growth", label: "Upgrade to Growth" },
    secondary: { kind: "compare_plans", label: "Compare plans" },
    hard: false,
    tone: "default",
  },
  upgrade_for_agency: {
    title: "Running multiple client workspaces?",
    body: "Agency pools credits across clients and unlocks unlimited workspaces.",
    primary: { kind: "upgrade_agency", label: "Upgrade to Agency" },
    secondary: { kind: "compare_plans", label: "Compare plans" },
    hard: false,
    tone: "default",
  },
};

const DISMISS_KEY = (reason: NudgeReason) => `vv_nudge_dismissed_${reason}`;
const MODAL_SESSION_KEY = "vv_nudge_modal_shown_this_session";

export function markModalShownThisSession() {
  try { sessionStorage.setItem(MODAL_SESSION_KEY, "1"); } catch { /* ignore */ }
}
export function modalAlreadyShownThisSession() {
  try { return sessionStorage.getItem(MODAL_SESSION_KEY) === "1"; } catch { return false; }
}

interface UpgradeNudgeProps {
  reason: NudgeReason;
  variant?: NudgeVariant;
  /** For modal variant: controlled open state. */
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  /** Override title/body copy if you need contextual specifics. */
  title?: string;
  body?: string;
  className?: string;
  /** Extra content slotted above CTAs (e.g. a small stat line). */
  children?: ReactNode;
}

export default function UpgradeNudge({
  reason, variant = "inline", open, onOpenChange, title, body, className, children,
}: UpgradeNudgeProps) {
  const def = REASONS[reason];
  const { plan, isFreePreview } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topupOpen, setTopupOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // When the current subscription is in a problem state we must not invite a
  // second subscription — the customer needs to fix billing first.
  const [billingTrouble, setBillingTrouble] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem(DISMISS_KEY(reason)) === "1") setDismissed(true); } catch { /* ignore */ }
  }, [reason]);

  useEffect(() => {
    let active = true;
    if (!user) { setBillingTrouble(false); return; }
    (async () => {
      const { data } = await supabase
        .from("stripe_subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
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
  /** Swap plan-purchase CTAs for a billing-fix CTA while billing is broken. */
  const resolveCta = (cta: CtaDef): CtaDef =>
    billingTrouble && (cta.kind === "upgrade_growth" || cta.kind === "upgrade_agency")
      ? FIX_BILLING_CTA
      : cta;
  const primaryCta = resolveCta(def.primary);
  const secondaryCta = def.secondary ? resolveCta(def.secondary) : undefined;
  // Avoid rendering the same "Fix billing" button twice.
  const showSecondary = !!secondaryCta && secondaryCta.kind !== primaryCta.kind;



  const runCta = async (cta: CtaDef) => {
    if (cta.kind === "buy_credits") {
      await trackUpgradeEvent("upgrade_nudge_clicked_buy_credits", { reason, plan });
      await trackUpgradeEvent("topup_checkout_started", { reason, plan });
      setTopupOpen(true);
      return;
    }
    if (cta.kind === "upgrade_growth") {
      await trackUpgradeEvent("upgrade_nudge_clicked_upgrade", { reason, plan, meta: { target: "growth" } });
      await trackUpgradeEvent("growth_checkout_started", { reason, plan });
      navigate("/app/billing?upgrade=growth");
      return;
    }
    if (cta.kind === "upgrade_agency") {
      await trackUpgradeEvent("upgrade_nudge_clicked_upgrade", { reason, plan, meta: { target: "agency" } });
      navigate("/app/billing?upgrade=agency");
      return;
    }
    if (cta.kind === "compare_plans") { navigate("/pricing"); return; }
    if (cta.kind === "learn_credits") { navigate("/help/getting-started"); return; }
    if (cta.kind === "keep_previewing") { handleDismiss(); return; }
  };

  const handleDismiss = () => {
    if (def.hard) return;
    try { localStorage.setItem(DISMISS_KEY(reason), "1"); } catch { /* ignore */ }
    setDismissed(true);
    trackUpgradeEvent("upgrade_nudge_dismissed", { reason, plan });
    if (variant === "modal") onOpenChange?.(false);
  };

  const toneClasses = useMemo(() => {
    switch (def.tone) {
      case "danger": return "border-destructive/40 bg-destructive/5 text-foreground";
      case "warn": return "border-accent/40 bg-accent/10 text-foreground";
      case "success": return "border-primary/30 bg-primary/5 text-foreground";
      default: return "border-border bg-muted/40 text-foreground";
    }
  }, [def.tone]);

  const icon = def.tone === "danger" || def.tone === "warn" ? AlertTriangle : Sparkles;
  const Icon = icon;

  const ctas = (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => runCta(def.primary)}>
        {def.primary.label} <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Button>
      {def.secondary && (
        <Button size="sm" variant="outline" onClick={() => runCta(def.secondary!)}>
          {def.secondary.label}
        </Button>
      )}
      {!def.hard && variant !== "modal" && (
        <Button size="sm" variant="ghost" onClick={handleDismiss}>Not now</Button>
      )}
    </div>
  );

  // MODAL variant — controlled Dialog
  if (variant === "modal") {
    if (!shouldRender) return null;
    return (
      <>
        <Dialog open={open ?? true} onOpenChange={(v) => { if (!v && !def.hard) handleDismiss(); onOpenChange?.(v); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{finalTitle}</DialogTitle>
              <DialogDescription>{finalBody}</DialogDescription>
            </DialogHeader>
            {children}
            <DialogFooter className="gap-2 sm:justify-start">{ctas}</DialogFooter>
          </DialogContent>
        </Dialog>
        <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
      </>
    );
  }

  if (!shouldRender) return null;

  // CARD variant
  if (variant === "card") {
    return (
      <>
        <Card className={className}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{finalTitle}</div>
                <div className="text-sm text-muted-foreground mt-1">{finalBody}</div>
              </div>
              {!def.hard && (
                <button aria-label="Dismiss" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {children}
            {ctas}
          </CardContent>
        </Card>
        <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
      </>
    );
  }

  // BANNER / INLINE — both use a bordered horizontal strip
  return (
    <>
      <div className={`rounded-md border px-3 py-2.5 ${toneClasses} ${className ?? ""}`}>
        <div className="flex items-start gap-3">
          <Icon className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{finalTitle}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{finalBody}</div>
            {children}
            <div className="mt-2">{ctas}</div>
          </div>
          {!def.hard && (
            <button aria-label="Dismiss" onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <TopUpModal open={topupOpen} onOpenChange={setTopupOpen} />
    </>
  );
}
