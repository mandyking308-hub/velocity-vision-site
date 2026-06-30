import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Plus, ArrowRight, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import LegalAcceptanceCheckbox from "@/components/LegalAcceptanceCheckbox";
import { recordLegalAcceptance } from "@/lib/recordLegalAcceptance";

interface WorkspaceManagerProps {
  onSelectWorkspace?: (workspaceId: string) => void;
  selectedWorkspaceId?: string | null;
}

const WorkspaceManager = ({ onSelectWorkspace, selectedWorkspaceId }: WorkspaceManagerProps) => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", industry: "", website: "", contact_name: "", contact_email: "" });
  const [legalAccepted, setLegalAccepted] = useState(false);

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["client-workspaces", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from("client_workspaces")
        .select("*")
        .eq("agency_company_id", companyId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const createWorkspace = useMutation({
    mutationFn: async () => {
      if (!companyId || !form.name.trim()) throw new Error("Name required");
      if (!legalAccepted) throw new Error("You must accept the legal terms before creating a workspace.");
      const { data, error } = await supabase.from("client_workspaces").insert({
        agency_company_id: companyId,
        name: form.name,
        industry: form.industry || null,
        website: form.website || null,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
      }).select("id").single();
      if (error) throw error;
      if (user && data?.id) {
        await recordLegalAcceptance({
          userId: user.id,
          email: user.email ?? null,
          source: "workspace_create",
          workspaceId: data.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-workspaces"] });
      toast.success("Client workspace created!");
      setForm({ name: "", industry: "", website: "", contact_name: "", contact_email: "" });
      setLegalAccepted(false);
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-muted-foreground text-sm p-4">Loading workspaces...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Briefcase size={18} className="text-accent" /> Client Workspaces
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus size={14} /> Add Client
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
          <Input placeholder="Client company name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            <Input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            <Input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <LegalAcceptanceCheckbox checked={legalAccepted} onCheckedChange={setLegalAccepted} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              variant="cta"
              size="sm"
              onClick={() => createWorkspace.mutate()}
              disabled={createWorkspace.isPending || !legalAccepted}
            >Create Workspace</Button>
          </div>
        </motion.div>
      )}

      {(workspaces ?? []).length === 0 && !showForm && (
        <p className="text-muted-foreground text-sm text-center py-6">No client workspaces yet. Create your first one to start managing campaigns.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(workspaces ?? []).map((ws) => (
          <button
            key={ws.id}
            onClick={() => onSelectWorkspace?.(ws.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              selectedWorkspaceId === ws.id
                ? "border-accent bg-accent/5 shadow-sm"
                : "border-border/50 hover:border-accent/30 bg-card"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{ws.name}</p>
              {ws.industry && <p className="text-xs text-muted-foreground">{ws.industry}</p>}
              {ws.contact_email && <p className="text-xs text-muted-foreground truncate">{ws.contact_email}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceManager;
