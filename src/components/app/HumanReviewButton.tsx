import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { priceFor } from "@/lib/currency";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";
import { useDodoReadiness } from "@/hooks/useDodoReadiness";
import { CHECKOUT_ACTIVATING_COPY, isProductLiveReady } from "@/lib/dodoReadiness";
import { toast } from "sonner";
import LegalComplianceGate from "@/components/LegalComplianceGate";

interface Props { campaignId: string }

export default function HumanReviewButton({ campaignId }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [existing, setExisting] = useState<{ status: string } | null>(null);
  const { startCheckout } = useDodoCheckout();
  const { readiness } = useDodoReadiness();
  const [legalOpen, setLegalOpen] = useState(false);
  const { currency } = useCurrency();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("human_reviews").select("status").eq("campaign_id", campaignId).maybeSingle();
      setExisting(data as any);
    })();
  }, [user, campaignId]);

  if (existing) {
    return (
      <Button variant="outline" size="sm" disabled>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Human review: {existing.status}
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4 mr-2" /> Get expert review
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Premium Human Review</DialogTitle>
            <DialogDescription>
              A senior strategist reviews this campaign pack, sends written recommendations, and provides one async revision pass.
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Independent expert review of strategy, copy and offer</li>
            <li>Prioritized recommendations</li>
            <li>One async revision pass on the pack</li>
          </ul>
          <DialogFooter className="mt-4 flex items-center justify-between">
            <span className="text-lg font-semibold">{priceFor("vv_human_review_oneoff", currency).formatted}</span>
            <Button onClick={() => { setOpen(false); setLegalOpen(true); }}>Purchase review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LegalComplianceGate
        open={legalOpen}
        onOpenChange={setLegalOpen}
        source="human_review_checkout"
        title="Confirm current terms before checkout"
        description="Please accept the current versions of our platform legal stack to continue to checkout."
        confirmLabel="Accept and continue"
        onConfirm={async () => {
          if (!isProductLiveReady(readiness, "vv_human_review_oneoff")) {
            toast.info(CHECKOUT_ACTIVATING_COPY, { description: "No payment was taken." });
            return;
          }
          await startCheckout("vv_human_review_oneoff", campaignId);
        }}
      />
    </>
  );
}
