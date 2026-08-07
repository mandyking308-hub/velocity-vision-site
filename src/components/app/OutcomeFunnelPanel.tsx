import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { computeFunnel, sourceBreakdown, type FunnelFilters, type FunnelLead, type FunnelOpportunity } from "@/lib/outcomeFunnel";

/** Outcome funnel: stored events only — no benchmarks, modelled attribution or A/B testing. */
export default function OutcomeFunnelPanel({
  leads,
  opportunities = [],
  campaigns = {},
  filters,
  onFiltersChange,
}: {
  leads: FunnelLead[];
  opportunities?: FunnelOpportunity[];
  campaigns?: Record<string, string>;
  filters?: FunnelFilters;
  onFiltersChange?: (f: FunnelFilters) => void;
}) {
  const active = filters ?? { campaignId: "all" as const };
  const stages = useMemo(() => computeFunnel(leads, opportunities, active), [leads, opportunities, active]);
  const sources = useMemo(() => sourceBreakdown(leads, active), [leads, active]);

  return (
    <Card data-testid="outcome-funnel">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Outcomes</h3>
          </div>
          {onFiltersChange && Object.keys(campaigns).length > 0 && (
            <Select value={active.campaignId || "all"} onValueChange={(v) => onFiltersChange({ ...active, campaignId: v })}>
              <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                {Object.entries(campaigns).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {stages.map((s) => (
            <div key={s.key} className="rounded-md border p-2.5" data-testid={`funnel-${s.key}`}>
              <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
              <p className="text-xl font-semibold tabular-nums">{s.count}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.key === "contacted" ? s.denominatorLabel : `${s.rateFromPrev}% ${s.denominatorLabel}`}
              </p>
            </div>
          ))}
        </div>

        {sources.length > 0 && (
          <div className="text-xs space-y-1">
            <p className="font-medium">By source</p>
            {sources.map((s) => (
              <p key={s.source} className="text-muted-foreground">
                {s.source}: {s.leads} leads · {s.replies} replies ({s.replyRate}%) · {s.meetings} meetings
              </p>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Counts come from stored records only. Stages with no data read zero. Nothing is estimated or benchmarked, and no automated attribution or A/B testing is performed.
        </p>
      </CardContent>
    </Card>
  );
}
