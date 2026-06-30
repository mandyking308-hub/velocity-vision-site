import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row { id: string; name: string; status: string; goal: string | null; campaign_kind: string | null; created_at: string }

export default function AppCampaigns() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, status, goal, campaign_kind, created_at")
        .order("created_at", { ascending: false });
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My campaigns</h1>
          <p className="text-muted-foreground">All active and draft campaigns in this workspace.</p>
        </div>
        <Button onClick={() => navigate("/app/campaigns/new")}>
          <Rocket className="h-4 w-4 mr-2" /> Start a campaign
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-10 text-center space-y-3">
          <Rocket className="h-10 w-10 mx-auto text-muted-foreground" />
          <div className="font-semibold">No campaigns yet</div>
          <p className="text-sm text-muted-foreground">Launch your first campaign in under 10 minutes.</p>
          <Button onClick={() => navigate("/app/campaigns/new")}>Start your first campaign</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link key={r.id} to={`/app/campaigns/${r.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.campaign_kind?.replace("_", " ") || "campaign"} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.goal && <Badge variant="outline">{r.goal}</Badge>}
                    <Badge>{r.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
