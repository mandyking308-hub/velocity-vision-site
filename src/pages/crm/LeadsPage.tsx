import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const stages: { key: LeadStatus; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "demo_scheduled", label: "Demo Booked", color: "bg-purple-500" },
  { key: "proposal_sent", label: "Proposal", color: "bg-accent" },
  { key: "closed_won", label: "Won", color: "bg-green-500" },
  { key: "closed_lost", label: "Lost", color: "bg-red-500" },
];

const LeadsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ source: "manual", marketing_interest: "", company_id: "", contact_id: "" });

  const { data: leads = [] } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*, contacts(first_name, last_name), companies(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").order("name");
      return data ?? [];
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["crm-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("id, first_name, last_name").order("first_name");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").insert({
        source: form.source,
        marketing_interest: form.marketing_interest || null,
        company_id: form.company_id || null,
        contact_id: form.contact_id || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead created");
      setOpen(false);
      setForm({ source: "manual", marketing_interest: "", company_id: "", contact_id: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-leads"] }),
    onError: (e) => toast.error(e.message),
  });

  const convertToClient = useMutation({
    mutationFn: async (lead: any) => {
      // Update company status to active_client
      if (lead.company_id) {
        await supabase.from("companies").update({ status: "active_client" as const }).eq("id", lead.company_id);
      }
      // Mark lead as won
      await supabase.from("leads").update({ status: "closed_won" as const }).eq("id", lead.id);
      // Create onboarding tasks
      if (lead.company_id) {
        const tasks = ["Account manager assignment", "Campaign planning", "Creative preparation", "Audience research", "Brand review"];
        for (const title of tasks) {
          await supabase.from("tasks").insert({
            title: `${title} — ${(lead.companies as any)?.name || "New client"}`,
            entity_type: "onboarding", entity_id: lead.company_id, created_by: user?.id,
          });
        }
        // Create subscription placeholder
        await supabase.from("subscriptions" as any).insert({
          company_id: lead.company_id, plan_name: "starter", monthly_price: 0, created_by: user?.id,
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
      toast.success("Lead converted to client! Onboarding tasks created.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lead Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">{leads.length} total leads</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="cta"><Plus size={16} /> Add Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Lead</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="website_contact">Website Contact</SelectItem>
                  <SelectItem value="demo_booking">Demo Booking</SelectItem>
                  <SelectItem value="inbound">Inbound Enquiry</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Marketing interest" value={form.marketing_interest} onChange={(e) => setForm({ ...form, marketing_interest: e.target.value })} />
              <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.contact_id} onValueChange={(v) => setForm({ ...form, contact_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="cta" className="w-full" disabled={createMutation.isPending}>Create Lead</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          return (
            <div key={stage.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", stage.color)} />
                <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">{stageLeads.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="bg-card border border-border/50 rounded-lg p-3 shadow-card text-xs space-y-2">
                    <p className="font-medium text-foreground">
                      {(lead.contacts as any)?.first_name
                        ? `${(lead.contacts as any).first_name} ${(lead.contacts as any).last_name}`
                        : "Unknown contact"}
                    </p>
                    <p className="text-muted-foreground">{(lead.companies as any)?.name || "No company"}</p>
                    <p className="text-muted-foreground">Source: {lead.source.replace("_", " ")}</p>
                    {/* Stage move buttons */}
                    <div className="flex gap-1 pt-1">
                      {stages
                        .filter((s) => s.key !== lead.status)
                        .slice(0, 3)
                        .map((s) => (
                          <button
                            key={s.key}
                            onClick={() => updateStatus.mutate({ id: lead.id, status: s.key })}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            → {s.label}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsPage;
