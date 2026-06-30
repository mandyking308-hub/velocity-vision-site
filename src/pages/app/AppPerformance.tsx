import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function AppPerformance() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: campaigns } = await supabase.from("campaigns").select("id, name, status, created_at").order("created_at", { ascending: false });
      const { data: leads } = await supabase.from("leads").select("campaign_id, status");
      const grouped = (campaigns || []).map((c: any) => {
        const cl = (leads || []).filter((l: any) => l.campaign_id === c.id);
        return {
          ...c,
          leads: cl.length,
          won: cl.filter((l: any) => l.status === "won").length,
          conv: cl.length ? Math.round((cl.filter((l: any) => l.status === "won").length / cl.length) * 100) : 0,
        };
      });
      setRows(grouped);
    })();
  }, []);

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalWon = rows.reduce((s, r) => s + r.won, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Performance</h1>
        <p className="text-muted-foreground">A monthly snapshot across every campaign.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Campaigns" value={rows.length} />
        <Stat label="Total leads" value={totalLeads} />
        <Stat label="Total won" value={totalWon} />
        <Stat label="Avg conversion" value={totalLeads ? `${Math.round((totalWon / totalLeads) * 100)}%` : "—"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Per-campaign breakdown</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No campaigns yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <Link key={r.id} to={`/app/campaigns/${r.id}`}>
                  <div className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted transition">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-4 text-sm items-center">
                      <span>Leads: <strong>{r.leads}</strong></span>
                      <span>Won: <strong>{r.won}</strong></span>
                      <Badge variant={r.conv > 10 ? "default" : "outline"}>{r.conv}%</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Next-step prompts</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Clone your top-converting campaign for a new audience.</p>
          <p>• Re-run the social pack from your highest-engagement launch.</p>
          <p>• Move qualified leads through the pipeline this week.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}
