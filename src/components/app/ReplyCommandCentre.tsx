import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Inbox } from "lucide-react";
import { REPLY_CATEGORIES, REPLY_CATEGORY_ORDER, type ReplyCategory } from "@/lib/replyTriage";
import {
  filterByIntent,
  nextActionFor,
  resolveIntent,
  sortByUrgency,
  summariseIntents,
  urgentCount,
  type IntentLead,
} from "@/lib/replyIntent";
import ReplyTriagePanel from "@/components/app/ReplyTriagePanel";

/**
 * Reply Intent Command Centre.
 * Groups the existing reply queue by deterministic intent, surfaces compliance
 * items first and suggests one clear next action per category. Every action is
 * still performed by the operator inside ReplyTriagePanel.
 */
export default function ReplyCommandCentre({
  leads,
  onChanged,
  readOnly = false,
}: {
  leads: (IntentLead & Record<string, any>)[];
  onChanged?: () => void;
  readOnly?: boolean;
}) {
  const [filter, setFilter] = useState<ReplyCategory | "all">("all");
  const counts = useMemo(() => summariseIntents(leads), [leads]);
  const urgent = urgentCount(counts);
  const visible = useMemo(() => sortByUrgency(filterByIntent(leads, filter)), [leads, filter]);

  return (
    <div className="space-y-3">
      <Card className={urgent > 0 ? "border-amber-300 bg-amber-50/40" : ""}>
        <CardContent className="p-3 text-xs space-y-1">
          <p className="flex items-center gap-2 text-foreground">
            {urgent > 0 ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <Inbox className="h-4 w-4 text-primary" />}
            <strong>
              {urgent > 0
                ? `${urgent} repl${urgent === 1 ? "y" : "ies"} need attention first`
                : "No urgent replies right now"}
            </strong>
          </p>
          <p className="text-muted-foreground">
            Unsubscribes and bounces are compliance items, never opportunities — suppress them before anything
            else. Nothing is replied to, suppressed or moved into pipeline without you pressing the button.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label="All" count={leads.length} />
        {REPLY_CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
            label={REPLY_CATEGORIES[c].label}
            count={counts[c]}
            tone={REPLY_CATEGORIES[c].tone}
          />
        ))}
      </div>

      {filter !== "all" && (
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Suggested next action:</strong> {nextActionFor(filter)}
        </p>
      )}

      {visible.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nothing in this category.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visible.map((l) =>
            readOnly ? (
              <Card key={l.id}>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{(l as any).name || (l as any).email}</span>
                    <Badge className={REPLY_CATEGORIES[resolveIntent(l)].tone}>
                      {REPLY_CATEGORIES[resolveIntent(l)].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{l.reply_snippet}</p>
                  <p className="text-xs text-muted-foreground">
                    Next: {nextActionFor(resolveIntent(l))}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ReplyTriagePanel key={l.id} lead={l as any} onChanged={onChanged ?? (() => {})} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
        active ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${tone ? tone.split(" ")[0] : "bg-muted-foreground/40"}`} />
      {label}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
