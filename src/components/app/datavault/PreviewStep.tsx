import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { QualityStatus } from "@/lib/dataVault/validate";
import type { DuplicateStatus } from "@/lib/dataVault/duplicates";

export interface PreviewRow {
  row_number: number;
  mapped_fields: Record<string, string>;
  validation_status: QualityStatus;
  duplicate_status: DuplicateStatus;
  issues: string[];
}

interface Props {
  rows: PreviewRow[];
  totals: { valid: number; needs_review: number; risky: number; blocked: number; duplicates: number; total: number };
}

const QUALITY_COLORS: Record<QualityStatus, string> = {
  valid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  needs_review: "bg-amber-100 text-amber-700 border-amber-200",
  risky: "bg-orange-100 text-orange-700 border-orange-200",
  blocked: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function PreviewStep({ rows, totals }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Total</div><div className="text-lg font-bold">{totals.total}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Valid</div><div className="text-lg font-bold text-emerald-600">{totals.valid}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Needs review</div><div className="text-lg font-bold text-amber-600">{totals.needs_review}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Risky</div><div className="text-lg font-bold text-orange-600">{totals.risky}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Blocked</div><div className="text-lg font-bold text-rose-600">{totals.blocked}</div></CardContent></Card>
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Duplicates</div><div className="text-lg font-bold">{totals.duplicates}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground border-b border-border bg-muted/30">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Quality</th>
                <th className="px-3 py-2">Duplicate</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 25).map((r) => {
                const name = r.mapped_fields.full_name || `${r.mapped_fields.first_name || ""} ${r.mapped_fields.last_name || ""}`.trim() || "—";
                return (
                  <tr key={r.row_number} className="border-b border-border/40">
                    <td className="px-3 py-2 text-muted-foreground">{r.row_number}</td>
                    <td className="px-3 py-2">{name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.mapped_fields.email || "—"}</td>
                    <td className="px-3 py-2">{r.mapped_fields.company_name || "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={`text-xs capitalize ${QUALITY_COLORS[r.validation_status]}`}>
                        {r.validation_status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 capitalize text-xs text-muted-foreground">{r.duplicate_status}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[220px]">{r.issues.join("; ") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > 25 && (
            <div className="px-3 py-2 text-xs text-muted-foreground border-t">Showing first 25 of {rows.length} rows.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
