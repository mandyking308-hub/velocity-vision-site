import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import LeadActionPanel, { type ActionLead } from "@/components/app/LeadActionPanel";
import { deriveFollowUpState, STATE_LABEL, STATE_TONE, type FollowUpState } from "@/lib/leadStates";
import { LayoutGrid, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

const PIPE_STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Stage = typeof PIPE_STAGES[number];

export default function AppLeads() {
  const { currentId } = useWorkspace();
  const [leads, setLeads] = useState<ActionLead[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [view, setView] = useState<"actions" | "board">("actions");
  const [q, setQ] = useState("");

  const load = async () => {
    const leadsQ = supabase.from("leads").select("id, name, email, phone, status, follow_up_at, follow_up_state, replied_at, snoozed_until, last_email_sent_at, last_email_subject, last_contacted_at, last_interaction_at, opportunity_id, owner_id, campaign_id, company_id, contact_id, last_action, created_at").order("created_at", { ascending: false });
    const campsQ = supabase.from("campaigns").select("id, name");
    const [{ data: l }, { data: c }] = await Promise.all([
      currentId ? leadsQ.eq("workspace_id", currentId) : leadsQ,
      currentId ? campsQ.eq("workspace_id", currentId) : campsQ,
    ]);
    setLeads((l || []) as any);
    setCampaigns(Object.fromEntries((c || []).map((x: any) => [x.id, x.name])));
  };
  useEffect(() => { load(); }, [currentId]);

  const filtered = useMemo(
    () => leads.filter((l) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return (l.name || "").toLowerCase().includes(s) || (l.email || "").toLowerCase().includes(s);
    }),
    [leads, q]
  );

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Every record. Take action, move to pipeline, mark replied.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild><Link to="/app/follow-up"><ListChecks className="h-4 w-4 mr-1" /> Follow-up queue</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to="/app/pipeline"><LayoutGrid className="h-4 w-4 mr-1" /> Pipeline</Link></Button>
          <div className="border rounded-md flex">
            <Button size="sm" variant={view === "actions" ? "default" : "ghost"} onClick={() => setView("actions")}>Actions</Button>
            <Button size="sm" variant={view === "board" ? "default" : "ghost"} onClick={() => setView("board")}>Board</Button>
          </div>
        </div>
      </div>

      <Input placeholder="Search leads…" value={q} onChange={(e) => setQ(e.target.value)} />

      {view === "actions" ? (
        filtered.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No leads yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((l) => (
              <LeadActionPanel key={l.id} lead={l} onChanged={load} campaignName={l.campaign_id ? campaigns[l.campaign_id] : null} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PIPE_STAGES.map((stage) => {
            const items = filtered.filter((l) => (l.status || "new") === stage);
            return (
              <div key={stage} className="bg-muted/40 rounded-md p-3 min-h-[260px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize text-sm">{stage}</h3>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((l) => {
                    const st = deriveFollowUpState(l);
                    return (
                      <Card key={l.id}>
                        <CardContent className="p-3 space-y-1">
                          <div className="font-medium text-sm truncate">{l.name || l.email || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground truncate">{l.campaign_id ? campaigns[l.campaign_id] || "—" : "Direct"}</div>
                          <Badge className={`${STATE_TONE[st]} text-[10px]`}>{STATE_LABEL[st]}</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
