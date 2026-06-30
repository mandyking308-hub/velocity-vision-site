import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Stat {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "warn" | "danger" | "good";
}

const toneClass = {
  default: "text-foreground",
  good: "text-emerald-600",
  warn: "text-amber-600",
  danger: "text-rose-600",
};

export default function VaultSummaryCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </div>
            <div className={`text-2xl font-bold mt-1 ${toneClass[s.tone || "default"]}`}>{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
