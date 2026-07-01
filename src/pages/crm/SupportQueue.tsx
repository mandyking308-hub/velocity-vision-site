import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["open", "triage", "in_progress", "waiting_customer", "resolved"] as const;

interface Ticket {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  email: string | null;
  workspace_id: string | null;
  route: string | null;
  category: string | null;
  severity: string | null;
  status: string;
  subject: string | null;
  message: string;
  diagnostics: Record<string, unknown>;
  browser_info: string | null;
  source: string;
  resolution_notes: string | null;
}

export default function SupportQueue() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["support_tickets", statusFilter, catFilter],
    queryFn: async () => {
      let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(200);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (catFilter !== "all") q = q.eq("category", catFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Ticket[];
    },
  });

  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId]);

  const updateTicket = async (fields: Record<string, unknown>) => {
    if (!selected) return;
    const { error } = await supabase.from("support_tickets").update(fields as never).eq("id", selected.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket updated");
    qc.invalidateQueries({ queryKey: ["support_tickets"] });
  };

  const buildFixPrompt = (t: Ticket) => {
    return [
      `# Support ticket — build handoff`,
      ``,
      `**Ref:** ${t.id}`,
      `**Category:** ${t.category ?? "unknown"}`,
      `**Severity:** ${t.severity ?? "normal"}`,
      `**Source:** ${t.source}`,
      `**Route:** ${t.route ?? "unknown"}`,
      `**Workspace:** ${t.workspace_id ?? "n/a"}`,
      `**User:** ${t.user_id ?? "anon"} (${t.email ?? "no email"})`,
      ``,
      `## Issue summary`,
      t.subject ?? "(no subject)",
      ``,
      `## Reported details`,
      t.message,
      ``,
      `## Diagnostics`,
      "```json",
      JSON.stringify(t.diagnostics, null, 2),
      "```",
      ``,
      `Browser: ${t.browser_info ?? "n/a"}`,
      ``,
      `## Expected behaviour`,
      `The above flow should work without error and respect all platform gates.`,
      ``,
      `## Actual behaviour`,
      `As reported by the customer above.`,
      ``,
      `## Safe constraints (MUST hold)`,
      `- Do NOT weaken legal acceptance gate`,
      `- Do NOT weaken sender DNS/DKIM verification`,
      `- Do NOT weaken workspace isolation`,
      `- Do NOT weaken activation gate`,
      `- Do NOT reset the QA workspace`,
      `- Do NOT send emails`,
      `- Do NOT attempt live payments`,
      `- Do NOT re-enable /portal/*`,
      ``,
      `## Requested QA`,
      `- Reproduce on the reported route with the reported workspace (if safe)`,
      `- Verify fix on QA workspace`,
      `- Compile clean, no console errors`,
    ].join("\n");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support queue</h1>
          <p className="text-sm text-muted-foreground">Customer tickets from the in-app and public support widget.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {["getting_started","data_vault","sender_verification","activation","billing_credits","campaigns","leads_pipeline","agency","legal_data","troubleshooting","other"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 space-y-2">
          {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedId(t.id); setNotes(t.resolution_notes ?? ""); }}
              className={`w-full text-left border rounded-md p-3 hover:bg-muted transition ${selected?.id === t.id ? "bg-muted border-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{t.subject ?? "(no subject)"}</div>
                <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">{t.route ?? "—"} · {t.source}</div>
              <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
            </button>
          ))}
          {!isLoading && tickets.length === 0 && <div className="text-sm text-muted-foreground">No tickets.</div>}
        </div>

        <div className="col-span-7">
          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{selected.subject ?? "(no subject)"}</span>
                  <Badge variant="outline" className="text-[10px]">{selected.severity ?? "normal"}</Badge>
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {selected.email ?? "anon"} · {selected.route ?? "—"} · ws: {selected.workspace_id ?? "—"}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium mb-1">Message</div>
                  <div className="text-sm whitespace-pre-wrap border rounded p-2 bg-muted/30">{selected.message}</div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">Diagnostics</div>
                  <pre className="text-[11px] border rounded p-2 bg-muted/30 overflow-auto max-h-[200px]">
{JSON.stringify(selected.diagnostics, null, 2)}
                  </pre>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selected.status} onValueChange={(v) => updateTicket({ status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Assign to (name/email)" defaultValue={selected.diagnostics?.assigned_to as string ?? ""} onBlur={(e) => updateTicket({ assigned_to: e.target.value || null })} />
                </div>
                <div>
                  <div className="text-xs font-medium mb-1">Resolution notes</div>
                  <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => updateTicket({ resolution_notes: notes || null })} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const prompt = buildFixPrompt(selected);
                    try { await navigator.clipboard.writeText(prompt); toast.success("Fix prompt copied"); }
                    catch { toast.error("Copy failed"); }
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy Lovable fix prompt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-sm text-muted-foreground border rounded p-6 text-center">Select a ticket.</div>
          )}
        </div>
      </div>
    </div>
  );
}
