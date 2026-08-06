import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, ArrowRight } from "lucide-react";
import type { PreflightResult, PreflightCheck } from "@/lib/campaignPreflight";

/**
 * Campaign Preflight & Readiness Centre.
 * Read-only presentation of the deterministic checks in lib/campaignPreflight.
 * It never performs a send — it explains, in one place, exactly what must be
 * true before activation is allowed.
 */
export default function CampaignPreflight({
  result,
  title = "Preflight & readiness",
  compact = false,
  footer,
}: {
  result: PreflightResult;
  title?: string;
  compact?: boolean;
  footer?: React.ReactNode;
}) {
  const { checks, blockers, warnings, canActivate } = result;
  // Direct fix link for the single most important outstanding item.
  const nextFix = [...blockers, ...warnings].find((c) => Boolean(c.fixTo)) ?? null;



  return (
    <Card className={canActivate ? "border-emerald-200" : "border-amber-200"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" /> {title}
          </CardTitle>
          {canActivate ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              {warnings.length > 0 ? "Ready — needs attention" : "Ready to activate"}
            </Badge>
          ) : (
            <Badge variant="destructive">Blocked</Badge>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="text-emerald-700">
            {checks.filter((c) => c.ok).length} pass
          </Badge>
          <Badge variant="outline" className="text-amber-700">
            {warnings.length} needs attention
          </Badge>
          <Badge variant="outline" className="text-rose-700">
            {blockers.length} blocked
          </Badge>
        </div>

        {!canActivate && (
          <p className="text-xs text-muted-foreground mt-2">
            Activation stays locked until every blocker below is cleared. Nothing sends automatically.
          </p>
        )}
        {canActivate && warnings.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            You can activate, but {warnings.length} item{warnings.length === 1 ? "" : "s"} would improve this send.
          </p>
        )}
        {nextFix?.fixTo && (
          <div className="mt-2">
            <Button asChild size="sm" data-testid="preflight-next-fix">
              <Link to={nextFix.fixTo}>
                Fix next: {nextFix.label} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {(compact ? [...blockers, ...warnings] : checks).map((c) => (
          <Row key={c.id} check={c} />
        ))}
        {compact && blockers.length === 0 && warnings.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Every preflight check passed.
          </div>
        )}
        {footer && <div className="pt-2 border-t">{footer}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ check }: { check: PreflightCheck }) {
  const Icon = check.ok ? CheckCircle2 : check.severity === "blocker" ? XCircle : AlertTriangle;
  const tone = check.ok
    ? "text-emerald-600"
    : check.severity === "blocker"
      ? "text-rose-600"
      : "text-amber-600";
  const bg = check.ok
    ? "border-emerald-200 bg-emerald-50/40"
    : check.severity === "blocker"
      ? "border-rose-200 bg-rose-50/40"
      : "border-amber-200 bg-amber-50/40";

  return (
    <div className={`flex items-start gap-3 rounded-md border p-2.5 ${bg}`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone}`} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{check.label}</div>
        <div className="text-xs text-muted-foreground">{check.detail}</div>
      </div>
      {!check.ok && check.fixTo && (
        <Button asChild size="sm" variant="ghost" className="shrink-0">
          <Link to={check.fixTo}>
            {check.fixLabel || "Fix"} <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}
