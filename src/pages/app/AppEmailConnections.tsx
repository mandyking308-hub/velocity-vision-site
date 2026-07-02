import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mail, Plug, AlertCircle, CheckCircle2, ArrowLeft, Trash2, Star, ChevronDown } from "lucide-react";
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
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
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
  dkim_selector: string | null;
  dkim_selectors: string[] | null;
  auth_type: "smtp" | "nylas" | null;
  nylas_grant_id: string | null;
  nylas_provider: string | null;
  token_status: string | null;
}

// Providers we consider "known" for DKIM selectors on the client. Kept in sync
// with the edge function so the UI only prompts for a selector when we truly
// don't know it. If you extend PROVIDER_SELECTORS server-side, mirror the host
// here.
const KNOWN_DKIM_HOSTS = new Set(["smtp.gmail.com", "smtp.office365.com"]);

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
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "microsoft">(null);
  const [showSmtp, setShowSmtp] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    if (currentId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("email_connections")
          .update({ workspace_id: currentId })
          .eq("user_id", user.id)
          .is("workspace_id", null);
      }
    }
    const q = supabase.from("email_connections").select("*").order("created_at", { ascending: false });
    const { data } = await (currentId ? q.eq("workspace_id", currentId) : q);
    setConnections((data || []) as Connection[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentId]);

  // Handle redirect back from Nylas hosted auth.
  useEffect(() => {
    const nylas = searchParams.get("nylas");
    if (!nylas) return;
    if (nylas === "connected") {
      const email = searchParams.get("email");
      toast.success("Inbox connected", { description: email || undefined });
    } else if (nylas === "error") {
      const reason = searchParams.get("reason") || "unknown_error";
      toast.error("Couldn't connect inbox", { description: reason });
    }
    const next = new URLSearchParams(searchParams);
    next.delete("nylas"); next.delete("email"); next.delete("reason");
    setSearchParams(next, { replace: true });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOAuth = async (provider: "google" | "microsoft") => {
    setOauthLoading(provider);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-auth-start", {
        body: {
          provider,
          workspace_id: currentId,
          redirect_to: window.location.origin + "/app/settings/email",
        },
      });
      if (error || !data?.auth_url) {
        throw new Error((data as any)?.error || error?.message || "Failed to start OAuth");
      }
      window.location.href = data.auth_url;
    } catch (e: any) {
      toast.error("Couldn't start connection", { description: e.message });
      setOauthLoading(null);
    }
  };

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("email_connections").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("email_connections").update({ is_default: true }).eq("id", id);
    toast.success(tc("toasts.defaultSenderUpdated"));
    load();
  };

  const remove = async (c: Connection) => {
    if (!confirm("Disconnect this email account?")) return;
    if (c.auth_type === "nylas" && c.nylas_grant_id) {
      const { error } = await supabase.functions.invoke("nylas-disconnect", { body: { connection_id: c.id } });
      if (error) toast.warning("Revoke may have failed", { description: error.message });
    }
    await supabase.from("email_connections").delete().eq("id", c.id);
    toast.success(tc("toasts.disconnected"));
    load();
  };

  const reverify = async (c: Connection) => {
    if (c.auth_type === "nylas") {
      startOAuth(c.nylas_provider === "microsoft" ? "microsoft" : "google");
      return;
    }
    setEditing(c);
    setOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/app/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>
      <div>
        <h1 className="text-3xl font-bold">Email connections</h1>
        <p className="text-muted-foreground">Connect the inbox you want campaign follow-ups to send from. We never store your password — Google and Microsoft use secure OAuth.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connect a mailbox</CardTitle>
          <CardDescription>Recommended: sign in with Google or Microsoft. Sending only turns on after your sender domain is verified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => startOAuth("google")}
              disabled={oauthLoading !== null}
            >
              <GoogleGlyph />
              <span className="font-medium">
                {oauthLoading === "google" ? "Redirecting…" : "Connect with Google"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => startOAuth("microsoft")}
              disabled={oauthLoading !== null}
            >
              <MicrosoftGlyph />
              <span className="font-medium">
                {oauthLoading === "microsoft" ? "Redirecting…" : "Connect with Microsoft"}
              </span>
            </Button>
          </div>

          <Collapsible open={showSmtp} onOpenChange={setShowSmtp}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showSmtp ? "rotate-180" : ""}`} />
                Advanced SMTP setup
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="rounded-md border p-3 text-sm space-y-2">
                <p className="text-muted-foreground">
                  Only needed for custom SMTP providers (Fastmail, Zoho, your own server) or if you can't use OAuth. Requires an app password.
                </p>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Plug className="h-4 w-4 mr-2" /> Add SMTP connection</Button>
                  </DialogTrigger>
                  <ConnectionDialog editing={editing} workspaceId={currentId} onDone={() => { setOpen(false); setEditing(null); load(); }} />
                </Dialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-lg">No inbox connected yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Sign in with Google or Microsoft above to get started.</p>
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
              onRemove={() => remove(c)}
              onVerified={load}
            />
          ))}
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Why connect via OAuth?</CardTitle>
          <CardDescription>
            Google and Microsoft OAuth keeps your password out of our system entirely — we get a scoped token that only allows sending mail on your behalf, and you can revoke it any time. Sending stays disabled until your domain's DNS records verify.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.3 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.2 5.2C41.6 35.1 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function MicrosoftGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
      <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
    </svg>
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
  const [selectorInput, setSelectorInput] = useState(c.dkim_selector || "");
  const ver = VER_LABEL[c.verification_status || "unknown"] || VER_LABEL.unknown;
  const domain = c.domain || c.from_email?.split("@")[1] || "";
  const providerKnown = KNOWN_DKIM_HOSTS.has(c.smtp_host || "") || c.auth_type === "nylas";
  const hasConfiguredSelector = !!(c.dkim_selector || (c.dkim_selectors && c.dkim_selectors.length > 0));
  const dkimSelectorRequired = !providerKnown && !hasConfiguredSelector;

  async function verifyDns(persistSelector?: string) {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sender-domain", {
        body: {
          connection_id: c.id,
          domain,
          workspace_id: workspaceId,
          persist_selector: persistSelector || undefined,
        },
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
              {c.auth_type === "nylas" && (
                <Badge variant="secondary" className="capitalize">
                  OAuth · {c.nylas_provider || "google"}
                </Badge>
              )}
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ver.cls}`}>{ver.label}</span>
              {c.sending_enabled ? (
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Sending enabled</Badge>
              ) : (
                <Badge variant="outline">Sending disabled</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {c.auth_type === "nylas"
                ? `${c.nylas_provider === "microsoft" ? "Microsoft" : "Google"} OAuth (via Nylas)`
                : `${PROVIDER_HELP[c.provider]?.label} · ${c.smtp_host || "?"}:${c.smtp_port ?? ""}`}
            </p>
            {c.last_error && <p className="text-xs text-destructive mt-1">{c.last_error}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => verifyDns()} disabled={checking || !domain}>
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

        {(dkimSelectorRequired || c.dkim_status === "unknown") && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-xs space-y-2">
            <p className="text-amber-900 dark:text-amber-200 font-medium">
              DKIM selector required — enter the selector supplied by your email provider.
            </p>
            <p className="text-amber-800/80 dark:text-amber-200/80">
              We won't guess. Any DKIM record we find at a random selector could belong to another provider, so sending stays disabled until you confirm the correct one (for example <code>s1</code>, <code>mail</code>, or a provider-specific string).
            </p>
            <div className="flex gap-2 items-end pt-1">
              <div className="flex-1">
                <Label className="text-[11px]">DKIM selector</Label>
                <Input
                  value={selectorInput}
                  onChange={(e) => setSelectorInput(e.target.value)}
                  placeholder="e.g. s1"
                  className="h-8 text-xs"
                  data-testid={`dkim-selector-input-${c.id}`}
                />
              </div>
              <Button
                size="sm"
                onClick={() => verifyDns(selectorInput.trim())}
                disabled={!selectorInput.trim() || checking}
                data-testid={`dkim-selector-save-${c.id}`}
              >
                Save & re-check
              </Button>
            </div>
            {c.dkim_selector && (
              <p className="text-[11px] text-muted-foreground">Configured selector: <code>{c.dkim_selector}</code></p>
            )}
          </div>
        )}

        {c.dkim_status === "valid" && c.dkim_selector && (
          <p className="text-[11px] text-muted-foreground">DKIM confirmed at selector <code>{c.dkim_selector}</code>.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectionDialog({ editing, workspaceId, onDone }: { editing: Connection | null; workspaceId: string | null; onDone: () => void }) {
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
        workspace_id: workspaceId || undefined,
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
