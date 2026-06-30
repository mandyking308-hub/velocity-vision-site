import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/contexts/CreditsContext";
import { usageState } from "@/lib/credits";
import TopUpModal from "./TopUpModal";
import { useState } from "react";
import { Link } from "react-router-dom";

export function CreditPill() {
  const { remaining, included, topupBalance } = useCredits();
  const total = included + topupBalance;
  return (
    <Link to="/app/billing" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-medium">
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      <span>{remaining} / {total} credits</span>
    </Link>
  );
}

export default function CreditMeter() {
  const { included, used, topupBalance, remaining, periodEnd, planConfig, starterExpired } = useCredits();
  const [open, setOpen] = useState(false);
  const total = included + topupBalance;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const state = usageState(used, total);
  const nextReset = periodEnd ? periodEnd.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

  const banner =
    state === "exhausted" ? { tone: "bg-destructive/10 border-destructive/40 text-destructive", text: "AI generation is paused. Existing work is fully available. Buy more credits or upgrade to keep launching." } :
    state === "strong" ? { tone: "bg-accent/15 border-accent/40 text-foreground", text: "Heads up — you've used over 90% of your credits this cycle." } :
    state === "soft" ? { tone: "bg-muted border-border text-muted-foreground", text: "You've used 75% of your credits this cycle." } : null;

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
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Buy credits</Button>
              <Button size="sm" asChild><Link to="/app/billing">Upgrade</Link></Button>
            </div>
          </div>
          <Progress value={pct} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{used} used this cycle</span>
            <span>{topupBalance > 0 && `+${topupBalance} top-up`}</span>
          </div>
          {banner && (
            <div className={`text-sm border rounded-md px-3 py-2 ${banner.tone}`}>{banner.text}</div>
          )}
        </CardContent>
      </Card>
      <TopUpModal open={open} onOpenChange={setOpen} />
    </>
  );
}
