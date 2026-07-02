import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Calendar, Copy, Download, AlertCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { computeReadiness, READINESS_BADGE, type ConnectionShape } from "@/lib/senderReadiness";

interface SequenceEmail {
  subject: string;
  body: string;
  preview?: string;
}

interface Connection extends ConnectionShape {
  id: string; from_email: string; from_name: string | null; is_default: boolean;
  status: string; sending_enabled?: boolean | null; auth_type?: "smtp" | "nylas" | null;
  nylas_grant_id?: string | null; nylas_provider?: string | null;
  domain?: string | null;
}

interface Lead { id: string; name: string | null; email: string | null; }

interface Props {
  emails: SequenceEmail[];
  campaignId: string;
  workspaceId?: string | null;
  leads: Lead[];
}

export default function EmailSequenceSender({ emails, campaignId, workspaceId, leads }: Props) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    const [{ data: c }, { data: h }, userRes] = await Promise.all([
      supabase.from("email_connections").select("id, from_email, from_name, is_default, status, sending_enabled, auth_type").order("is_default", { ascending: false }),
      supabase.from("email_sends").select("id, recipient_email, subject, status, scheduled_for, sent_at, error, sequence_step").eq("campaign_id", campaignId).order("created_at", { ascending: false }).limit(20),
      supabase.auth.getUser(),
    ]);
    setConnections((c || []) as Connection[]);
    setHistory(h || []);
    setUserEmail(userRes.data.user?.email ?? null);
  };

  useEffect(() => { load(); }, [campaignId]);

  const defaultConn = connections.find((c) => c.is_default) || connections[0];
  const noConnection = connections.length === 0;
  const connectionIssue = defaultConn && defaultConn.status !== "connected" && defaultConn.status !== "pending";
  const sendReady = !!defaultConn?.sending_enabled && defaultConn?.status === "connected";
  const canTestOnly = !!defaultConn && !sendReady && !connectionIssue;

  const exportAll = () => {
    const text = emails.map((e, i) => `--- Email ${i + 1} ---\nSubject: ${e.subject}\n\n${e.body}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "email-sequence.txt"; a.click();
  };

  return (
    <div className="space-y-4">
      {noConnection && (
        <Card className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Connect your email to send this sequence</p>
              <p className="text-xs text-muted-foreground">Follow-ups send from your own Gmail or Outlook so replies come back to you.</p>
            </div>
            <Link to="/app/settings/email"><Button size="sm">Connect email</Button></Link>
          </CardContent>
        </Card>
      )}
      {connectionIssue && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Reconnect required</p>
              <p className="text-xs text-muted-foreground">{defaultConn?.from_email} — {defaultConn?.status}</p>
            </div>
            <Link to="/app/settings/email"><Button size="sm" variant="outline">Reconnect</Button></Link>
          </CardContent>
        </Card>
      )}

      {canTestOnly && (
        <Card className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <Mail className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Inbox connected — test send only</p>
              <p className="text-xs text-muted-foreground">
                Full campaign sending is not enabled yet. You can send a controlled test to yourself, or complete sender setup.
              </p>
            </div>
            <Link to="/app/settings/email"><Button size="sm" variant="outline">Sender setup</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          {defaultConn ? <>Sending from <strong>{defaultConn.from_email}</strong></> : "No inbox connected"}
          {defaultConn && (
            <> · <Badge variant={sendReady ? "default" : "outline"} className={sendReady ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
              {sendReady ? "Ready to send" : canTestOnly ? "Test send only" : "Setup needed"}
            </Badge></>
          )}
          {" · "}{leads.length} lead{leads.length === 1 ? "" : "s"} on this campaign
        </div>
        <Button variant="outline" size="sm" onClick={exportAll}><Download className="h-4 w-4 mr-1" /> Export sequence</Button>
      </div>

      {emails.map((e, i) => {
        const canTest = canTestOnly && !!defaultConn && !!userEmail;
        const sendDisabled = noConnection || leads.length === 0 || !sendReady;
        const sendTitle = !sendReady && !noConnection
          ? "Sending not enabled yet — complete sender setup or use Send test to myself."
          : undefined;
        return (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <Badge variant="outline">Step {i + 1}</Badge>
                <h4 className="font-semibold mt-1">{e.subject}</h4>
                {e.preview && <p className="text-xs text-muted-foreground">Preview: {e.preview}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${e.subject}\n\n${e.body}`); toast.success(i18n.t("common:toasts.copied")); }}>
                  <Copy className="h-4 w-4" />
                </Button>
                {canTest && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={testing}
                    onClick={async () => {
                      if (!defaultConn || !userEmail) return;
                      setTesting(true);
                      const { data, error } = await supabase.functions.invoke("email-send", {
                        body: {
                          connection_id: defaultConn.id,
                          campaign_id: campaignId,
                          workspace_id: workspaceId,
                          recipient_email: userEmail,
                          subject: `[TEST] ${e.subject}`,
                          body: e.body,
                          sequence_step: i + 1,
                          test_mode: true,
                        },
                      });
                      setTesting(false);
                      if (error || (data as any)?.error) {
                        toast.error("Test send failed", { description: (data as any)?.error || error?.message });
                      } else {
                        toast.success("Test sent to your inbox");
                      }
                      load();
                    }}
                  >
                    <Send className="h-4 w-4 mr-1" /> Send test to myself
                  </Button>
                )}
                <Button size="sm" disabled={sendDisabled} title={sendTitle} onClick={() => setOpenIdx(i)}>
                  <Send className="h-4 w-4 mr-1" /> Send / schedule
                </Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/30 p-3 rounded-md">{e.body}</pre>
          </CardContent>
        </Card>
      );})}

      {history.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Recent sends</h3>
          <div className="space-y-1">
            {history.map((h) => (
              <div key={h.id} className="text-sm flex items-center gap-2 p-2 border border-border rounded-md">
                <SendStatusBadge status={h.status} />
                <span className="flex-1 truncate">{h.subject}</span>
                <span className="text-muted-foreground text-xs">{h.recipient_email}</span>
                <span className="text-muted-foreground text-xs">
                  {h.sent_at ? new Date(h.sent_at).toLocaleString() : h.scheduled_for ? `Scheduled ${new Date(h.scheduled_for).toLocaleString()}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {openIdx !== null && (
        <SendDialog
          email={emails[openIdx]}
          stepIndex={openIdx}
          leads={leads}
          connectionId={defaultConn?.id}
          campaignId={campaignId}
          workspaceId={workspaceId}
          onClose={() => { setOpenIdx(null); load(); }}
        />
      )}
    </div>
  );
}

function SendStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { sent: "bg-green-600", scheduled: "bg-blue-600", sending: "bg-amber-600", failed: "bg-destructive", draft: "bg-muted-foreground", cancelled: "bg-muted-foreground" };
  return <Badge className={map[status] || ""}>{status}</Badge>;
}

function SendDialog({ email, stepIndex, leads, connectionId, campaignId, workspaceId, onClose }:
  { email: SequenceEmail; stepIndex: number; leads: Lead[]; connectionId?: string; campaignId: string; workspaceId?: string | null; onClose: () => void; }) {
  const { t } = useTranslation("app");
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledFor, setScheduledFor] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [selected, setSelected] = useState<Set<string>>(new Set(leads.filter(l => l.email).map(l => l.id)));
  const [sending, setSending] = useState(false);

  const toggle = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const submit = async () => {
    if (!connectionId) { toast.error(t("email.toasts.connectFirst")); return; }
    const targets = leads.filter(l => selected.has(l.id) && l.email);
    if (targets.length === 0) { toast.error(t("email.toasts.pickLead")); return; }
    setSending(true);
    let ok = 0, fail = 0;
    for (const lead of targets) {
      const { data, error } = await supabase.functions.invoke("email-send", {
        body: {
          connection_id: connectionId, campaign_id: campaignId, workspace_id: workspaceId,
          lead_id: lead.id, recipient_email: lead.email, recipient_name: lead.name,
          subject, body, sequence_step: stepIndex + 1,
          scheduled_for: mode === "schedule" ? new Date(scheduledFor).toISOString() : null,
        },
      });
      if (error || (data as any)?.error) fail++; else ok++;
    }
    setSending(false);
    if (ok) toast.success(mode === "schedule" ? t("email.toasts.scheduled", { count: ok }) : t("email.toasts.sent", { count: ok }));
    if (fail) toast.error(t("email.toasts.failed", { count: fail }));
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Send / schedule email {stepIndex + 1}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div>
            <Label>When</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="now">Send now</SelectItem>
                <SelectItem value="schedule">Schedule for later</SelectItem>
              </SelectContent>
            </Select>
            {mode === "schedule" && (
              <Input type="datetime-local" className="mt-2" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
            )}
          </div>
          <div>
            <Label>Send to ({selected.size}/{leads.filter(l => l.email).length})</Label>
            <div className="max-h-40 overflow-auto border border-border rounded-md p-2 space-y-1">
              {leads.filter(l => l.email).map(l => (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} />
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{l.name || l.email}</span>
                  <span className="text-muted-foreground text-xs">{l.email}</span>
                </label>
              ))}
              {leads.filter(l => l.email).length === 0 && <p className="text-xs text-muted-foreground">No leads with email addresses yet.</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={sending}>
            {mode === "schedule" ? <><Calendar className="h-4 w-4 mr-1" /> Schedule</> : <><Send className="h-4 w-4 mr-1" /> Send</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
