import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  totals: { valid: number; needs_review: number; risky: number; blocked: number; duplicates: number };
  include: Record<"valid" | "needs_review" | "risky" | "blocked", boolean>;
  skipDuplicates: boolean;
  onToggle: (k: "valid" | "needs_review" | "risky" | "blocked", v: boolean) => void;
  onSkipDuplicates: (v: boolean) => void;
}

export default function ConfirmStep({ totals, include, skipDuplicates, onToggle, onSkipDuplicates }: Props) {
  const willImport =
    (include.valid ? totals.valid : 0) +
    (include.needs_review ? totals.needs_review : 0) +
    (include.risky ? totals.risky : 0) +
    (include.blocked ? totals.blocked : 0) -
    (skipDuplicates ? totals.duplicates : 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="font-medium">Choose what to import</div>
          <Row label="Valid" hint="Clean records, ready to use" count={totals.valid} checked={include.valid} onChange={(v) => onToggle("valid", v)} />
          <Row label="Needs review" hint="Likely usable, but missing or odd fields" count={totals.needs_review} checked={include.needs_review} onChange={(v) => onToggle("needs_review", v)} />
          <Row label="Risky" hint="Role addresses, free-mail with no company" count={totals.risky} checked={include.risky} onChange={(v) => onToggle("risky", v)} />
          <Row label="Blocked" hint="Empty or malformed rows — usually skip" count={totals.blocked} checked={include.blocked} onChange={(v) => onToggle("blocked", v)} />
          <div className="border-t pt-3 flex items-center gap-2">
            <Checkbox id="skip-dupes" checked={skipDuplicates} onCheckedChange={(v) => onSkipDuplicates(!!v)} />
            <label htmlFor="skip-dupes" className="text-sm">Skip {totals.duplicates} duplicate{totals.duplicates === 1 ? "" : "s"} (you can merge them later)</label>
          </div>
        </CardContent>
      </Card>
      <div className="text-sm text-muted-foreground">
        Will import <span className="text-foreground font-medium">{Math.max(0, willImport)}</span> records into your active contacts.
      </div>
    </div>
  );
}

function Row({ label, hint, count, checked, onChange }: { label: string; hint: string; count: number; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <div className="flex-1">
        <div className="text-sm font-medium">{label} <span className="text-muted-foreground font-normal">({count})</span></div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </div>
  );
}
