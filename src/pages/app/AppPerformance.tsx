import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function AppPerformance() {
  const { currentId } = useWorkspace();
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const campsQ = supabase.from("campaigns").select("id, name, status, created_at").order("created_at", { ascending: false });
      const leadsQ = supabase.from("leads").select("campaign_id, status");
      const { data: campaigns } = await (currentId ? campsQ.eq("workspace_id", currentId) : campsQ);
      const { data: leads } = await (currentId ? leadsQ.eq("workspace_id", currentId) : leadsQ);
      const grouped = (campaigns || []).map((c: any) => {
        const cl = (leads || []).filter((l: any) => l.campaign_id === c.id);
        const won = cl.filter((l: any) => l.status === "won" || l.status === "closed_won").length;
        return { ...c, leads: cl.length, won, winRate: cl.length ? Math.round((won / cl.length) * 100) : 0 };
      });
      setRows(grouped);
    })();
  }, [currentId]);

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalWon = rows.reduce((s, r) => s + r.won, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Performance</h1>
        <p className="text-muted-foreground">Stored campaign and lead outcomes only. No automated attribution, benchmarking or A/B testing.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Campaigns" value={rows.length} />
        <Stat label="Recorded leads" value={totalLeads} />
        <Stat label="Recorded won" value={totalWon} />
        <Stat label="Recorded lead-to-won rate" value={totalLeads ? `${Math.round((totalWon / totalLeads) * 100)}%` : "—"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Per-campaign recorded outcomes</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaign records yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <Link key={r.id} to={`/app/campaigns/${r.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-border rounded-md hover:bg-muted transition">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">Created {new Date(r.created_at).toLocaleDateString()} · {r.status || "recorded"}</div>
                    </div>
                    <div className="flex gap-4 text-sm items-center">
                      <span>Leads: <strong>{r.leads}</strong></span>
                      <span>Won: <strong>{r.won}</strong></span>
                      <Badge variant="outline">{r.leads ? `${r.winRate}% recorded` : "No lead data"}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How to read this page</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Counts reflect records stored in your workspace. Missing events remain zero rather than being estimated.</p>
          <p>Velocity Vision does not infer a “winning channel”, attribute revenue automatically or run A/B experiments. Use the underlying campaign, reply and pipeline records when deciding your next action.</p>
          <p>Social posts handed to your own Buffer account are scheduled and published there. Velocity does not receive social performance metrics, so none are shown on this page — check your Buffer account for post analytics.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
