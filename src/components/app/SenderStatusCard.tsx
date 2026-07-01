import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, AlertTriangle, RefreshCw, Loader2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { SENDER_HEALTH_LABEL, SENDER_HEALTH_TONE, type SenderHealth, type SenderState } from "@/lib/sendSafety";

type DnsStatus = "valid" | "invalid" | "missing" | "error" | "unknown";

export interface SenderVerificationDetail {
  verification_status?: "not_connected" | "needs_dns_setup" | "checking" | "verified" | "failed" | "reconnect_required" | "unknown" | null;
  mx_status?: DnsStatus | null;
  spf_status?: DnsStatus | null;
  dkim_status?: DnsStatus | null;
  dmarc_status?: DnsStatus | null;
  sending_enabled?: boolean | null;
  dns_checked_at?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  not_connected: "No sender connected",
  needs_dns_setup: "Sender connected — DNS setup required",
  checking: "Checking DNS…",
  verified: "Domain verified",
  failed: "Verification failed",
  reconnect_required: "Reconnect required",
  unknown: "Not checked yet",
};
const STATUS_TONE: Record<string, string> = {
  not_connected: "bg-muted text-muted-foreground",
  needs_dns_setup: "bg-amber-100 text-amber-800",
  checking: "bg-blue-100 text-blue-800",
  verified: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  reconnect_required: "bg-rose-100 text-rose-700",
  unknown: "bg-muted text-muted-foreground",
};

export default function SenderStatusCard({
  state,
  health,
  scheduledToday,
  fromEmail,
  connectionId,
  detail,
  onVerified,
}: {
  state: SenderState;
  health: SenderHealth;
  scheduledToday: number;
  fromEmail?: string | null;
  connectionId?: string | null;
  detail?: SenderVerificationDetail | null;
  onVerified?: (result: any) => void;
}) {
  const { t } = useTranslation("app");
  const { currentId } = useWorkspace();
  const [verifying, setVerifying] = useState(false);
  const domain = fromEmail?.split("@")[1] ?? null;

  const status = (detail?.verification_status || (state.connected ? "needs_dns_setup" : "not_connected")) as string;

  async function verifyNow() {
    if (!connectionId && !domain) {
      toast.error(t("sender.toasts.noDomain"));
      return;
    }
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sender-domain", {
        body: { connection_id: connectionId, domain, workspace_id: currentId },
      });
      if (error) throw error;
      if (data?.verified) {
        toast.success(t("sender.toasts.verified"), { description: t("sender.toasts.verifiedDesc", { domain: data.domain }) });
      } else {
        toast.warning(t("sender.toasts.notVerified"), {
          description: `MX: ${data?.mx_status || "?"} · SPF: ${data?.spf_status || "?"} · DKIM: ${data?.dkim_status || "?"} · DMARC: ${data?.dmarc_status || "?"}`,
        });
      }
      onVerified?.(data);
    } catch (e: any) {
      toast.error(t("sender.toasts.verifyFailed"), { description: e.message });
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
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_TONE[status] || STATUS_TONE.unknown}`}>
          {STATUS_LABEL[status] || STATUS_LABEL.unknown}
        </div>
        <Row label="Connected mailbox" value={state.connected ? (fromEmail || "Connected") : "Not connected"} tone={state.connected ? "good" : "bad"} />
        <DnsRow label="MX (mail routing)" value={detail?.mx_status} />
        <DnsRow label="SPF" value={detail?.spf_status} />
        <DnsRow label="DKIM" value={detail?.dkim_status} />
        <DnsRow label="DMARC" value={detail?.dmarc_status} />
        <Row label="Last checked" value={detail?.dns_checked_at ? new Date(detail.dns_checked_at).toLocaleString() : "Never"} />
        <Row label="Scheduled today" value={scheduledToday} />
        <Row
          label="Sending enabled"
          value={detail?.sending_enabled ? "Yes" : "No — verification required"}
          tone={detail?.sending_enabled ? "good" : "bad"}
        />
        {state.reconnect_required && (
          <div className="rounded-md border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-2 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Reconnect required — sending is paused.
          </div>
        )}
        {status !== "verified" && state.connected && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-2 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <p>Publish MX, SPF, DKIM and DMARC DNS records for <b>{domain || "your domain"}</b>, then run a real DNS check. Until every check passes, sending stays disabled.</p>
            {detail?.dkim_status === "unknown" && (
              <p><b>DKIM selector required</b> — enter the selector supplied by your email provider on the Email settings page. Fallback records won't enable sending.</p>
            )}
          </div>
        )}
        <div className="flex gap-2 mt-1">
          <Button size="sm" variant="outline" className="flex-1" onClick={verifyNow} disabled={verifying || !domain}>
            {verifying ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Checking DNS…</> : <><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Check DNS verification</>}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/app/settings/email">Email settings</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: any; tone?: "good" | "bad" }) {
  const cls = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-rose-700" : "";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${cls}`}>{value}</span>
    </div>
  );
}

function DnsRow({ label, value }: { label: string; value?: DnsStatus | null }) {
  const v = value || "unknown";
  const meta: Record<string, { icon: any; text: string; tone: string }> = {
    valid: { icon: CheckCircle2, text: "Valid", tone: "text-emerald-600" },
    missing: { icon: XCircle, text: "Missing", tone: "text-rose-600" },
    invalid: { icon: AlertTriangle, text: "Invalid", tone: "text-rose-600" },
    error: { icon: AlertTriangle, text: "Lookup error", tone: "text-amber-600" },
    unknown: { icon: HelpCircle, text: "Not checked", tone: "text-muted-foreground" },
  };
  const m = meta[v] || meta.unknown;
  const Icon = m.icon;
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${m.tone}`} /> {label}
      </span>
      <span className={`font-medium ${m.tone}`}>{m.text}</span>
    </div>
  );
}
