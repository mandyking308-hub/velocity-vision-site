import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/contexts/CreditsContext";
import { usageState } from "@/lib/credits";
import TopUpModal from "./TopUpModal";
import UpgradeNudge from "./UpgradeNudge";
import { useState } from "react";
import { Link } from "react-router-dom";

export function CreditPill() {
  const { remaining, included, topupBalance, isFreePreview } = useCredits();
  const total = isFreePreview ? included : included + topupBalance;
  return (
    <Link to="/app/billing" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-medium">
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      <span>{remaining} / {total} credits</span>
    </Link>
  );
}

export default function CreditMeter() {
  const { included, used, topupBalance, remaining, periodEnd, planConfig, starterExpired, isFreePreview } = useCredits();
  const [open, setOpen] = useState(false);
  // Free Preview has no purchasable or spendable top-up bucket. Historical
  // top-up ledger rows may still exist for reconciliation, but they must not
  // change the customer-visible preview allowance.
  const total = isFreePreview ? included : included + topupBalance;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const state = usageState(used, total);
  const nextReset = periodEnd ? periodEnd.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

  const nudgeReason =
    state === "exhausted" ? "credits_exhausted" as const :
    state === "strong" ? "credits_strong" as const :
    state === "soft" ? "credits_soft" as const : null;

  return (
    <>
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Campaign Credits</div>
              <div className="text-3xl font-bold mt-1">{remaining}<span className="text-base font-normal text-muted-foreground"> / {total}</span></div>
              <div className="text-xs text-muted-foreground mt-1">
                {planConfig.name} • {planConfig.cadence === "monthly" ? `Resets ${nextReset}` : starterExpired ? "Starter ended" : `Access until ${nextReset}`}
              </div>
            </div>
            <div className="flex gap-2">
              {isFreePreview ? (
                <Button size="sm" asChild><Link to="/pricing">Compare paid plans</Link></Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Buy credits</Button>
                  <Button size="sm" asChild><Link to="/app/billing">Upgrade</Link></Button>
                </>
              )}
            </div>
          </div>
          <Progress value={pct} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{used} used this cycle</span>
            {!isFreePreview && <span>{topupBalance > 0 && `+${topupBalance} top-up`}</span>}
          </div>
          {nudgeReason && <UpgradeNudge reason={nudgeReason} variant="inline" />}
        </CardContent>
      </Card>
      {!isFreePreview && <TopUpModal open={open} onOpenChange={setOpen} />}
    </>
  );
}
