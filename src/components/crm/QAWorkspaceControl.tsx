import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Beaker, RotateCcw, Loader2 } from "lucide-react";

// Admin-only QA workspace tool. Guarded by RPC (has_role admin).
// Creates or resets an internal, clearly-labelled QA workspace with fake example.com data.
export default function QAWorkspaceControl() {
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(false);

  const create = async () => {
    setCreating(true);
    const { data, error } = await (supabase as any).rpc("provision_qa_workspace");
    setCreating(false);
    if (error) {
      toast.error(`QA seed failed: ${error.message}`);
      return;
    }
    toast.success("QA workspace ready — switch to 'TEST WORKSPACE — Velocity QA' in /app.");
    return data as string | undefined;
  };

  const reset = async () => {
    if (!confirm("This will reset only the internal QA test workspace. It will not affect customer workspaces.")) return;
    setResetting(true);
    const { error } = await (supabase as any).rpc("reset_qa_workspace");
    setResetting(false);
    if (error) {
      toast.error(`Reset failed: ${error.message}`);
      return;
    }
    toast.success("QA workspace reset.");
  };

  return (
    <Card className="border-amber-300 bg-amber-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Beaker className="h-4 w-4" /> Internal QA test workspace
        </CardTitle>
        <CardDescription>
          Creates or resets the labelled workspace <b>TEST WORKSPACE — Velocity QA</b> with fake
          example.com contacts, companies, a draft campaign, seeded leads and an opportunity.
          Not visible to customers. No real emails will be sent from this data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={create} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Beaker className="h-4 w-4 mr-2" />}
          Create QA test workspace
        </Button>
        <Button variant="outline" onClick={reset} disabled={resetting}>
          {resetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
          Reset QA test workspace
        </Button>
      </CardContent>
    </Card>
  );
}
