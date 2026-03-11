import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { motion } from "framer-motion";
import { Building2, Megaphone, FileText, BarChart3 } from "lucide-react";
import WorkspaceManager from "@/components/portal/WorkspaceManager";

const PortalWorkspaces = () => {
  const { companyId } = useClientCompany();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: company } = useQuery({
    queryKey: ["ws-company", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data } = await supabase.from("companies").select("*").eq("id", companyId).single();
      return data;
    },
    enabled: !!companyId,
  });

  const { data: campaigns } = useQuery({
    queryKey: ["ws-campaigns", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data } = await (supabase.from("campaigns").select("*") as any).eq("workspace_id", selectedId).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!selectedId,
  });

  const { data: allCampaigns } = useQuery({
    queryKey: ["ws-all-campaigns", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("campaigns").select("*").eq("company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const isAgency = (company as any)?.account_type === "agency";

  if (!companyId) {
    return <div className="p-8 text-center text-muted-foreground">No company linked to your account.</div>;
  }

  if (!isAgency) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <Building2 size={48} className="text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Client Workspaces</h1>
        <p className="text-muted-foreground">Workspaces are available for Agency plan accounts. Upgrade to manage multiple clients.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Client Workspaces</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage campaigns and assets for each of your clients</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <WorkspaceManager onSelectWorkspace={setSelectedId} selectedWorkspaceId={selectedId} />
      </div>

      {/* Selected workspace detail */}
      {selectedId && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone size={16} className="text-accent" />
                <span className="text-xs text-muted-foreground">Campaigns</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{campaigns?.length ?? 0}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Assets</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">—</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Performance</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">—</p>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-4">Campaigns</h3>
            {(campaigns ?? []).length > 0 ? (
              <div className="space-y-3">
                {campaigns!.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div>
                      <p className="font-medium text-foreground text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.type.replace("_", " ")} · {c.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      c.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>{c.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">No campaigns for this workspace yet. Request one from the Campaign Request page.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PortalWorkspaces;
