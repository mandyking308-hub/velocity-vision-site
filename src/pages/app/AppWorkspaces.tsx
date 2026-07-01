import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Check, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AppWorkspaces() {
  const { workspaces, currentId, setCurrentId, loading } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const openWorkspace = (id: string) => {
    setCurrentId(id);
    toast.success("Workspace opened");
    navigate("/app");
  };

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("provision_first_workspace", {
        _name: name.trim(),
        _industry: industry.trim() || null,
        _website: website.trim() || null,
        _country: null,
      });
      if (error) throw error;
      const ws: any = Array.isArray(data) ? data[0] : data;
      if (ws?.id) {
        setCurrentId(ws.id);
        toast.success("Workspace created");
        setOpen(false);
        setName(""); setIndustry(""); setWebsite("");
        // Refresh so the new workspace shows up in the switcher.
        setTimeout(() => window.location.reload(), 300);
      } else {
        toast.error("Workspace was not returned");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not create workspace");
    } finally {
      setBusy(false);
    }
  };

  const CreateDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create your workspace</DialogTitle>
          <DialogDescription>
            One workspace keeps contacts, campaigns, assets, replies, billing and pipeline
            organised. Create one for your business, or one per client if you run agency work.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="ws-name">Workspace name *</Label>
            <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Ltd" />
          </div>
          <div>
            <Label htmlFor="ws-industry">Industry (optional)</Label>
            <Input id="ws-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. B2B SaaS" />
          </div>
          <div>
            <Label htmlFor="ws-web">Website (optional)</Label>
            <Input id="ws-web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={create} disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Client workspaces</h1>
          <p className="text-muted-foreground">
            Open a workspace to manage its contacts, campaigns, replies, billing and early pipeline.
          </p>
        </div>
        {workspaces.length > 0 && CreateDialog}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : workspaces.length === 0 ? (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create your first workspace</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                Your workspace keeps contacts, campaigns, assets, replies, billing and pipeline
                organised. Create one workspace for your business, or one per client if you run
                agency work.
              </p>
            </div>
            {CreateDialog}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workspaces.map((w) => (
            <Card
              key={w.id}
              data-testid={`workspace-card-${w.id}`}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => openWorkspace(w.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> {w.name}
                </CardTitle>
                {w.id === currentId && <Badge><Check className="h-3 w-3 mr-1" />Active</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Click to open this workspace</p>
                <Button
                  variant={w.id === currentId ? "outline" : "default"}
                  size="sm"
                  data-testid={`workspace-open-${w.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openWorkspace(w.id);
                  }}
                >
                  Open workspace
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
