import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Users, Building2, Copy, Ban, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ImportSummary {
  rows: number;
  created: number;
  companies_created: number;
  duplicates: number;
  risky: number;
  needs_review: number;
  blocked: number;
  safe_to_send: number;
  recommended: { title: string; to: string }[];
}

export default function ImportReport({ s }: { s: ImportSummary }) {
  return (
    <div className="space-y-4">
      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-5 flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <div>
            <div className="font-semibold">Import complete</div>
            <div className="text-sm text-muted-foreground">
              {s.created} contact{s.created === 1 ? "" : "s"} added · {s.safe_to_send} safe to send
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} label="Contacts created" value={s.created} />
        <Stat icon={Building2} label="Companies created" value={s.companies_created} />
        <Stat icon={Copy} label="Duplicates" value={s.duplicates} />
        <Stat icon={AlertTriangle} label="Needs review" value={s.needs_review} tone="warn" />
        <Stat icon={AlertTriangle} label="Risky" value={s.risky} tone="warn" />
        <Stat icon={Ban} label="Blocked" value={s.blocked} tone="danger" />
        <Stat icon={CheckCircle2} label="Safe to send" value={s.safe_to_send} tone="good" />
        <Stat icon={Users} label="Rows uploaded" value={s.rows} />
      </div>

      {s.recommended.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="font-medium text-sm mb-2">Recommended next steps</div>
            {s.recommended.map((r, i) => (
              <Button key={i} asChild variant="ghost" className="w-full justify-between">
                <Link to={r.to}>{r.title} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  const c = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "danger" ? "text-rose-600" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
        <div className={`text-2xl font-bold mt-1 ${c}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
