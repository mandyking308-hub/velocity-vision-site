import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const STATUSES = ["new", "reviewed", "actioned", "archived"] as const;
const TYPES = [
  "confusing",
  "missing_feature",
  "bug",
  "loved",
  "pricing_billing",
  "other",
] as const;

interface FeedbackRow {
  id: string;
  created_at: string;
  user_id: string | null;
  workspace_id: string | null;
  email: string | null;
  rating: number | null;
  feedback_type: string;
  message: string;
  route: string | null;
  source: string;
  plan: string | null;
  browser_info: string | null;
  metadata: Record<string, unknown>;
  contact_permission: boolean;
  status: string;
}

export default function FeedbackQueue() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: rows = [], isLoading, refetch } = useQuery({
    queryKey: ["customer_feedback", statusFilter, typeFilter],
    queryFn: async () => {
      let q = supabase
        .from("customer_feedback" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = (q as any).eq("status", statusFilter);
      if (typeFilter !== "all") q = (q as any).eq("feedback_type", typeFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as FeedbackRow[];
    },
  });

  const summary = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    return byStatus;
  }, [rows]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("customer_feedback" as never)
      .update({ status } as never)
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["customer_feedback"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer feedback</h1>
          <p className="text-sm text-muted-foreground">
            Not support tickets — this is where users share what's confusing, missing, valuable or rough.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">
          {Object.entries(summary).map(([k, v]) => `${k}: ${v}`).join(" · ") || "no rows"}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No feedback in this view.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{r.feedback_type}</Badge>
                    {r.rating != null && <Badge variant="outline">{r.rating}/5</Badge>}
                    <Badge variant="outline">{r.source}</Badge>
                    <Badge>{r.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <CardTitle className="text-sm font-medium mt-2 whitespace-pre-wrap">
                  {r.message}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Route:</span> {r.route ?? "—"}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {r.email ?? "—"} {r.contact_permission && <Badge variant="outline" className="ml-1">contact ok</Badge>}
                </div>
                <div>
                  <span className="font-medium">User / workspace:</span> {r.user_id ?? "anon"} · {r.workspace_id ?? "—"}
                </div>
                <div className="pt-2 flex gap-2 flex-wrap">
                  {STATUSES.filter((s) => s !== r.status).map((s) => (
                    <Button key={s} size="sm" variant="outline" onClick={() => updateStatus(r.id, s)}>
                      Mark {s}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
