// Compact plan-aware summary near the top of the customer dashboard.
// Explains what the customer has, what is included, and the next useful step.
// All content derives from the shared package truth (src/lib/credits.ts,
// src/lib/sendSafety.ts) — never a separate hard-coded matrix.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";
import { canUseRecurringCadence, FREE_LIMITS } from "@/lib/credits";
import { PLAN_DAILY_CEILING } from "@/lib/sendSafety";

export default function PlanSummaryCard() {
  const { plan, planConfig, remaining, included, starterExpired, isFreePreview, freePreviewExpired } = useCredits();
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const justActivated =
    !bannerDismissed && (location.state as { planActivated?: string } | null)?.planActivated === plan
      ? plan
      : null;

  const dismissBanner = () => {
    setBannerDismissed(true);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const ceiling = PLAN_DAILY_CEILING[plan] ?? 0;
  const ended = starterExpired || freePreviewExpired;

  const allowance: string[] = isFreePreview
    ? [
        `Up to ${FREE_LIMITS.maxContacts} contacts`,
        `${FREE_LIMITS.maxCampaignPacks} full campaign pack`,
        "No live sending — review mode",
        "1 workspace",
      ]
    : [
        `${planConfig.includedCredits} Campaign Credits${planConfig.cadence === "monthly" ? " / month" : ""}`,
        `Live sending up to ${ceiling}/day (sender safety applies)`,
        canUseRecurringCadence(plan) ? "Recurring cadence & templates" : "One-off campaigns",
        planConfig.workspaceLimit === null ? "Unlimited client workspaces" : "1 workspace",
      ];

  return (
    <div className="space-y-3">
      {justActivated && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent shrink-0" />
              <div>
                <div className="font-semibold">Payment received — {planConfig.name} is active</div>
                <p className="text-sm text-muted-foreground">
                  Your allowance is ready. The next useful step is below.
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={dismissBanner}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{planConfig.name}</h2>
                <Badge variant={ended ? "destructive" : "secondary"}>{ended ? "Ended" : "Active"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{planConfig.tagline}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">{remaining}</strong> Campaign Credits remaining
              {included > 0 ? ` of ${included} this period` : ""}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allowance.map((a) => (
              <span key={a} className="text-xs rounded-full border border-border bg-muted/40 px-3 py-1">{a}</span>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Included with your plan</div>
              <ul className="space-y-1">
                {planConfig.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next step</div>
              {isFreePreview ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Review mode: explore the full workflow, upload up to {FREE_LIMITS.maxContacts} contacts and generate one full campaign pack. Live sending stays off until you move to a paid plan.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => navigate("/app/campaigns/copilot")}>
                      Start the First-Campaign Copilot <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/app/billing")}>Compare paid plans</Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Build your next campaign: brief it with the Copilot, review the full pack, then prepare activation under sender-safety checks.
                  </p>
                  <Button size="sm" onClick={() => navigate("/app/campaigns/copilot")}>
                    Open the First-Campaign Copilot <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
