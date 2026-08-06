import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, Rocket } from "lucide-react";
import { resolveLaunchpad, type LaunchpadSignals } from "@/lib/launchpad";

/**
 * Guided First Campaign Launchpad.
 * Answers "what should I do next?" from live workspace data only. It never
 * claims a campaign is live before approval and real activation.
 */
export default function FirstCampaignLaunchpad({ signals }: { signals: LaunchpadSignals }) {
  const result = resolveLaunchpad(signals);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" /> First campaign launchpad
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {result.campaignLive ? (
              <Badge className="bg-emerald-100 text-emerald-700">Approved &amp; activated</Badge>
            ) : (
              <Badge variant="outline">Not live yet</Badge>
            )}
            <Badge variant="outline">
              {result.completed} / {result.total} done
            </Badge>
          </div>
        </div>
        {result.nextBestAction && (
          <div
            className={`mt-3 rounded-lg border p-3 ${
              result.nextBestAction.urgent ? "border-amber-300 bg-amber-50/60" : "border-primary/30 bg-background"
            }`}
            data-testid="next-best-action"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> Next best action
            </div>
            <div className="mt-1 text-sm font-semibold">{result.nextBestAction.label}</div>
            <p className="text-xs text-muted-foreground">{result.nextBestAction.detail}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">Why:</strong> {result.nextBestAction.why}
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link to={result.nextBestAction.to}>
                {result.nextBestAction.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}

      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {result.steps.map((s) => {
            const isNext = result.nextStep?.id === s.id;
            return (
              <li
                key={s.id}
                className={`flex items-start gap-3 rounded-md border p-2.5 ${
                  s.done
                    ? "border-emerald-200 bg-emerald-50/40"
                    : isNext
                      ? "border-primary/40 bg-background"
                      : "border-border bg-background/60"
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${s.done ? "line-through text-muted-foreground" : ""}`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.detail}</div>
                </div>
                {!s.done && (
                  <Button asChild size="sm" variant="ghost" className="shrink-0">
                    <Link to={s.to}>{s.cta}</Link>
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
