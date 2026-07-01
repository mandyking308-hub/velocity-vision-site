import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Plug, AlertCircle, CheckCircle2, ArrowLeft, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Connection {
  id: string;
  provider: "gmail" | "outlook" | "smtp";
  display_name: string | null;
  from_email: string;
  from_name: string | null;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  is_default: boolean;
  status: "pending" | "connected" | "error" | "reconnect_required";
  last_error: string | null;
  last_verified_at: string | null;
  domain: string | null;
  verification_status: string | null;
  mx_status: string | null;
  spf_status: string | null;
  dkim_status: string | null;
  dmarc_status: string | null;
  sending_enabled: boolean | null;
  dns_checked_at: string | null;
}

const PROVIDER_HELP: Record<string, { label: string; help: string; host: string; port: number }> = {
  gmail: {
    label: "Gmail / Google Workspace",
    host: "smtp.gmail.com",
    port: 587,
    help: "Use a Google App Password (Google Account → Security → 2-Step → App passwords). Don't use your normal password.",
  },
  outlook: {
    label: "Outlook / Microsoft 365",
    host: "smtp.office365.com",
    port: 587,
    help: "Use an app password if MFA is enabled. Some tenants require enabling SMTP AUTH for the mailbox.",
  },
  smtp: {
    label: "Custom SMTP",
    host: "",
    port: 587,
    help: "Use any SMTP provider (Fastmail, Zoho, your own server).",
  },
};

export default function AppEmailConnections() {
  const tc = useTranslation("common").t;
  const { currentId } = useWorkspace();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const q = supabase.from("email_connections").select("*").order("created_at", { ascending: false });
    const { data } = await (currentId ? q.eq("workspace_id", currentId) : q);
    setConnections((data || []) as Connection[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentId]);

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("email_connections").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("email_connections").update({ is_default: true }).eq("id", id);
    toast.success(tc("toasts.defaultSenderUpdated"));
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Disconnect this email account?")) return;
    await supabase.from("email_connections").delete().eq("id", id);
    toast.success(tc("toasts.disconnected"));
    load();
  };

  const reverify = async (c: Connection) => {
    setEditing(c);
    setOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/app/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Email connections</h1>
          <p className="text-muted-foreground">Connect the inbox you want campaign follow-ups to send from.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plug className="h-4 w-4 mr-2" /> Connect email</Button>
          </DialogTrigger>
          <ConnectionDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); load(); }} />
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No inbox connected yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Connect Gmail or Outlook so you can send campaign follow-ups straight from your own address.</p>
            <Button onClick={() => setOpen(true)}><Plug className="h-4 w-4 mr-2" /> Connect your first email</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {connections.map((c) => (
            <ConnectionRow
              key={c.id}
              c={c}
              workspaceId={currentId}
              onDefault={() => setDefault(c.id)}
              onReconnect={() => reverify(c)}
              onRemove={() => remove(c.id)}
              onVerified={load}
            />
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Why your own inbox?</CardTitle>
          <CardDescription>
            Sending from your own Gmail or Outlook keeps replies, deliverability and sender reputation in your control. We never store your password in plain text — it's encrypted at rest.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") return <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> SMTP connected</Badge>;
  if (status === "error") return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Connection issue</Badge>;
  if (status === "reconnect_required") return <Badge variant="destructive">Reconnect required</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

const VER_LABEL: Record<string, { label: string; cls: string }> = {
  not_connected: { label: "Not connected", cls: "bg-muted text-muted-foreground" },
  needs_dns_setup: { label: "DNS setup required", cls: "bg-amber-100 text-amber-800" },
  checking: { label: "Checking DNS…", cls: "bg-blue-100 text-blue-800" },
  verified: { label: "Domain verified", cls: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Verification failed", cls: "bg-rose-100 text-rose-700" },
  reconnect_required: { label: "Reconnect required", cls: "bg-rose-100 text-rose-700" },
  unknown: { label: "Not checked yet", cls: "bg-muted text-muted-foreground" },
};

function DnsPill({ label, value }: { label: string; value: string | null }) {
  const v = value || "unknown";
  const tone = v === "valid" ? "bg-emerald-100 text-emerald-700"
    : v === "missing" || v === "invalid" ? "bg-rose-100 text-rose-700"
    : v === "error" ? "bg-amber-100 text-amber-800"
    : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>{label}: {v}</span>;
}

function ConnectionRow({
  c, workspaceId, onDefault, onReconnect, onRemove, onVerified,
}: {
  c: Connection; workspaceId: string | null;
  onDefault: () => void; onReconnect: () => void; onRemove: () => void; onVerified: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const ver = VER_LABEL[c.verification_status || "unknown"] || VER_LABEL.unknown;
  const domain = c.domain || c.from_email?.split("@")[1] || "";

  async function verifyDns() {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sender-domain", {
        body: { connection_id: c.id, domain, workspace_id: workspaceId },
      });
      if (error) throw error;
      if (data?.verified) toast.success("Domain verified", { description: domain });
      else toast.warning("Not fully verified", {
        description: `MX ${data?.mx_status} · SPF ${data?.spf_status} · DKIM ${data?.dkim_status} · DMARC ${data?.dmarc_status}`,
      });
      onVerified();
    } catch (e: any) {
      toast.error("DNS check failed", { description: e.message });
    } finally { setChecking(false); }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{c.from_name ? `${c.from_name} <${c.from_email}>` : c.from_email}</span>
              {c.is_default && <Badge variant="default"><Star className="h-3 w-3 mr-1" /> Default</Badge>}
              <StatusBadge status={c.status} />
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ver.cls}`}>{ver.label}</span>
              {c.sending_enabled ? (
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Sending enabled</Badge>
              ) : (
                <Badge variant="outline">Sending disabled</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{PROVIDER_HELP[c.provider]?.label} · {c.smtp_host}:{c.smtp_port}</p>
            {c.last_error && <p className="text-xs text-destructive mt-1">{c.last_error}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={verifyDns} disabled={checking || !domain}>
              {checking ? "Checking DNS…" : "Check DNS verification"}
            </Button>
            {!c.is_default && <Button variant="outline" size="sm" onClick={onDefault}>Make default</Button>}
            <Button variant="outline" size="sm" onClick={onReconnect}>Reconnect</Button>
            <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <DnsPill label="MX" value={c.mx_status} />
          <DnsPill label="SPF" value={c.spf_status} />
          <DnsPill label="DKIM" value={c.dkim_status} />
          <DnsPill label="DMARC" value={c.dmarc_status} />
          {c.dns_checked_at && (
            <span className="text-[10px] text-muted-foreground ml-auto">Last checked {new Date(c.dns_checked_at).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionDialog({ editing, onDone }: { editing: Connection | null; onDone: () => void }) {
  const { t } = useTranslation("app");
  const tc = useTranslation("common").t;
  const [provider, setProvider] = useState<"gmail" | "outlook" | "smtp">(editing?.provider || "gmail");
  const [fromEmail, setFromEmail] = useState(editing?.from_email || "");
  const [fromName, setFromName] = useState(editing?.from_name || "");
  const [smtpUser, setSmtpUser] = useState(editing?.smtp_username || "");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState(editing?.smtp_host || "");
  const [smtpPort, setSmtpPort] = useState(editing?.smtp_port || 587);
  const [isDefault, setIsDefault] = useState(editing?.is_default ?? true);
  const [saving, setSaving] = useState(false);

  const helpConfig = PROVIDER_HELP[provider];

  const submit = async () => {
    if (!fromEmail || !smtpUser || (!smtpPassword && !editing)) {
      toast.error(t("email.toasts.credentialsRequired"));
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("email-connection-save", {
      body: {
        id: editing?.id,
        provider,
        from_email: fromEmail,
        from_name: fromName,
        smtp_username: smtpUser,
        smtp_password: smtpPassword || undefined,
        smtp_host: smtpHost || helpConfig.host,
        smtp_port: smtpPort || helpConfig.port,
        is_default: isDefault,
      },
    });
    setSaving(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || tc("toasts.saveFailed"));
      return;
    }
    if ((data as any).status === "error") {
      toast.error(t("email.toasts.savedConnectError", { error: (data as any).last_error }));
    } else {
      toast.success(t("email.toasts.inboxConnected"));
    }
    onDone();
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing ? "Reconnect email" : "Connect email"}</DialogTitle>
        <DialogDescription>We'll send your follow-ups through this inbox.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Provider</Label>
          <Select value={provider} onValueChange={(v) => { setProvider(v as any); const cfg = PROVIDER_HELP[v]; if (cfg.host) { setSmtpHost(cfg.host); setSmtpPort(cfg.port); }}}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_HELP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">{helpConfig.help}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>From email</Label>
            <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="you@yourdomain.com" />
          </div>
          <div>
            <Label>From name</Label>
            <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your name" />
          </div>
        </div>
        <div>
          <Label>SMTP username</Label>
          <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="usually the email address" />
        </div>
        <div>
          <Label>SMTP password / app password</Label>
          <Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder={editing ? "Leave blank to keep current" : "App password"} />
        </div>
        {provider === "smtp" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SMTP host</Label>
              <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" />
            </div>
            <div>
              <Label>Port</Label>
              <Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} />
            </div>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Use as default sender
        </label>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={saving}>{saving ? "Verifying…" : "Save & verify"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
