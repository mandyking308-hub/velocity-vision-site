import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Briefcase, Check } from "lucide-react";

export default function AppWorkspaces() {
  const { workspaces, currentId, setCurrentId, loading } = useWorkspace();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Client workspaces</h1>
        <p className="text-muted-foreground">Switch between client accounts. Each workspace has its own campaigns, pipeline and reporting.</p>
      </div>

      {loading ? <p className="text-muted-foreground">Loading…</p> : workspaces.length === 0 ? (
        <Card><CardContent className="p-10 text-center space-y-3">
          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="font-semibold">No client workspaces yet</p>
          <p className="text-sm text-muted-foreground">Add your first client to start running campaigns on their behalf.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {workspaces.map((w) => (
            <Card key={w.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{w.name}</CardTitle>
                {w.id === currentId && <Badge><Check className="h-3 w-3 mr-1" />Active</Badge>}
              </CardHeader>
              <CardContent>
                <Button variant={w.id === currentId ? "outline" : "default"} size="sm" onClick={() => setCurrentId(w.id)} disabled={w.id === currentId}>
                  {w.id === currentId ? "Current" : "Switch to this workspace"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
