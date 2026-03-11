import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Stage = Database["public"]["Enums"]["opportunity_stage"];

const stageLabels: Record<Stage, string> = {
  discovery: "Discovery", demo: "Demo", proposal: "Proposal",
  negotiation: "Negotiation", won: "Won", lost: "Lost",
};

const stageColors: Record<Stage, string> = {
  discovery: "bg-blue-500/10 text-blue-600", demo: "bg-purple-500/10 text-purple-600",
  proposal: "bg-accent/10 text-accent", negotiation: "bg-yellow-500/10 text-yellow-700",
  won: "bg-green-500/10 text-green-600", lost: "bg-red-500/10 text-red-600",
};

const OpportunitiesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ service: "", estimated_value: "", probability: "50", expected_close_date: "", stage: "discovery" as Stage, company_id: "", contact_id: "" });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["crm-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities").select("*, contacts(first_name, last_name), companies(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => { const { data } = await supabase.from("companies").select("id, name").order("name"); return data ?? []; },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["crm-contacts"],
    queryFn: async () => { const { data } = await supabase.from("contacts").select("id, first_name, last_name").order("first_name"); return data ?? []; },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("opportunities").insert({
        service: form.service, estimated_value: Number(form.estimated_value) || 0,
        probability: Number(form.probability), expected_close_date: form.expected_close_date || null,
        stage: form.stage, company_id: form.company_id || null, contact_id: form.contact_id || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-opportunities"] });
      toast.success("Opportunity created");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = opportunities.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.service?.toLowerCase().includes(s) || (o.companies as any)?.name?.toLowerCase().includes(s);
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Opportunities</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pipeline: £{(filtered.filter((o) => !["won", "lost"].includes(o.stage)).reduce((s, o) => s + Number(o.estimated_value || 0), 0) / 1000).toFixed(0)}k
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta"><Plus size={16} /> Add Opportunity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Opportunity</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <Input placeholder="Service interested in" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Est. value (£)" type="number" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} />
                <Input placeholder="Probability %" type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
              </div>
              <Input type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} />
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as Stage })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(stageLabels) as Stage[]).map((s) => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.contact_id} onValueChange={(v) => setForm({ ...form, contact_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>{contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" variant="cta" className="w-full" disabled={createMutation.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Service</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Value</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Probability</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Stage</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Close Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No opportunities found</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border/30 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{o.service || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(o.companies as any)?.name || "—"}</td>
                    <td className="px-4 py-3 text-foreground font-medium">£{Number(o.estimated_value || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.probability}%</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", stageColors[o.stage])}>{stageLabels[o.stage]}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.expected_close_date || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
