interface Props {
  clean: number;
  needs_review: number;
  risky: number;
  blocked: number;
}

export default function DataHealthPanel({ clean, needs_review, risky, blocked }: Props) {
  const total = Math.max(1, clean + needs_review + risky + blocked);
  const bars = [
    { label: "Clean", value: clean, color: "bg-emerald-500" },
    { label: "Needs review", value: needs_review, color: "bg-amber-500" },
    { label: "Risky", value: risky, color: "bg-orange-500" },
    { label: "Blocked", value: blocked, color: "bg-rose-500" },
  ];
  return (
    <div className="space-y-3">
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
        {bars.map((b) => (
          <div key={b.label} className={b.color} style={{ width: `${(b.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
            <span className="text-muted-foreground">{b.label}</span>
            <span className="font-medium ml-auto">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
