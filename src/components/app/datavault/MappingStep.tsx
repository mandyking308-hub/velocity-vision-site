import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DESTINATION_FIELDS, DestinationField } from "@/lib/dataVault/destinationFields";
import { AlertCircle } from "lucide-react";

interface Props {
  headers: string[];
  sampleRow: Record<string, string>;
  mapping: Record<string, DestinationField>;
  onChange: (header: string, dest: DestinationField) => void;
}

export default function MappingStep({ headers, sampleRow, mapping, onChange }: Props) {
  const mapped = Object.values(mapping).filter((v) => v !== "ignore");
  const hasEmail = mapped.includes("email");
  const hasName = mapped.includes("full_name") || mapped.includes("first_name") || mapped.includes("last_name");

  return (
    <div className="space-y-4">
      {(!hasEmail || !hasName) && (
        <div className="flex items-start gap-2 p-3 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <div>
            {!hasEmail && <div>No column is mapped to <b>Email</b>. Most outreach needs this.</div>}
            {!hasName && <div>No column is mapped to a <b>name</b> field.</div>}
          </div>
        </div>
      )}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/30">
            <div className="col-span-4">Your column</div>
            <div className="col-span-4">Sample value</div>
            <div className="col-span-4">Maps to</div>
          </div>
          {headers.map((h) => (
            <div key={h} className="grid grid-cols-12 px-4 py-2.5 items-center border-b border-border last:border-0 text-sm">
              <div className="col-span-4 font-medium truncate">{h}</div>
              <div className="col-span-4 text-muted-foreground truncate font-mono text-xs">{sampleRow[h] || "—"}</div>
              <div className="col-span-4">
                <Select value={mapping[h] || "ignore"} onValueChange={(v) => onChange(h, v as DestinationField)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESTINATION_FIELDS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
