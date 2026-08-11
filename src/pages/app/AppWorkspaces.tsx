import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCredits } from "@/contexts/CreditsContext";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Check, Plus, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import LegalComplianceGate from "@/components/LegalComplianceGate";
import { useLegalStatus } from "@/lib/legalCompliance";

export default function AppWorkspaces() {
  const { workspaces, currentId, setCurrentId, loading } = useWorkspace();
  const { plan, planConfig, entitled, entitlementEnded } = useCredits();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const legal = useLegalStatus();
  const [legalGateOpen, setLegalGateOpen] = useState(false);

  const isAgencyPlan = plan === "agency";
  const isAgency = isAgencyPlan && entitled;
  const limit = entitled ? planConfig.workspaceLimit : 0;
  const atLimit = limit !== null && workspaces.length >= limit;
  const canCreate = entitled && !atLimit;

  const heading = isAgency ? "Client workspaces" : "My workspace";
  const subCopy = entitlementEnded
    ? "Your existing workspace data remains accessible. Renew or choose a current plan before creating new workspaces or using paid actions."
    : isAgency
      ? "Keep each client's contacts, campaigns, replies and pipeline isolated while plan billing and pooled Campaign Credits remain account-level."
      : "Open your workspace to manage contacts, campaigns, replies and early pipeline. Plan billing remains account-level.";
  const creditNote = isAgency
    ? "Agency Campaign Credits are pooled across client workspaces."
    : entitlementEnded
      ? "Paid workspace creation is paused until renewal."
      : "Campaign Credits apply to this account's workspace.";

  const openWorkspace = (id: string) => {
    setCurrentId(id);
    toast.success("Workspace opened");
    navigate("/app");
  };

  const doCreate = async () => {
    if (!entitled) {
      toast.error("Plan access has ended", { description: "Renew or choose an eligible plan before creating a workspace." });
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("provision_first_workspace", {
        _name: name.trim(), _industry: industry.trim() || null, _website: website.trim() || null, _country: null,
      });
      if (error) throw error;
      const ws: any = Array.isArray(data) ? data[0] : data;
      if (ws?.id) {
        setCurrentId(ws.id);
        toast.success("Workspace created");
        setOpen(false);
        setName(""); setIndustry(""); setWebsite("");
        setTimeout(() => window.location.reload(), 300);
      } else toast.error("Workspace was not returned");
    } catch (e: any) {
      toast.error(e?.message || "Could not create workspace");
    } finally { setBusy(false); }
  };

  const create = async () => {
    if (!name.trim()) return;
    if (!canCreate) {
      toast.error(entitlementEnded ? "Renew your plan before creating a workspace." : "Your plan allows only 1 workspace. Upgrade to Agency for multiple client workspaces.");
      return;
    }
    if (!legal.isCompliant) { setLegalGateOpen(true); return; }
    await doCreate();
  };

  const CreateDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button disabled={!canCreate}><Plus className="h-4 w-4 mr-2" /> Create workspace</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isAgency ? "Create a client workspace" : "Create your workspace"}</DialogTitle>
          <DialogDescription>{isAgency ? "Each client workspace keeps its contacts, campaigns, assets, replies and pipeline separate. Plan billing and pooled Campaign Credits remain account-level." : "Your workspace keeps contacts, campaigns, assets, replies and pipeline organized. Billing remains account-level."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label htmlFor="ws-name">Workspace name *</Label><Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={isAgency ? "e.g. Acme Ltd (client)" : "e.g. Acme Ltd"} /></div>
          <div><Label htmlFor="ws-industry">Industry (optional)</Label><Input id="ws-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. B2B SaaS" /></div>
          <div><Label htmlFor="ws-web">Website (optional)</Label><Input id="ws-web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button><Button onClick={create} disabled={busy || !name.trim() || !canCreate}>{busy ? "Creating…" : "Create workspace"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const showCreate = canCreate && (isAgency || workspaces.length === 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="text-3xl font-bold">{heading}</h1><p className="text-muted-foreground">{subCopy}</p></div>
        {workspaces.length > 0 && showCreate && CreateDialog}
      </div>

      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span><strong className="text-foreground">{planConfig.name} plan.</strong> {creditNote}{entitlementEnded && <> · <a href="/app/billing" className="text-primary underline underline-offset-2">Renew or change plan</a>.</>}{atLimit && entitled && !isAgency && <> · Need separate client workspaces? <a href="/app/billing" className="text-primary underline underline-offset-2">Upgrade to Agency</a>.</>}</span>
        </CardContent>
      </Card>

      {loading ? <p className="text-muted-foreground">Loading…</p> : workspaces.length === 0 ? (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5"><CardContent className="p-10 text-center space-y-4"><div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto"><Sparkles className="h-7 w-7 text-primary" /></div><div><h2 className="text-xl font-semibold">{entitlementEnded ? "Renew before creating a workspace" : "Create your first workspace"}</h2><p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">{entitlementEnded ? "Your previous data remains yours. A current plan is required for new workspace creation." : "Keep contacts, campaigns, assets, replies and pipeline organized in one customer-controlled workspace."}</p></div>{entitlementEnded ? <Button onClick={() => navigate("/app/billing")}>Open billing</Button> : CreateDialog}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workspaces.map((w) => (
            <Card key={w.id} data-testid={`workspace-card-${w.id}`} className="cursor-pointer transition-colors hover:border-primary/50" onClick={() => openWorkspace(w.id)}>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {w.name}</CardTitle>{w.id === currentId && <Badge><Check className="h-3 w-3 mr-1" />Active</Badge>}</CardHeader>
              <CardContent className="space-y-3"><p className="text-sm text-muted-foreground">{isAgency ? "Client workspace" : "Your workspace"} · click to open</p><Button variant={w.id === currentId ? "outline" : "default"} className="w-full" onClick={(e) => { e.stopPropagation(); openWorkspace(w.id); }}>Open workspace</Button></CardContent>
            </Card>
          ))}
        </div>
      )}
      <LegalComplianceGate open={legalGateOpen} onOpenChange={setLegalGateOpen} source="workspace_create" title="Accept current terms before creating a workspace" description="Creating a workspace requires up-to-date acceptance of our platform legal stack." confirmLabel="Accept and create" onConfirm={async () => { await legal.refresh(); await doCreate(); }} />
    </div>
  );
}
