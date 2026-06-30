import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SENDER_HEALTH_LABEL, SENDER_HEALTH_TONE, type SenderHealth, type SenderState } from "@/lib/sendSafety";

export default function SenderStatusCard({
  state,
  health,
  scheduledToday,
  fromEmail,
  connectionId,
  onVerified,
}: {
  state: SenderState;
  health: SenderHealth;
  scheduledToday: number;
  fromEmail?: string | null;
  connectionId?: string | null;
  onVerified?: (result: any) => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const domain = fromEmail?.split("@")[1] ?? null;

  async function verifyNow() {
    if (!connectionId && !domain) {
      toast.error("No sender domain to verify yet.");
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sender-domain", {
        body: { connection_id: connectionId, domain },
      });
      if (error) throw error;
      if (data?.verified) {
        toast.success("Domain verified", { description: `SPF and DKIM look good for ${data.domain}.` });
      } else {
        toast.warning("Domain not fully verified", {
          description: `SPF: ${data?.spf_status || "?"} · DKIM: ${data?.dkim_status || "?"}. Safe send allowance stays reduced until verified.`,
        });
      }
      onVerified?.(data);
    } catch (e: any) {
      toast.error("Verification failed", { description: e.message });
    } finally {
      setVerifying(false);
    }
  }

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
        {!state.domain_authenticated && state.connected && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-2 text-amber-900 dark:text-amber-200 text-xs">
            Add SPF and DKIM DNS records for <b>{domain || "your domain"}</b>, then run a real DNS check. Until verified, your safe send allowance is reduced.
          </div>
        )}
        <div className="flex gap-2 mt-1">
          <Button size="sm" variant="outline" className="flex-1" onClick={verifyNow} disabled={verifying || !domain}>
            {verifying ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Checking DNS…</> : <><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verify domain (real DNS)</>}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/app/settings/email">Email settings</Link>
          </Button>
        </div>
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
