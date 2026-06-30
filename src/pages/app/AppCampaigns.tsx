import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Rocket, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CADENCE_LABELS, CadenceType, LIFECYCLE_TONE, deriveLifecycle, nextActionLabel,
} from "@/lib/cadence";

interface Row {
  id: string; name: string; status: string; goal: string | null; campaign_kind: string | null;
  created_at: string;
  cadence_type: CadenceType | null;
  start_at: string | null;
  cadence_end_at: string | null;
  next_run_at: string | null;
  timezone: string | null;
  last_run_at: string | null;
  runs_completed: number | null;
}

export default function AppCampaigns() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [cadenceFilter, setCadenceFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, status, goal, campaign_kind, created_at, cadence_type, start_at, cadence_end_at, next_run_at, timezone, last_run_at, runs_completed")
        .order("created_at", { ascending: false });
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const dayMs = 86_400_000;
    return rows.filter((r) => {
      const lc = deriveLifecycle(r.status, {
        cadence_type: r.cadence_type || "one_off",
        start_at: r.start_at,
        cadence_end_at: r.cadence_end_at,
      }, r.runs_completed || 0);
      if (cadenceFilter !== "all" && (r.cadence_type || "one_off") !== cadenceFilter) return false;
      if (stateFilter === "expiring_soon") {
        if (!r.cadence_end_at) return false;
        const days = (new Date(r.cadence_end_at).getTime() - now) / dayMs;
        return days >= 0 && days <= 14;
      }
      if (stateFilter !== "all" && lc !== stateFilter) return false;
      return true;
    });
  }, [rows, cadenceFilter, stateFilter]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">My campaigns</h1>
          <p className="text-muted-foreground">Cadence, lifecycle and next scheduled action — at a glance.</p>
        </div>
        <Button onClick={() => navigate("/app/campaigns/new")}>
          <Rocket className="h-4 w-4 mr-2" /> Start a campaign
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Select value={cadenceFilter} onValueChange={setCadenceFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Cadence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cadences</SelectItem>
              <SelectItem value="one_off">One-off</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Lifecycle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring_soon">Expiring soon (14d)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center space-y-3">
          <Rocket className="h-10 w-10 mx-auto text-muted-foreground" />
          <div className="font-semibold">{rows.length === 0 ? "No campaigns yet" : "No campaigns match these filters"}</div>
          <p className="text-sm text-muted-foreground">{rows.length === 0 ? "Launch your first campaign in under 10 minutes." : "Try clearing the filters above."}</p>
          {rows.length === 0 && <Button onClick={() => navigate("/app/campaigns/new")}>Start your first campaign</Button>}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const lc = deriveLifecycle(r.status, {
              cadence_type: r.cadence_type || "one_off",
              start_at: r.start_at,
              cadence_end_at: r.cadence_end_at,
            }, r.runs_completed || 0);
            const tone = LIFECYCLE_TONE[lc];
            const cadenceLabel = CADENCE_LABELS[(r.cadence_type || "one_off") as CadenceType];
            return (
              <Link key={r.id} to={`/app/campaigns/${r.id}`}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{r.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Repeat className="h-3 w-3" />{cadenceLabel}</span>
                          {r.campaign_kind && <span>· {r.campaign_kind.replace("_", " ")}</span>}
                          {r.start_at && <span className="inline-flex items-center gap-1">· <Calendar className="h-3 w-3" /> {new Date(r.start_at).toLocaleDateString()}</span>}
                          {r.cadence_end_at && <span>· ends {new Date(r.cadence_end_at).toLocaleDateString()}</span>}
                          {(r.runs_completed ?? 0) > 0 && <span>· {r.runs_completed} run{(r.runs_completed || 0) > 1 ? "s" : ""} done</span>}
                        </div>
                        <div className="text-xs mt-1 inline-flex items-center gap-1 text-primary">
                          <Clock className="h-3 w-3" /> {nextActionLabel({
                            next_run_at: r.next_run_at, start_at: r.start_at,
                            cadence_type: (r.cadence_type || "one_off") as CadenceType,
                            cadence_end_at: r.cadence_end_at, timezone: r.timezone || "UTC",
                          } as any)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.goal && <Badge variant="outline">{r.goal}</Badge>}
                        <Badge className={tone.cls}>{tone.label}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
