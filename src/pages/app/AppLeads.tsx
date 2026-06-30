import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Stage = typeof STAGES[number];

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  status: Stage;
  created_at: string;
  campaign_id: string | null;
  last_action: string | null;
  follow_up_at: string | null;
  last_email_sent_at: string | null;
  last_email_subject: string | null;
}

export default function AppLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: l }, { data: c }] = await Promise.all([
      supabase.from("leads").select("id, name, email, status, created_at, campaign_id, last_action, follow_up_at, last_email_sent_at, last_email_subject").order("created_at", { ascending: false }),
      supabase.from("campaigns").select("id, name"),
    ]);
    setLeads((l || []) as any);
    setCampaigns(Object.fromEntries((c || []).map((x: any) => [x.id, x.name])));
  };

  useEffect(() => { load(); }, []);

  const move = async (id: string, stage: Stage) => {
    await supabase.from("leads").update({ status: stage as any, last_action: `Moved to ${stage}` }).eq("id", id);
    toast.success(`Moved to ${stage}`);
    load();
  };

  return (
    <div className="space-y-4 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Pipeline</h1>
        <p className="text-muted-foreground">Every lead, scoped to the campaign that produced them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STAGES.map((stage) => {
          const items = leads.filter((l) => (l.status || "new") === stage);
          return (
            <div key={stage} className="bg-muted/40 rounded-md p-3 min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold capitalize text-sm">{stage}</h3>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((l) => (
                  <Card key={l.id}>
                    <CardContent className="p-3 space-y-2">
                      <div className="font-medium text-sm">{l.name || l.email || "Anonymous"}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.campaign_id ? campaigns[l.campaign_id] || "—" : "Direct"}
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</div>
                      {l.last_action && <div className="text-xs">{l.last_action}</div>}
                      {l.last_email_sent_at && (
                        <div className="text-xs text-muted-foreground">📧 {l.last_email_subject || "Sent"} · {new Date(l.last_email_sent_at).toLocaleDateString()}</div>
                      )}
                      {l.follow_up_at && <div className="text-xs text-primary">Follow-up: {new Date(l.follow_up_at).toLocaleDateString()}</div>}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {STAGES.filter((s) => s !== stage).map((s) => (
                          <Button key={s} variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => move(l.id, s)}>
                            → {s}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
