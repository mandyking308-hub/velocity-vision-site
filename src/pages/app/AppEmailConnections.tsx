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
import { computeReadiness, READINESS_BADGE, type ConnectionShape } from "@/lib/senderReadiness";
import { useCredits } from "@/contexts/CreditsContext";
import UpgradeNudge from "@/components/app/UpgradeNudge";
import { trackUpgradeEvent } from "@/lib/upgradeEvents";

interface Connection {
  id: string;
  provider: "gmail" | "outlook" | "icloud" | "imap" | "ews" | "smtp";
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

type NylasProviderKey = "google" | "microsoft" | "icloud" | "imap" | "ews" | "yahoo";
type ConnectorAvailability = "enabled" | "setup_required";

// Customer-facing availability only. Internal rollout notes and credentials do
// not belong in the browser bundle or customer UI.
const CONNECTOR_AVAILABILITY: Record<NylasProviderKey, ConnectorAvailability> = {
  google: "setup_required",
  microsoft: "enabled",
  icloud: "enabled",
  imap: "enabled",
  ews: "enabled",
  yahoo: "setup_required",
};

interface ProviderCard {
  key: NylasProviderKey;
  title: string;
  note: string;
}

const PROVIDER_CARDS: ProviderCard[] = [
  { key: "google", title: "Gmail / Google Workspace", note: "Hosted connector setup is still in progress. Advanced SMTP with a Google App Password remains available where appropriate." },
  { key: "microsoft", title: "Outlook / Microsoft 365", note: "Outlook, Hotmail, Live and Microsoft 365 through the enabled hosted connector." },
  { key: "icloud", title: "iCloud Mail", note: "Connect an Apple/iCloud mailbox through the enabled connector." },
  { key: "imap", title: "IMAP mailbox", note: "For supported IMAP mailboxes, including providers that use an app password." },
  { key: "ews", title: "Exchange / EWS", note: "For supported on-premises Exchange / EWS accounts." },
  { key: "yahoo", title: "Yahoo Mail", note: "Hosted Yahoo connector setup is still in progress. Use an enabled IMAP/app-password route where appropriate." },
];

const OAUTH_BUTTON_LABEL: Record<NylasProviderKey, string> = {
  google: "Connect with Google",
  microsoft: "Connect with Microsoft",
  icloud: "Connect with iCloud",
  imap: "Connect IMAP mailbox",
  ews: "Connect Exchange",
  yahoo: "Connect with Yahoo",
};

const SMTP_FALLBACK_PROVIDERS = [
  { key: "google", title: "Gmail / Google Workspace", note: "Use SMTP with a Google App Password where permitted by your account." },
  { key: "yahoo", title: "Yahoo Mail", note: "Use IMAP/SMTP with a Yahoo app password where supported." },
  { key: "zoho", title: "Zoho Mail", note: "Use SMTP with a Zoho app password." },
  { key: "fastmail", title: "Fastmail", note: "Use SMTP with a Fastmail app password." },
  { key: "aol", title: "AOL Mail", note: "Use SMTP with an AOL app password where supported." },
  { key: "proton", title: "Proton Mail (Bridge)", note: "Requires Proton Mail Bridge, then SMTP." },
  { key: "other", title: "Other business mailbox", note: "Use the provider's supported SMTP credentials or app-password route." },
];

const KNOWN_DKIM_HOSTS = new Set(["smtp.gmail.com", "smtp.office365.com"]);

const PROVIDER_HELP: Record<string, { label: string; help: string; host: string; port: number }> = {
  gmail: { label: "Gmail / Google Workspace", host: "smtp.gmail.com", port: 587, help: "Use a Google App Password where your account permits it. Do not use your normal account password." },
  outlook: { label: "Outlook / Microsoft 365", host: "smtp.office365.com", port: 587, help: "Use the provider-supported SMTP/app-password route where enabled for your mailbox or tenant." },
  smtp: { label: "Custom SMTP", host: "", port: 587, help: "Use the SMTP host, username and app password supplied by your email provider." },
};

export default function AppEmailConnections() {
  const tc = useTranslation("common").t;
  const { currentId } = useWorkspace();
  const { isFreePreview } = useCredits();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState<NylasProviderKey | null>(null);
  const [showSmtp, setShowSmtp] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (isFreePreview) trackUpgradeEvent("free_preview_sending_gate_hit", { reason: "sending_gate", plan: "free_preview" });
  }, [isFreePreview]);

  const load = async () => {
    setLoading(true);
    if (currentId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("email_connections").update({ workspace_id: currentId }).eq("user_id", user.id).is("workspace_id", null);
      }
    }
    const q = supabase.from("email_connections").select("*").order("created_at", { ascending: false });
    const { data } = await (currentId ? q.eq("workspace_id", currentId) : q);
    setConnections((data || []) as Connection[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentId]);

  useEffect(() => {
    const nylas = searchParams.get("nylas");
    if (!nylas) return;
    if (nylas === "connected") toast.success("Inbox connected", { description: searchParams.get("email") || undefined });
    else if (nylas === "error") toast.error("Couldn't connect inbox", { description: searchParams.get("reason") || "Connection was not completed." });
    const next = new URLSearchParams(searchParams);
    next.delete("nylas"); next.delete("email"); next.delete("reason");
    setSearchParams(next, { replace: true });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOAuth = async (provider: NylasProviderKey) => {
    if (isFreePreview) {
      trackUpgradeEvent("free_preview_sending_gate_hit", { reason: "sending_gate", plan: "free_preview" });
      toast.info("Available on paid plans", { description: "Free Preview supports campaign building and review, not live mailbox connection or sending." });
      return;
    }
    if (CONNECTOR_AVAILABILITY[provider] !== "enabled") {
      toast.info("Connector setup in progress", { description: "Use an enabled connector or Advanced SMTP/IMAP where appropriate. No payment or mailbox change was made." });
      return;
    }
    setOauthLoading(provider);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-auth-start", {
        body: { provider, workspace_id: currentId, redirect_to: window.location.origin + "/app/settings/email", region: "us" },
      });
      if (error || !data?.auth_url) throw new Error((data as any)?.error || error?.message || "Failed to start connection");
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
      if (error) toast.warning("Provider revoke may need attention", { description: "The local connection will still be removed. Check the provider account if needed." });
    }
    await supabase.from("email_connections").delete().eq("id", c.id);
    toast.success(tc("toasts.disconnected"));
    load();
  };

  const reverify = (c: Connection) => {
    if (c.auth_type === "nylas") {
      const np = (c.nylas_provider || "").toLowerCase();
      const key: NylasProviderKey = np.includes("microsoft") || np === "outlook" ? "microsoft" : np.includes("icloud") ? "icloud" : np === "ews" || np.includes("exchange") ? "ews" : np.includes("yahoo") ? "yahoo" : np.includes("imap") ? "imap" : "google";
      startOAuth(key);
      return;
    }
    setEditing(c);
    setOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/app/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Settings</Link>
      <div>
        <h1 className="text-3xl font-bold">Email connections</h1>
        <p className="text-muted-foreground">Connect an enabled mailbox route for customer-controlled sending. Availability varies by provider; Advanced SMTP is available where your provider supports it.</p>
      </div>

      {isFreePreview && <UpgradeNudge reason="free_preview_sending_gate" variant="banner" />}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose your mailbox</CardTitle>
          <CardDescription>Only connectors marked Enabled can start hosted authorisation today. Setup-in-progress connectors do not start a provider flow. Never paste mailbox passwords, API keys or client secrets into support messages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {PROVIDER_CARDS.map((card) => {
              const enabled = CONNECTOR_AVAILABILITY[card.key] === "enabled";
              const busy = oauthLoading === card.key;
              return (
                <button key={card.key} type="button" onClick={() => startOAuth(card.key)} disabled={oauthLoading !== null && !busy} className="text-left rounded-lg border bg-card hover:bg-accent/40 transition p-4 flex items-start gap-3 disabled:opacity-60">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-sm">{card.title}</span><span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{enabled ? "Enabled" : "Setup in progress"}</span></div>
                    <p className="text-xs text-muted-foreground mt-1">{card.note}</p>
                    <p className="text-xs mt-2 font-medium text-primary">{isFreePreview ? "Available on paid plans" : enabled ? busy ? "Redirecting…" : OAUTH_BUTTON_LABEL[card.key] : "Use another enabled route for now"}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <Collapsible open={showSmtp} onOpenChange={setShowSmtp}>
            <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground"><ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showSmtp ? "rotate-180" : ""}`} />Advanced SMTP setup</Button></CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="rounded-md border p-3 text-sm space-y-3">
                <p className="text-muted-foreground">Use this only when your provider supports SMTP/app-password access. Credentials are submitted directly to the secure connection function; do not send them through support.</p>
                <div className="grid sm:grid-cols-2 gap-2">{SMTP_FALLBACK_PROVIDERS.map((p) => <div key={p.key} className="rounded-md border bg-card p-2"><div className="text-xs font-medium">{p.title}</div><div className="text-[11px] text-muted-foreground">{p.note}</div></div>)}</div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
                  <DialogTrigger asChild><Button size="sm" variant="outline" disabled={isFreePreview}><Plug className="h-4 w-4 mr-2" /> Add SMTP connection</Button></DialogTrigger>
                  <ConnectionDialog editing={editing} workspaceId={currentId} onDone={() => { setOpen(false); setEditing(null); load(); }} />
                </Dialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {loading ? <p className="text-muted-foreground">Loading…</p> : connections.length === 0 ? (
        <Card><CardContent className="p-10 text-center space-y-3"><Mail className="h-10 w-10 mx-auto text-muted-foreground" /><h3 className="font-semibold text-lg">No inbox connected yet</h3><p className="text-muted-foreground max-w-md mx-auto">Choose an enabled provider above, or use Advanced SMTP where your provider supports it.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">{connections.map((c) => <ConnectionRow key={c.id} c={c} workspaceId={currentId} onDefault={() => setDefault(c.id)} onReconnect={() => reverify(c)} onRemove={() => remove(c)} onVerified={load} />)}</div>
      )}

      <Card className="bg-muted/30"><CardHeader><CardTitle className="text-base">Connection and sender readiness are separate</CardTitle><CardDescription>A mailbox can be connected while higher-volume sending is still unavailable. Use the readiness badge and Advanced deliverability details below each connection as the current workspace status. Provider connection does not guarantee deliverability or legal compliance.</CardDescription></CardHeader></Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "connected") return <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> Inbox connected</Badge>;
  if (status === "error") return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Connection issue</Badge>;
  if (status === "reconnect_required") return <Badge variant="destructive">Reconnect required</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

const PERSONAL_MAILBOX_DOMAINS = new Set(["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "yahoo.com", "icloud.com", "me.com"]);
const VER_LABEL: Record<string, { label: string; cls: string }> = {
  not_connected: { label: "Not connected", cls: "bg-muted text-muted-foreground" },
  needs_dns_setup: { label: "Sender setup needed", cls: "bg-amber-100 text-amber-800" },
  checking: { label: "Checking sender…", cls: "bg-blue-100 text-blue-800" },
  verified: { label: "Ready to send", cls: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Sender setup needed", cls: "bg-amber-100 text-amber-800" },
  reconnect_required: { label: "Reconnect required", cls: "bg-rose-100 text-rose-700" },
  unknown: { label: "Sender check pending", cls: "bg-muted text-muted-foreground" },
};

function providerLabel(c: Connection) {
  const np = (c.nylas_provider || "").toLowerCase();
  if (c.auth_type === "nylas") {
    if (np.includes("microsoft") || np === "outlook") return "Microsoft";
    if (np.includes("icloud")) return "iCloud";
    if (np === "ews" || np.includes("exchange")) return "Exchange";
    if (np.includes("yahoo")) return "Yahoo";
    if (np.includes("imap")) return "IMAP";
    return "Google";
  }
  if (c.provider === "gmail") return "Google";
  if (c.provider === "outlook") return "Microsoft";
  if (c.provider === "icloud") return "iCloud";
  if (c.provider === "ews") return "Exchange";
  if (c.provider === "imap") return "IMAP";
  return "SMTP";
}

function DnsPill({ label, value }: { label: string; value: string | null }) {
  const v = value || "unknown";
  const tone = v === "valid" ? "bg-emerald-100 text-emerald-700" : v === "missing" || v === "invalid" ? "bg-rose-100 text-rose-700" : v === "error" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>{label}: {v}</span>;
}

function ConnectionRow({ c, workspaceId, onDefault, onReconnect, onRemove, onVerified }: { c: Connection; workspaceId: string | null; onDefault: () => void; onReconnect: () => void; onRemove: () => void; onVerified: () => void; }) {
  const [checking, setChecking] = useState(false);
  const [selectorInput, setSelectorInput] = useState(c.dkim_selector || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const ver = VER_LABEL[c.verification_status || "unknown"] || VER_LABEL.unknown;
  const domain = (c.domain || c.from_email?.split("@")[1] || "").toLowerCase();
  const isPersonalMailbox = PERSONAL_MAILBOX_DOMAINS.has(domain);
  const providerKnown = KNOWN_DKIM_HOSTS.has(c.smtp_host || "") || c.auth_type === "nylas";
  const hasConfiguredSelector = !!(c.dkim_selector || (c.dkim_selectors && c.dkim_selectors.length > 0));
  const dkimSelectorRequired = !isPersonalMailbox && !providerKnown && !hasConfiguredSelector && (c.verification_status === "failed" || c.verification_status === "needs_dns_setup");
  const readiness = computeReadiness(c as ConnectionShape);
  const badge = READINESS_BADGE[readiness.state];

  async function verifyDns(persistSelector?: string) {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-sender-domain", { body: { connection_id: c.id, domain, workspace_id: workspaceId, persist_selector: persistSelector || undefined } });
      if (error) throw error;
      if (data?.verified) toast.success("Sender ready", { description: domain });
      else toast.warning("Sender setup still needed", { description: "Open Advanced deliverability details for the current report." });
      onVerified();
    } catch (e: any) { toast.error("Sender check failed", { description: e.message }); }
    finally { setChecking(false); }
  }

  return (
    <Card><CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold">{c.from_name ? `${c.from_name} <${c.from_email}>` : c.from_email}</span>{c.is_default && <Badge><Star className="h-3 w-3 mr-1" /> Default</Badge>}<StatusBadge status={c.status} /><Badge variant="secondary">Provider: {providerLabel(c)}</Badge><span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span></div>
          <p className="text-xs text-muted-foreground mt-1">{readiness.friendlyLine}</p>
          <p className="text-xs text-muted-foreground">Replies return to this inbox.</p>
          {c.last_error && !isPersonalMailbox && <p className="text-xs text-destructive mt-1">{c.last_error}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">{!c.is_default && <Button variant="outline" size="sm" onClick={onDefault}>Make default</Button>}<Button variant="outline" size="sm" onClick={onReconnect}>Reconnect</Button><Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button></div>
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="text-muted-foreground -ml-2"><ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />Advanced deliverability details</Button></CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-3">
          <div className="flex items-center gap-2 flex-wrap"><span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ver.cls}`}>{ver.label}</span>{c.sending_enabled ? <Badge className="bg-emerald-600">Sending enabled</Badge> : <Badge variant="outline">Sending disabled</Badge>}<Button variant="outline" size="sm" onClick={() => verifyDns()} disabled={checking || !domain} className="ml-auto">{checking ? "Checking…" : "Run sender check"}</Button></div>
          <div className="flex flex-wrap gap-1.5"><DnsPill label="MX" value={c.mx_status} /><DnsPill label="SPF" value={c.spf_status} /><DnsPill label="DKIM" value={c.dkim_status} /><DnsPill label="DMARC" value={c.dmarc_status} />{c.dns_checked_at && <span className="text-[10px] text-muted-foreground ml-auto">Last checked {new Date(c.dns_checked_at).toLocaleString()}</span>}</div>
          {dkimSelectorRequired && <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs space-y-2"><p className="font-medium">DKIM selector required for custom domain <code>{domain}</code>.</p><p className="text-muted-foreground">Enter the selector supplied by your email provider. Velocity Vision will not guess a selector.</p><div className="flex gap-2 items-end"><div className="flex-1"><Label className="text-[11px]">DKIM selector</Label><Input value={selectorInput} onChange={(e) => setSelectorInput(e.target.value)} placeholder="e.g. s1" className="h-8 text-xs" /></div><Button size="sm" onClick={() => verifyDns(selectorInput.trim())} disabled={!selectorInput.trim() || checking}>Save & re-check</Button></div></div>}
        </CollapsibleContent>
      </Collapsible>
    </CardContent></Card>
  );
}

function ConnectionDialog({ editing, workspaceId, onDone }: { editing: Connection | null; workspaceId: string | null; onDone: () => void }) {
  const { t } = useTranslation("app");
  const tc = useTranslation("common").t;
  const initialProvider: "gmail" | "outlook" | "smtp" = editing?.provider === "gmail" || editing?.provider === "outlook" ? editing.provider : "smtp";
  const [provider, setProvider] = useState<"gmail" | "outlook" | "smtp">(initialProvider);
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
    if (!fromEmail || !smtpUser || (!smtpPassword && !editing)) { toast.error(t("email.toasts.credentialsRequired")); return; }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("email-connection-save", { body: { id: editing?.id, provider, from_email: fromEmail, from_name: fromName, smtp_username: smtpUser, smtp_password: smtpPassword || undefined, smtp_host: smtpHost || helpConfig.host, smtp_port: smtpPort || helpConfig.port, is_default: isDefault, workspace_id: workspaceId || undefined } });
    setSaving(false);
    if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || tc("toasts.saveFailed")); return; }
    if ((data as any).status === "error") toast.error(t("email.toasts.savedConnectError", { error: (data as any).last_error }));
    else toast.success(t("email.toasts.inboxConnected"));
    onDone();
  };

  return <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Reconnect email" : "Connect email"}</DialogTitle><DialogDescription>Use provider-supported SMTP credentials or an app password. Never use or share a credential that your provider does not permit for third-party SMTP access.</DialogDescription></DialogHeader><div className="space-y-3"><div><Label>Provider</Label><Select value={provider} onValueChange={(v) => { setProvider(v as any); const cfg = PROVIDER_HELP[v]; if (cfg.host) { setSmtpHost(cfg.host); setSmtpPort(cfg.port); } }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PROVIDER_HELP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground mt-1">{helpConfig.help}</p></div><div className="grid grid-cols-2 gap-3"><div><Label>From email</Label><Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} /></div><div><Label>From name</Label><Input value={fromName} onChange={(e) => setFromName(e.target.value)} /></div></div><div><Label>SMTP username</Label><Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} /></div><div><Label>SMTP password / app password</Label><Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder={editing ? "Leave blank to keep current" : "App password"} /></div>{provider === "smtp" && <div className="grid grid-cols-2 gap-3"><div><Label>SMTP host</Label><Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} /></div><div><Label>Port</Label><Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} /></div></div>}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Use as default sender</label></div><DialogFooter><Button onClick={submit} disabled={saving}>{saving ? "Verifying…" : "Save & verify"}</Button></DialogFooter></DialogContent>;
}
