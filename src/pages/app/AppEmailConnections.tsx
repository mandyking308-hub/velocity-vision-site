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
import { Mail, Plug, AlertCircle, CheckCircle2, ArrowLeft, Trash2, Star, ChevronDown, Clock } from "lucide-react";
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

// Native Nylas connection options exposed on the Choose your mailbox card.
// Availability is config-driven: connectors default to "setup_required" until
// they are confirmed enabled on the production Nylas application. Flip a key
// to "enabled" only after the connector is verified in the Nylas dashboard.
type NylasProviderKey = "google" | "microsoft" | "icloud" | "imap" | "ews" | "yahoo";
type ConnectorAvailability = "enabled" | "setup_required";

const CONNECTOR_AVAILABILITY: Record<NylasProviderKey, ConnectorAvailability> = {
  google: "setup_required",
  microsoft: "enabled",
  icloud: "enabled",
  imap: "enabled",
  ews: "enabled",
  yahoo: "setup_required",
};

// Connectors that are configured on the production Nylas app but held back
// from public customer launch. Staff (founder/admin) get an internal smoke
// path so they can validate the OAuth flow without exposing it to customers.
// Google is currently held pending Google OAuth scope review.
// Yahoo is NOT here yet — the Yahoo connector must first be enabled in the
// production Nylas dashboard before we open a founder/admin smoke path.
const STAFF_ONLY_UNLOCK: ReadonlySet<NylasProviderKey> = new Set<NylasProviderKey>(["google"]);
function effectiveAvailability(key: NylasProviderKey, isStaff: boolean): ConnectorAvailability {
  if (CONNECTOR_AVAILABILITY[key] === "enabled") return "enabled";
  if (isStaff && STAFF_ONLY_UNLOCK.has(key)) return "enabled";
  return "setup_required";
}

// Founder-facing Nylas Production connector readiness matrix. Never shown to
// customers. Update each row deliberately as connectors are configured and
// tested against the US Production Nylas app. Flip CONNECTOR_AVAILABILITY
// (above) to "enabled" only after "tested" here becomes true.
type ReadinessStage = "not_added" | "setup_required" | "configured" | "verified" | "tested";
interface ConnectorReadiness {
  key: NylasProviderKey;
  label: string;
  nylas_status: ReadinessStage;
  test_mailbox_available: boolean;
  controlled_auth_test_passed: boolean;
  sending_disabled_until_verified: boolean;
  notes: string;
}
const CONNECTOR_READINESS: ConnectorReadiness[] = [
  { key: "google",    label: "Google / Gmail",            nylas_status: "configured", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "Google connector enabled in Nylas Production with broad scopes. Public customer launch HELD pending Google OAuth scope review. Founder/admin smoke path only." },
  { key: "microsoft", label: "Microsoft / Outlook / M365", nylas_status: "configured", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "Microsoft connector enabled in Nylas Production. Controlled internal smoke test pending — record consent scopes before flipping to tested." },
  { key: "icloud",    label: "iCloud",                     nylas_status: "configured", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "iCloud connector enabled in Nylas Production. Controlled internal smoke test pending — requires app-specific password on Apple ID." },
  { key: "imap",      label: "IMAP",                       nylas_status: "configured", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "IMAP connector enabled in Nylas Production. Controlled internal smoke test pending — verify against Fastmail or similar." },
  { key: "ews",       label: "EWS / Exchange",             nylas_status: "configured", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "EWS / Exchange connector enabled in Nylas Production. Controlled internal smoke test pending — verify EWS URL and credentials." },
  { key: "yahoo",     label: "Yahoo Mail",                 nylas_status: "setup_required", test_mailbox_available: false, controlled_auth_test_passed: false, sending_disabled_until_verified: true, notes: "Yahoo is a supported Nylas v3 provider (provider=yahoo). Card is wired but held as setup_required until the Yahoo connector is enabled in the production Nylas dashboard and a controlled smoke test passes. Customers currently see the SMTP fallback." },
];

// SMTP fallback board — providers where we do not (yet) offer native OAuth.
// All route through the Advanced SMTP dialog with app-password guidance.
type SmtpFallback = { key: string; title: string; note: string };
const SMTP_FALLBACK_PROVIDERS: SmtpFallback[] = [
  { key: "zoho",     title: "Zoho Mail",              note: "Connect via SMTP with a Zoho app password." },
  { key: "fastmail", title: "Fastmail",               note: "Connect via SMTP with a Fastmail app password." },
  { key: "aol",      title: "AOL Mail",               note: "Connect via SMTP with an AOL app password." },
  { key: "proton",   title: "Proton Mail (Bridge)",   note: "Requires Proton Mail Bridge running locally, then SMTP." },
  { key: "other",    title: "Other business mailbox", note: "Any provider that supports SMTP with an app password." },
];

interface ProviderCard {
  key: NylasProviderKey | "smtp";
  title: string;
  note: string;
  action: "oauth" | "smtp";
}
const PROVIDER_CARDS: ProviderCard[] = [
  { key: "google",    title: "Gmail / Google Workspace", note: "Personal Gmail or Google Workspace",      action: "oauth" },
  { key: "microsoft", title: "Outlook / Microsoft 365",  note: "Outlook, Hotmail, Live, or Microsoft 365",action: "oauth" },
  { key: "icloud",    title: "iCloud Mail",              note: "Use your Apple/iCloud mail account",      action: "oauth" },
  { key: "imap",      title: "IMAP mailbox",             note: "For providers supported through IMAP",    action: "oauth" },
  { key: "ews",       title: "Exchange / EWS",           note: "For on-prem Exchange / EWS accounts",     action: "oauth" },
  { key: "yahoo",     title: "Yahoo Mail",               note: "Yahoo native OAuth via Nylas. Held until the Yahoo connector is enabled in production. Use SMTP fallback for now.", action: "oauth" },
  { key: "smtp",      title: "Advanced SMTP",            note: "For any provider that supports SMTP with an app password (Fastmail, Zoho, AOL, Proton Bridge, your own server).", action: "smtp" },
];
function badgeFor(card: ProviderCard, isStaff: boolean): { text: string; tone: string } {
  if (card.action === "smtp")  return { text: "Fallback",    tone: "bg-muted text-muted-foreground" };
  const key = card.key as NylasProviderKey;
  const publiclyEnabled = CONNECTOR_AVAILABILITY[key] === "enabled";
  if (publiclyEnabled) return { text: "OAuth · Enabled", tone: "bg-emerald-100 text-emerald-700" };
  if (isStaff && STAFF_ONLY_UNLOCK.has(key)) {
    return { text: "OAuth · Admin smoke", tone: "bg-sky-100 text-sky-800" };
  }
  return { text: "Setup in progress", tone: "bg-amber-100 text-amber-800" };
}
const OAUTH_BUTTON_LABEL: Record<NylasProviderKey, string> = {
  google: "Connect with Google",
  microsoft: "Connect with Microsoft",
  icloud: "Connect with iCloud",
  imap: "Connect IMAP mailbox",
  ews: "Connect Exchange",
  yahoo: "Connect with Yahoo",
};

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
  const [oauthLoading, setOauthLoading] = useState<NylasProviderKey | null>(null);
  const { isFreePreview } = useCredits();
  useEffect(() => {
    if (isFreePreview) trackUpgradeEvent("free_preview_sending_gate_hit", { reason: "sending_gate", plan: "free_preview" });
  }, [isFreePreview]);
  const [showSmtp, setShowSmtp] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isStaff, setIsStaff] = useState(false);
  const [diag, setDiag] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = new Set((data || []).map((r: any) => r.role));
      setIsStaff(roles.has("admin") || roles.has("founder"));
    })();
  }, []);

  const loadDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-diagnostics");
      if (error) throw error;
      setDiag(data);
    } catch (e: any) {
      toast.error("Diagnostics failed", { description: e.message });
    } finally {
      setDiagLoading(false);
    }
  };

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

  const startOAuth = async (provider: NylasProviderKey) => {
    if (isFreePreview) {
      trackUpgradeEvent("free_preview_sending_gate_hit", { reason: "sending_gate", plan: "free_preview" });
      toast.info("Available on paid plans", {
        description: "Free Preview lets you build and review campaigns. Live mailbox connection unlocks on paid plans after verification.",
      });
      return;
    }
    if (effectiveAvailability(provider, isStaff) !== "enabled") {
      toast.info("Connector coming shortly", {
        description: "This connector is being enabled for production. It will unlock here as soon as it is verified.",
      });
      return;
    }
    setOauthLoading(provider);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-auth-start", {
        body: {
          provider,
          workspace_id: currentId,
          redirect_to: window.location.origin + "/app/settings/email",
          region: "us",
        },
      });
      if (error || !data?.auth_url) {
        const err = (data as any)?.error || error?.message || "Failed to start connection";
        if (err === "nylas_production_not_configured") {
          throw new Error("Production Nylas is not yet configured. Please contact support.");
        }
        throw new Error(err);
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
      const np = (c.nylas_provider || "").toLowerCase();
      const key: NylasProviderKey =
        np.includes("microsoft") || np === "outlook" ? "microsoft"
        : np.includes("icloud") ? "icloud"
        : np === "ews" || np.includes("exchange") ? "ews"
        : np.includes("imap") ? "imap"
        : "google";
      startOAuth(key);
      return;
    }
    setEditing(c);
    setOpen(true);
  };

  const handleProviderCard = (card: ProviderCard) => {
    if (card.action === "oauth") startOAuth(card.key as NylasProviderKey);
    else if (card.action === "smtp") {
      setShowSmtp(true);
      // Scroll advanced section into view for discoverability.
      setTimeout(() => document.getElementById("advanced-smtp")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/app/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Settings
      </Link>
      <div>
        <h1 className="text-3xl font-bold">Email connections</h1>
        <p className="text-muted-foreground">Connect the inbox you want campaign follow-ups to send from. Google, Microsoft, iCloud, IMAP and Exchange connect securely through Nylas. Advanced SMTP is available for providers that require app-password setup.</p>
      </div>

      {isFreePreview && <UpgradeNudge reason="free_preview_sending_gate" variant="banner" />}


      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose your mailbox</CardTitle>
          <CardDescription>
            Google, Microsoft, iCloud, IMAP and Exchange connect via secure OAuth — we never see your password. All connected mailboxes can send in warm-up mode after terms acceptance. Custom domains may need additional sender setup (SPF / DKIM) before higher-volume sending.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {PROVIDER_CARDS.filter((p) => p.action !== "smtp").map((card) => {
              const isOAuth = card.action === "oauth";
              const isYahoo = card.key === "yahoo";
              const loading = isOAuth && oauthLoading === (card.key as NylasProviderKey);
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => handleProviderCard(card)}
                  disabled={oauthLoading !== null && !loading}
                  className="text-left rounded-lg border bg-card hover:bg-accent/40 transition p-4 flex items-start gap-3 disabled:opacity-60"
                  data-testid={`provider-card-${card.key}`}
                >
                  <div className="mt-0.5">
                    {card.key === "google" ? <GoogleGlyph />
                      : card.key === "microsoft" ? <MicrosoftGlyph />
                      : isYahoo ? <Clock className="h-4 w-4 text-amber-600" />
                      : <Mail className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{card.title}</span>
                      {(() => { const b = badgeFor(card, isStaff); return (
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${b.tone}`}>{b.text}</span>
                      ); })()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{card.note}</p>
                    <p className="text-xs mt-2 font-medium text-primary">
                      {isOAuth
                        ? (isFreePreview ? "Available on paid plans"
                          : effectiveAvailability(card.key as NylasProviderKey, isStaff) !== "enabled" ? "Setup in progress"
                          : loading ? "Redirecting…"
                          : OAUTH_BUTTON_LABEL[card.key as NylasProviderKey])
                        : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>


          <Collapsible open={showSmtp} onOpenChange={setShowSmtp}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground" id="advanced-smtp">
                <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showSmtp ? "rotate-180" : ""}`} />
                Advanced SMTP setup
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="rounded-md border p-3 text-sm space-y-2">
                <p className="text-muted-foreground">
                  Fallback for providers without a native connector, or where you prefer SMTP — enter host, port and an app password. Yahoo, Fastmail, Zoho, your own server, or custom SMTP providers can work here.
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
          <CardTitle className="text-base">Why connect through Nylas?</CardTitle>
          <CardDescription>
            Nylas lets you connect supported mailboxes without sharing your normal password with Velocity. Google, Microsoft, iCloud, IMAP and Exchange connections use secure provider authorisation where available. You can revoke access at any time. Replies return to the connected inbox. Custom domains and SMTP may need additional sender setup before higher-volume sending.
          </CardDescription>
        </CardHeader>
      </Card>

      {isStaff && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nylas configuration diagnostic · founder / admin only</CardTitle>
            <CardDescription className="text-xs">Non-secret. Never shown to customers. Never returns API keys.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <Button size="sm" variant="outline" onClick={loadDiagnostics} disabled={diagLoading}>
              {diagLoading ? "Checking…" : diag ? "Refresh" : "Run diagnostic"}
            </Button>
            {diag && (
              <div className="grid sm:grid-cols-2 gap-2 pt-2">
                <div><strong>Mode:</strong> {diag.mode}{diag.mode === "sandbox_risk" && " ⚠"}</div>
                <div><strong>Region:</strong> {diag.region}</div>
                <div><strong>API URI:</strong> {diag.api_uri}</div>
                <div><strong>Callback configured:</strong> {diag.callback_uri_configured ? "yes" : "no"}</div>
                <div><strong>Client ID suffix:</strong> {diag.client_id_suffix ? `…${diag.client_id_suffix}` : "—"}</div>
                <div className="sm:col-span-2">
                  <strong>Secrets present:</strong>{" "}
                  {Object.entries(diag.secrets_present || {}).map(([k, v]) => `${k}=${v ? "yes" : "no"}`).join(" · ")}
                </div>
                <div className="sm:col-span-2">
                  <strong>Connectors:</strong>{" "}
                  {Object.entries(diag.connectors || {}).map(([k, v]) => `${k}:${v}`).join(" · ")}
                </div>
                {diag.notes && <div className="sm:col-span-2 text-amber-900"><strong>Note:</strong> {diag.notes}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isStaff && (
        <Card className="border-slate-300 bg-slate-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nylas connector readiness · founder / admin only</CardTitle>
            <CardDescription className="text-xs">
              Not shown to customers. Flip <code>CONNECTOR_AVAILABILITY</code> to <code>enabled</code> only after a row here reaches <strong>tested</strong>. Sending stays disabled until per-mailbox DNS/DKIM verification passes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-1 pr-3">Connector</th>
                  <th className="py-1 pr-3">Nylas status</th>
                  <th className="py-1 pr-3">Velocity UI</th>
                  <th className="py-1 pr-3">Test mailbox</th>
                  <th className="py-1 pr-3">Auth test</th>
                  <th className="py-1 pr-3">Send gated</th>
                  <th className="py-1 pr-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {CONNECTOR_READINESS.map((r) => {
                  const k = r.key as NylasProviderKey;
                  const uiStatus = r.key === "yahoo"
                    ? "hidden (SMTP fallback shown)"
                    : CONNECTOR_AVAILABILITY[k] === "enabled" ? "enabled"
                    : STAFF_ONLY_UNLOCK.has(k) ? "founder/admin only (public setup_required)"
                    : "setup_required";
                  return (
                    <tr key={r.key} className="border-b last:border-0 align-top">
                      <td className="py-1 pr-3 font-medium">{r.label}</td>
                      <td className="py-1 pr-3">{r.nylas_status}</td>
                      <td className="py-1 pr-3">{uiStatus}</td>
                      <td className="py-1 pr-3">{r.test_mailbox_available ? "yes" : "no"}</td>
                      <td className="py-1 pr-3">{r.controlled_auth_test_passed ? "passed" : "pending"}</td>
                      <td className="py-1 pr-3">{r.sending_disabled_until_verified ? "yes" : "no"}</td>
                      <td className="py-1 pr-3 text-muted-foreground">{r.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
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
  if (status === "connected") return <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> Inbox connected</Badge>;
  if (status === "error") return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Connection issue</Badge>;
  if (status === "reconnect_required") return <Badge variant="destructive">Reconnect required</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}

// Personal mailbox domains where DKIM selectors are provider-managed and users
// should never be asked for one. Custom domains (Workspace/M365/custom) still
// need the advanced setup flow.
const PERSONAL_MAILBOX_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "icloud.com", "me.com",
]);

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const ver = VER_LABEL[c.verification_status || "unknown"] || VER_LABEL.unknown;
  const domain = (c.domain || c.from_email?.split("@")[1] || "").toLowerCase();
  const isPersonalMailbox = PERSONAL_MAILBOX_DOMAINS.has(domain);
  const providerKnown = KNOWN_DKIM_HOSTS.has(c.smtp_host || "") || c.auth_type === "nylas";
  const hasConfiguredSelector = !!(c.dkim_selector || (c.dkim_selectors && c.dkim_selectors.length > 0));
  // Only ask for a DKIM selector when the sender is a custom domain that
  // actually failed verification because of it. Personal mailboxes and
  // provider-managed DKIM never see this prompt by default.
  const dkimSelectorRequired =
    !isPersonalMailbox &&
    !providerKnown &&
    !hasConfiguredSelector &&
    (c.verification_status === "failed" || c.verification_status === "needs_dns_setup");

  // Customer-facing send readiness — derived from the shared helper so this
  // stays in lockstep with /app/activate and the send dialog.
  const readiness = computeReadiness(c as ConnectionShape);
  const badge = READINESS_BADGE[readiness.state];
  const readinessLabel = badge.label;
  const readinessTone = badge.cls;
  const friendlyStatusLine = readiness.friendlyLine;

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
      if (data?.verified) toast.success("Sender ready", { description: domain });
      else toast.warning("Sender setup still needed", {
        description: "Open Advanced deliverability details for the full report.",
      });
      onVerified();
    } catch (e: any) {
      toast.error("Sender check failed", { description: e.message });
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
              <Badge variant="secondary">Provider: {providerLabel(c)}</Badge>
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${readinessTone}`}>{readinessLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{friendlyStatusLine}</p>
            <p className="text-xs text-muted-foreground">Replies return to this inbox.</p>
            {c.last_error && !isPersonalMailbox && (
              <p className="text-xs text-destructive mt-1">{c.last_error}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {!c.is_default && <Button variant="outline" size="sm" onClick={onDefault}>Make default</Button>}
            <Button variant="outline" size="sm" onClick={onReconnect}>Reconnect</Button>
            <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
              <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Advanced deliverability details
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${ver.cls}`}>{ver.label}</span>
              {c.sending_enabled ? (
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Sending enabled</Badge>
              ) : (
                <Badge variant="outline">Sending disabled</Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => verifyDns()} disabled={checking || !domain} className="ml-auto">
                {checking ? "Checking…" : "Run sender check"}
              </Button>
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

            {dkimSelectorRequired && (
              <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3 text-xs space-y-2">
                <p className="text-amber-900 dark:text-amber-200 font-medium">
                  DKIM selector required for custom domain <code>{domain}</code>.
                </p>
                <p className="text-amber-800/80 dark:text-amber-200/80">
                  Enter the selector supplied by your email provider (for example <code>s1</code>, <code>mail</code>, or a provider-specific string). We won't guess.
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function ConnectionDialog({ editing, workspaceId, onDone }: { editing: Connection | null; workspaceId: string | null; onDone: () => void }) {
  const { t } = useTranslation("app");
  const tc = useTranslation("common").t;
  // SMTP dialog only handles the three SMTP-configurable provider values —
  // OAuth-only providers (icloud/imap/ews) never open this dialog.
  const initialProvider: "gmail" | "outlook" | "smtp" =
    editing?.provider === "gmail" || editing?.provider === "outlook" ? editing.provider : "smtp";
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
