import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOPUP_PACKS } from "@/lib/credits";
import { useCredits } from "@/contexts/CreditsContext";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";
import { useDodoReadiness } from "@/hooks/useDodoReadiness";
import { CHECKOUT_ACTIVATING_COPY, isProductLiveReady, type DodoProductKey } from "@/lib/dodoReadiness";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { priceFor, taxNotice, type SkuId } from "@/lib/currency";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import BillingTermsSummary from "@/components/BillingTermsSummary";

const PACK_TO_PRODUCT: Record<string, DodoProductKey> = {
  small: "vv_topup_small",
  medium: "vv_topup_medium",
  large: "vv_topup_large",
};
const PACK_TO_SKU: Record<string, SkuId> = {
  small: "vv_topup_small",
  medium: "vv_topup_medium",
  large: "vv_topup_large",
};

export default function TopUpModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { startCheckout } = useDodoCheckout();
  const { readiness } = useDodoReadiness();
  const { currency } = useCurrency();
  const { plan, isFreePreview, entitled, entitlementEnded } = useCredits();
  const navigate = useNavigate();
  const [pendingPack, setPendingPack] = useState<string | null>(null);
  const canBuyTopup = entitled && !isFreePreview;

  const handle = (packId: string) => {
    if (!canBuyTopup) return;
    onOpenChange(false);
    setPendingPack(packId);
  };

  const confirmBuy = async () => {
    if (!pendingPack || !canBuyTopup) return;
    const id = pendingPack;
    setPendingPack(null);
    const productKey = PACK_TO_PRODUCT[id];
    if (!isProductLiveReady(readiness, productKey)) {
      toast.info(CHECKOUT_ACTIVATING_COPY, { description: "No payment was taken." });
      return;
    }
    await startCheckout(productKey);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Top up Campaign Credits</DialogTitle>
            <DialogDescription>
              {isFreePreview
                ? "Free Preview is limited to one full campaign pack. Move to a paid plan before buying additional Campaign Credits."
                : entitlementEnded
                  ? "Your paid access has ended. Renew or choose a current paid plan before buying additional Campaign Credits."
                  : "Choose an available credit pack for this paid workspace. Credits are fulfilled after confirmed payment."}
            </DialogDescription>
          </DialogHeader>

          {!canBuyTopup ? (
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                {isFreePreview
                  ? "Top-ups are not sold into Free Preview because the preview remains capped at one full campaign pack and 25 contacts. Starter is a one-off paid option; Growth and Agency are monthly plans."
                  : "Unused paid top-up balance remains recorded on the account, but new top-ups and paid actions require a current paid entitlement."}
              </p>
              <Button onClick={() => { onOpenChange(false); navigate(isFreePreview ? "/pricing" : "/app/billing"); }}>
                {isFreePreview ? "Compare paid plans" : "Renew or change plan"}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {TOPUP_PACKS.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-4 flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-accent" />{p.label}</div>
                    <div className="text-3xl font-bold mt-2">{p.credits}<span className="text-sm font-normal text-muted-foreground"> credits</span></div>
                    <div className="text-sm text-muted-foreground mt-1">{priceFor(PACK_TO_SKU[p.id], currency).formatted}</div>
                    <p className="text-xs text-muted-foreground mt-2 flex-1">{p.blurb}</p>
                    <Button className="mt-3" size="sm" onClick={() => handle(p.id)}>Buy pack</Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Campaign Credits currently fund credit-priced AI generation, not per-contact sending. {taxNotice(currency)}</p>
              <BillingTermsSummary className="mt-4" compact />
            </>
          )}
          <p className="text-[11px] text-muted-foreground">Current plan: {plan.replace("_", " ")}.</p>
        </DialogContent>
      </Dialog>
      <LegalComplianceGate
        open={pendingPack !== null && canBuyTopup}
        onOpenChange={(v) => { if (!v) setPendingPack(null); }}
        source="topup_checkout"
        title="Confirm current terms before buying credits"
        description="Please accept the current versions of our platform legal stack to continue to checkout."
        confirmLabel="Accept and continue to checkout"
        onConfirm={confirmBuy}
      />
    </>
  );
}
