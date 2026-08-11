import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useBufferConnection } from "@/hooks/useBufferConnection";

/**
 * Compact social-publishing readiness status for dashboard surfaces. Reflects
 * the existing Buffer connection only — it never implies Velocity publishes
 * to social accounts itself. The customer always reviews content, hands it to
 * their own Buffer account, and controls scheduling/publishing there.
 */
export default function BufferReadinessCard() {
  const state = useBufferConnection();

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Share2 className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-sm">Social publishing — Buffer</span>
          {state === "connected" && <Badge>Connected</Badge>}
          {state === "reconnect_required" && <Badge variant="destructive">Reconnect required</Badge>}
          {state === "not_connected" && <Badge variant="outline">Not connected</Badge>}
        </div>
        <p className="text-xs text-muted-foreground flex-1">
          {state === "connected"
            ? "Ready — approved posts can be sent to your Buffer account as drafts, queued or scheduled. You control publishing in Buffer."
            : state === "reconnect_required"
              ? "Your Buffer connection needs reconnecting before posts can be handed over."
              : state === "not_connected"
                ? "Optional — connect your own Buffer account to hand approved social posts over for customer-controlled scheduling. Email-only workspaces can skip this."
                : "Checking Buffer connection…"}
        </p>
        {(state === "not_connected" || state === "reconnect_required") && (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to="/app/settings">{state === "reconnect_required" ? "Reconnect Buffer" : "Connect Buffer"}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
