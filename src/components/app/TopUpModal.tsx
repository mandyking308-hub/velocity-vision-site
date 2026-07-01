import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOPUP_PACKS } from "@/lib/credits";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PRICE_IDS } from "@/lib/stripe";
import { Sparkles } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { priceFor, taxNotice, type SkuId } from "@/lib/currency";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import { useAuth } from "@/contexts/AuthContext";
import { recordLegalAcceptance } from "@/lib/recordLegalAcceptance";
import BillingTermsSummary from "@/components/BillingTermsSummary";

const PACK_TO_PRICE: Record<string, string> = {
  small: PRICE_IDS.topup_small,
  medium: PRICE_IDS.topup_medium,
  large: PRICE_IDS.topup_large,
};
const PACK_TO_SKU: Record<string, SkuId> = {
  small: "vv_topup_small",
  medium: "vv_topup_medium",
  large: "vv_topup_large",
};

export default function TopUpModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { openCheckout, element } = useStripeCheckout();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [pendingPack, setPendingPack] = useState<string | null>(null);

  const handle = (packId: string) => {
    onOpenChange(false);
    setPendingPack(packId);
  };

  const confirmBuy = async () => {
    if (!pendingPack) return;
    const id = pendingPack;
    setPendingPack(null);
    openCheckout({
      priceId: PACK_TO_PRICE[id],
      title: "Buy Campaign Credits",
      returnPath: `/app/billing?checkout=topup_${id}`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Top up Campaign Credits</DialogTitle>
            <DialogDescription>Pick a pack — credits are added the moment payment clears.</DialogDescription>
          </DialogHeader>
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
          <p className="text-xs text-muted-foreground mt-2">Top-ups never expire while your plan is active. {taxNotice(currency)}</p>
          <BillingTermsSummary className="mt-4" compact />
        </DialogContent>
      </Dialog>
      <LegalComplianceGate
        open={pendingPack !== null}
        onOpenChange={(v) => { if (!v) setPendingPack(null); }}
        source="topup_checkout"
        title="Confirm current terms before buying credits"
        description="Please accept the current versions of our platform legal stack to continue to checkout."
        confirmLabel="Accept and continue to checkout"
        onConfirm={confirmBuy}
      />
      {element}
    </>
  );
}
