import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle, Zap, CheckCircle2, Pause } from "lucide-react";
import type { SafetyResult } from "@/lib/sendSafety";

export default function SendSafetyPanel({ s, used, scheduled }: { s: SafetyResult; used: number; scheduled: number }) {
  const pct = s.planCeiling > 0 ? Math.min(100, (s.safeAllowance / s.planCeiling) * 100) : 0;
  const paused = s.pauseReasons.length > 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Send Safety Engine
          {paused ? (
            <Badge variant="destructive" className="ml-auto"><Pause className="h-3 w-3 mr-1" />Sending paused</Badge>
          ) : (
            <Badge variant="outline" className="ml-auto">Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Cell label="Plan ceiling" value={`${s.planCeiling}/day`} />
          <Cell label="Safe allowance today" value={s.safeAllowance} accent />
          <Cell label="Used today" value={used} />
          <Cell label="Scheduled today" value={scheduled} />
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Today's safe send capacity</span>
            <span>{used + scheduled}/{s.safeAllowance}</span>
          </div>
          <Progress value={pct} />
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1.5">
          <Line ok icon={Zap}>Recommended send today: <b className="ml-1">{s.recommendedToday}</b> warm contacts</Line>
          <Line ok icon={CheckCircle2}>{s.remainingToday} remaining safe sends today</Line>
          <Line warn icon={AlertTriangle}>{s.excluded.risky} risky records excluded by default</Line>
          <Line warn icon={AlertTriangle}>{s.excluded.review} need review before activation</Line>
          <Line danger icon={AlertTriangle}>{s.excluded.blocked} blocked / suppressed (cannot be overridden)</Line>
          {typeof s.agencyPooledRemaining === "number" && (
            <Line ok icon={ShieldCheck}>
              Agency pooled cap: <b className="ml-1">{s.agencyPooledSendsToday?.toLocaleString()}</b>&nbsp;/&nbsp;{s.planCeiling.toLocaleString()} sends today across all client workspaces ({s.agencyPooledRemaining.toLocaleString()} left)
            </Line>
          )}
        </div>

        {s.adjustments.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-sm">
            <div className="font-medium mb-1 text-amber-700 dark:text-amber-400">Why today's limit is lower</div>
            <ul className="space-y-1 text-amber-900 dark:text-amber-200 list-disc pl-4">
              {s.adjustments.map((a, i) => <li key={i}>{a.reason}</li>)}
            </ul>
          </div>
        )}

        {paused && (
          <div className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-3 text-sm">
            <div className="font-medium mb-1 text-rose-700 dark:text-rose-400">Sending paused</div>
            <ul className="space-y-1 text-rose-900 dark:text-rose-200 list-disc pl-4">
              {s.pauseReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Cell({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function Line({ children, icon: Icon, ok, warn, danger }: any) {
  const tone = danger ? "text-rose-600" : warn ? "text-amber-600" : ok ? "text-emerald-600" : "text-foreground";
  return <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${tone}`} />{children}</div>;
}
