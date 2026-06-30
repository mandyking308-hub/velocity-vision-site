import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { SENDER_HEALTH_LABEL, SENDER_HEALTH_TONE, type SenderHealth, type SenderState } from "@/lib/sendSafety";

export default function SenderStatusCard({
  state,
  health,
  scheduledToday,
  fromEmail,
}: {
  state: SenderState;
  health: SenderHealth;
  scheduledToday: number;
  fromEmail?: string | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" /> Sender status
          <Badge className={`ml-auto border-0 ${SENDER_HEALTH_TONE[health]}`}>{SENDER_HEALTH_LABEL[health]}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <Row label="Connected mailbox" value={state.connected ? (fromEmail || "Connected") : "Not connected"} good={state.connected} />
        <Row label="Domain authentication (SPF / DKIM)" value={state.domain_authenticated ? "Verified" : "Not verified"} good={state.domain_authenticated} icon={state.domain_authenticated ? ShieldCheck : AlertTriangle} />
        <Row label="Last successful send" value={state.last_send_at ? new Date(state.last_send_at).toLocaleString() : "—"} />
        <Row label="Scheduled today" value={scheduledToday} />
        {state.reconnect_required && (
          <div className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-2 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Reconnect required — sending is paused.
          </div>
        )}
        <Button asChild size="sm" variant="outline" className="w-full mt-1">
          <Link to="/app/settings/email">Open email connections</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, good, icon: Icon }: { label: string; value: any; good?: boolean; icon?: any }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className={`h-3.5 w-3.5 ${good ? "text-emerald-600" : "text-amber-600"}`} />}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
