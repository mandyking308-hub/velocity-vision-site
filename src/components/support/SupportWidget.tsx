import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle, X, Send, Loader2, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KNOWLEDGE, PROBLEM_CATEGORIES, searchKnowledge, type KnowledgeEntry } from "@/lib/supportKnowledge";
import { toast } from "sonner";

// Routes that should NOT show the widget at all (keeps legal/hosted capture clean).
const HIDDEN_PREFIXES = ["/legal/", "/c/"];
// Explicit allow-list where the proactive nudge bubble may appear.
const NUDGE_ROUTES = new Set<string>([
  "/", "/pricing", "/features", "/how-it-works", "/help", "/demo",
  "/app", "/app/data-vault", "/app/campaigns", "/app/activate",
  "/app/billing", "/app/settings/email",
]);
const NUDGE_SESSION_KEY = "vv.support.nudgeDismissed";

type Mode = "menu" | "search" | "ticket" | "success";

export default function SupportWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const [query, setQuery] = useState("");
  const [problem, setProblem] = useState<string>("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [nudgeVisible, setNudgeVisible] = useState(false);

  useEffect(() => { setEmail(user?.email ?? ""); }, [user?.email]);

  const inApp = location.pathname.startsWith("/app");
  const inDemo = location.pathname.startsWith("/demo");
  const source = inApp ? "app" : inDemo ? "demo" : "public_site";
  const hidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));

  // Proactive nudge (once per session, allow-listed routes only)
  useEffect(() => {
    if (hidden || open) return;
    if (!NUDGE_ROUTES.has(location.pathname)) return;
    try {
      if (sessionStorage.getItem(NUDGE_SESSION_KEY) === "1") return;
    } catch { /* ignore */ }
    const t = window.setTimeout(() => setNudgeVisible(true), 4500);
    return () => window.clearTimeout(t);
  }, [location.pathname, hidden, open]);

  const dismissNudge = () => {
    setNudgeVisible(false);
    try { sessionStorage.setItem(NUDGE_SESSION_KEY, "1"); } catch { /* ignore */ }
  };

  const results: KnowledgeEntry[] = useMemo(() => searchKnowledge(query), [query]);

  const routeSuggestions = useMemo<KnowledgeEntry[]>(() => {
    const p = location.pathname;
    if (p.startsWith("/app/data-vault")) return KNOWLEDGE.filter((k) => k.category === "data_vault").slice(0, 3);
    if (p.startsWith("/app/settings/email")) return KNOWLEDGE.filter((k) => k.category === "sender_verification");
    if (p.startsWith("/app/activate")) return KNOWLEDGE.filter((k) => k.category === "activation");
    if (p.startsWith("/app/billing")) return KNOWLEDGE.filter((k) => k.category === "billing_credits");
    if (p.startsWith("/app/campaigns")) return KNOWLEDGE.filter((k) => k.category === "campaigns").slice(0, 3);
    if (p.startsWith("/app/follow-up") || p.startsWith("/app/pipeline")) return KNOWLEDGE.filter((k) => k.category === "leads_pipeline");
    if (p === "/app" || p === "/app/") return KNOWLEDGE.filter((k) => k.category === "getting_started");
    if (!inApp) return KNOWLEDGE.filter((k) => k.category === "getting_started").slice(0, 2);
    return [];
  }, [location.pathname, inApp]);

  if (hidden) return null;

  const reset = () => {
    setMode("menu");
    setQuery("");
    setProblem("");
    setMessage("");
    setTicketRef(null);
  };

  const openWidget = () => {
    dismissNudge();
    setOpen(true);
  };

  const submitTicket = async () => {
    if (!message.trim()) { toast.error("Please describe the issue"); return; }
    if (!user && !email.trim()) { toast.error("Please add your email so we can reply"); return; }
    setSubmitting(true);
    try {
      const cat = PROBLEM_CATEGORIES.find((c) => c.id === problem);
      const currentWorkspaceId = (() => {
        try { return localStorage.getItem("vv.currentWorkspaceId"); } catch { return null; }
      })();
      const diagnostics = {
        pathname: location.pathname,
        search: location.search,
        workspace_id: currentWorkspaceId,
        problem_key: problem || null,
        timestamp: new Date().toISOString(),
      };
      const payload = {
        user_id: user?.id ?? null,
        email: user?.email ?? email.trim() ?? null,
        workspace_id: currentWorkspaceId,
        route: location.pathname,
        category: cat?.category ?? "other",
        severity: problem === "broken" || problem === "billing" ? "high" : "normal",
        subject: cat?.label ?? "Support request",
        message: message.trim(),
        diagnostics,
        browser_info: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        source,
      };
      const { data, error } = await supabase.from("support_tickets").insert(payload).select("id").single();
      if (error) throw error;
      setTicketRef(data.id);

      // Fire-and-forget operator notification. Ticket is already saved either way.
      try {
        const { data: notifyRes, error: notifyErr } = await supabase.functions.invoke("support-notify", {
          body: { ticket_id: data.id },
        });
        if (notifyErr || (notifyRes && notifyRes.notified === false)) {
          console.warn("support-notify not delivered", notifyErr ?? notifyRes);
        }
      } catch (notifyEx) {
        console.warn("support-notify failed", notifyEx);
      }

      setMode("success");
    } catch (e: any) {
      console.error("support ticket error", e);
      toast.error("Could not send ticket", { description: e?.message ?? "Please try again shortly." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Proactive nudge bubble */}
      {!open && nudgeVisible && (
        <div
          role="dialog"
          aria-label="Help nudge"
          className="fixed bottom-20 right-5 z-[59] w-[300px] max-w-[92vw] bg-card border border-border rounded-xl shadow-xl p-3"
        >
          <button
            type="button"
            onClick={dismissNudge}
            aria-label="Dismiss"
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="font-semibold text-sm pr-6">Need help with Velocity Vision?</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ask a question, learn how it works, or report a problem.
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={openWidget} className="flex-1">Open Help</Button>
            <Button size="sm" variant="ghost" onClick={dismissNudge}>Later</Button>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={openWidget}
          className="fixed bottom-5 right-5 z-[60] shadow-lg rounded-full bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 hover:opacity-90"
          aria-label="Open help"
        >
          <HelpCircle className="h-4 w-4" /> Help
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[360px] max-w-[92vw] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
            <div>
              <div className="font-semibold text-sm">Velocity Help</div>
              <div className="text-[11px] opacity-80">
                {inDemo ? "Demo mode — sample data only" : inApp ? "In-app support" : "Pre-sale & product help"}
              </div>
            </div>
            <button onClick={() => { setOpen(false); reset(); }} aria-label="Close" className="opacity-80 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {mode === "menu" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Need help with Velocity Vision? Ask a question, learn how the workspace works, or report anything that is not behaving as expected.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setMode("search")} className="flex-1">Ask a question</Button>
                  <Button size="sm" variant="outline" onClick={() => setMode("ticket")} className="flex-1">Report a problem</Button>
                </div>

                <Link
                  to="/help"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <BookOpen className="h-4 w-4" /> Open user guide
                </Link>

                {routeSuggestions.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">Related to this page</div>
                    <ul className="space-y-2">
                      {routeSuggestions.map((k) => (
                        <li key={k.id} className="text-xs">
                          <div className="font-medium">{k.question}</div>
                          <div className="text-muted-foreground">{k.answer}</div>
                          {k.links && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {k.links.map((l) => (
                                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-primary underline">
                                  {l.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 text-xs text-muted-foreground border-t space-y-1">
                  <div>
                    Help centre:{" "}
                    <Link to="/help" className="underline" onClick={() => setOpen(false)}>/help</Link>{" · "}
                    <Link to="/pricing" className="underline" onClick={() => setOpen(false)}>Pricing</Link>{" · "}
                    <Link to="/legal" className="underline" onClick={() => setOpen(false)}>Legal</Link>{" · "}
                    <Link to="/contact" className="underline" onClick={() => setOpen(false)}>Contact</Link>
                  </div>
                  {inApp && (
                    <div className="pt-1">
                      Jump to:{" "}
                      <Link to="/app/data-vault" className="underline" onClick={() => setOpen(false)}>Data Vault</Link>{" · "}
                      <Link to="/app/data-vault/upload" className="underline" onClick={() => setOpen(false)}>Upload</Link>{" · "}
                      <Link to="/app/settings/email" className="underline" onClick={() => setOpen(false)}>Sender</Link>{" · "}
                      <Link to="/app/activate" className="underline" onClick={() => setOpen(false)}>Activate</Link>{" · "}
                      <Link to="/app/campaigns/new" className="underline" onClick={() => setOpen(false)}>New campaign</Link>{" · "}
                      <Link to="/app/billing" className="underline" onClick={() => setOpen(false)}>Billing</Link>
                    </div>
                  )}
                </div>
              </>
            )}

            {mode === "search" && (
              <>
                <Input
                  autoFocus
                  placeholder="Type your question…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="space-y-3">
                  {(query ? results : routeSuggestions).map((k) => (
                    <div key={k.id} className="text-xs border rounded-md p-2">
                      <div className="font-medium">{k.question}</div>
                      <div className="text-muted-foreground mt-1">{k.answer}</div>
                      {k.links && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {k.links.map((l) => (
                            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-primary underline">
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {query && results.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      No direct match.{" "}
                      <button className="underline text-primary" onClick={() => { setMode("ticket"); setMessage(query); }}>
                        Open a ticket instead
                      </button>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={reset}>← Back</Button>
              </>
            )}

            {mode === "ticket" && (
              <>
                <div className="text-xs text-muted-foreground">
                  We don't guarantee sales, replies, deliverability or inbox placement, and we can't give legal advice — we'll respond via your ticket. Platform gates (legal, sender verification, activation, billing) remain in place.
                </div>
                <Select value={problem} onValueChange={setProblem}>
                  <SelectTrigger><SelectValue placeholder="What's the issue?" /></SelectTrigger>
                  <SelectContent>
                    {PROBLEM_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!user && (
                  <Input placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                )}
                <Textarea
                  placeholder="Describe what happened, and what you expected."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="text-[11px] text-muted-foreground">
                  We'll include your current page ({location.pathname}) and browser details so we can help faster.
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitTicket} disabled={submitting}>
                    {submitting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                    Send ticket
                  </Button>
                  <Button size="sm" variant="ghost" onClick={reset}>Cancel</Button>
                </div>
              </>
            )}

            {mode === "success" && (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <div className="font-medium text-sm">Ticket received</div>
                {ticketRef && <div className="text-xs text-muted-foreground">Ref: {ticketRef.slice(0, 8)}</div>}
                <p className="text-xs text-muted-foreground">
                  Our team has been notified. We'll get back to you by email. Platform gates (legal, sender, activation, billing) remain in place — nothing is bypassed.
                </p>
                <Button size="sm" variant="outline" onClick={reset}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
