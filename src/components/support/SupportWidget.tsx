import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle, X, Send, Loader2, CheckCircle2, BookOpen, LifeBuoy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { KNOWLEDGE, PROBLEM_CATEGORIES, searchKnowledge, type KnowledgeEntry } from "@/lib/supportKnowledge";
import { toast } from "sonner";

// Hide the widget entirely on legal reading and public hosted capture pages.
const HIDDEN_PREFIXES = ["/legal/", "/c/"];
// Proactive nudge allow-list (once per browser session).
const NUDGE_ROUTES = new Set<string>([
  "/", "/pricing", "/features", "/how-it-works", "/help", "/demo",
  "/app", "/app/data-vault", "/app/campaigns", "/app/activate",
  "/app/billing", "/app/settings/email",
]);
const NUDGE_SESSION_KEY = "vv.support.nudgeDismissed";
const AI_COUNT_KEY = "vv.support.aiCount";
const MAX_INPUT_CHARS = 1000;
const ANON_AI_CAP = 8;
const SIGNED_AI_CAP = 20;

type Mode = "chat" | "ticket" | "success";
type Msg = { role: "user" | "assistant" | "system"; content: string; links?: { label: string; to: string }[] };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi — I'm the Velocity Vision assistant. Ask me how the workspace works (Data Vault, sender verification, activation, campaigns, credits, billing, replies, pipeline) or tell me what isn't behaving as expected. I can also raise a ticket for you.",
};

function routeSuggestions(pathname: string, inApp: boolean): KnowledgeEntry[] {
  if (pathname.startsWith("/app/data-vault")) return KNOWLEDGE.filter((k) => k.category === "data_vault").slice(0, 3);
  if (pathname.startsWith("/app/settings/email")) return KNOWLEDGE.filter((k) => k.category === "sender_verification");
  if (pathname.startsWith("/app/activate")) return KNOWLEDGE.filter((k) => k.category === "activation");
  if (pathname.startsWith("/app/billing")) return KNOWLEDGE.filter((k) => k.category === "billing_credits");
  if (pathname.startsWith("/app/campaigns")) return KNOWLEDGE.filter((k) => k.category === "campaigns").slice(0, 3);
  if (pathname.startsWith("/app/follow-up") || pathname.startsWith("/app/pipeline")) return KNOWLEDGE.filter((k) => k.category === "leads_pipeline");
  if (pathname === "/app" || pathname === "/app/") return KNOWLEDGE.filter((k) => k.category === "getting_started");
  if (!inApp) return KNOWLEDGE.filter((k) => k.category === "getting_started").slice(0, 2);
  return [];
}

// Deterministic conversational fallback used when AI is not available.
function fallbackAnswer(question: string, route: string, inApp: boolean): Msg {
  const hits = searchKnowledge(question).slice(0, 2);
  const relevant = hits.length ? hits : routeSuggestions(route, inApp).slice(0, 2);
  const safety =
    "Reminder: AI outputs are drafts. Activation depends on sender verification, legal acceptance, credits and safe contacts — connected does not always mean verified.";
  if (relevant.length === 0) {
    return {
      role: "assistant",
      content:
        "I don't have a confident answer for that from the knowledge base. If this still looks wrong, raise a support ticket and the team will follow up. " +
        safety,
    };
  }
  const body = relevant.map((k) => `• ${k.answer}`).join("\n");
  const nextStep = relevant[0].links?.[0];
  const nextLine = nextStep ? `\n\nNext step: open ${nextStep.label} (${nextStep.to}).` : "";
  const links = relevant.flatMap((k) => k.links ?? []).slice(0, 4);
  return {
    role: "assistant",
    content: `${body}${nextLine}\n\n${safety}`,
    links,
  };
}

export default function SupportWidget() {
  const location = useLocation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [aiDisabled, setAiDisabled] = useState(false);
  const [problem, setProblem] = useState<string>("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setEmail(user?.email ?? ""); }, [user?.email]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking, mode]);

  const inApp = location.pathname.startsWith("/app");
  const inDemo = location.pathname.startsWith("/demo");
  const source = inApp ? "app" : inDemo ? "demo" : "public_site";
  const hidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));
  const suggestions = useMemo(() => routeSuggestions(location.pathname, inApp), [location.pathname, inApp]);

  useEffect(() => {
    if (hidden || open) return;
    if (!NUDGE_ROUTES.has(location.pathname)) return;
    try { if (sessionStorage.getItem(NUDGE_SESSION_KEY) === "1") return; } catch { /* ignore */ }
    const t = window.setTimeout(() => setNudgeVisible(true), 4500);
    return () => window.clearTimeout(t);
  }, [location.pathname, hidden, open]);

  const dismissNudge = () => {
    setNudgeVisible(false);
    try { sessionStorage.setItem(NUDGE_SESSION_KEY, "1"); } catch { /* ignore */ }
  };

  if (hidden) return null;

  const openWidget = () => { dismissNudge(); setOpen(true); };

  const resetChat = () => {
    setMessages([WELCOME]);
    setInput("");
    setMode("chat");
    setTicketRef(null);
    setProblem("");
    setTicketMessage("");
  };

  const currentWorkspaceId = () => {
    try { return localStorage.getItem("vv.currentWorkspaceId"); } catch { return null; }
  };

  const sendChat = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setThinking(true);

    // Build grounding from the top knowledge matches.
    const hits = searchKnowledge(q).slice(0, 4);
    const routeHits = routeSuggestions(location.pathname, inApp).slice(0, 3);
    const seen = new Set<string>();
    const grounding = [...hits, ...routeHits]
      .filter((k) => (seen.has(k.id) ? false : (seen.add(k.id), true)))
      .slice(0, 6)
      .map((k) => ({ question: k.question, answer: k.answer, links: k.links }));

    // If AI already errored earlier this session, skip straight to fallback.
    if (aiDisabled) {
      const ans = fallbackAnswer(q, location.pathname, inApp);
      setMessages([...next, ans]);
      setThinking(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("support-chat", {
        body: {
          messages: next
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
          context: {
            route: location.pathname,
            source,
            workspace_id: currentWorkspaceId(),
            signed_in: !!user,
          },
          grounding,
        },
      });

      if (error || !data || (data as any).error) {
        // Fall back gracefully; disable AI for the rest of the session on non-transient errors.
        const errCode = (data as any)?.error;
        if (errCode === "ai_not_configured" || errCode === "credits_exhausted" || errCode === "upstream_error") {
          setAiDisabled(true);
        }
        const ans = fallbackAnswer(q, location.pathname, inApp);
        setMessages([...next, ans]);
      } else {
        const answer = String((data as any).answer ?? "").trim() || fallbackAnswer(q, location.pathname, inApp).content;
        // Attach top-hit links so the customer has a clickable next step.
        const links = grounding.flatMap((g) => g.links ?? []).slice(0, 3);
        setMessages([...next, { role: "assistant", content: answer, links }]);
      }
    } catch (e) {
      const ans = fallbackAnswer(q, location.pathname, inApp);
      setMessages([...next, ans]);
    } finally {
      setThinking(false);
    }
  };

  const lastExchange = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m !== WELCOME);
    return { question: lastUser?.content ?? "", answer: lastAssistant?.content ?? "" };
  };

  const submitTicket = async () => {
    if (!ticketMessage.trim()) { toast.error("Please describe the issue"); return; }
    if (!user && !email.trim()) { toast.error("Please add your email so we can reply"); return; }
    setSubmitting(true);
    try {
      const cat = PROBLEM_CATEGORIES.find((c) => c.id === problem);
      const wsId = currentWorkspaceId();
      const { question, answer } = lastExchange();
      const diagnostics = {
        pathname: location.pathname,
        search: location.search,
        workspace_id: wsId,
        problem_key: problem || null,
        assistant_question: question || null,
        assistant_answer: answer || null,
        chat_transcript: messages
          .filter((m) => m.role !== "system")
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content })),
        ai_disabled: aiDisabled,
        timestamp: new Date().toISOString(),
      };
      const payload = {
        user_id: user?.id ?? null,
        email: user?.email ?? email.trim() ?? null,
        workspace_id: wsId,
        route: location.pathname,
        category: cat?.category ?? "other",
        severity: problem === "broken" || problem === "billing" ? "high" : "normal",
        subject: cat?.label ?? "Support request",
        message: ticketMessage.trim(),
        diagnostics,
        browser_info: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        source,
      };
      const { data, error } = await supabase.from("support_tickets").insert(payload).select("id").single();
      if (error) throw error;
      setTicketRef(data.id);

      try {
        const { data: notifyRes, error: notifyErr } = await supabase.functions.invoke("support-notify", {
          body: { ticket_id: data.id },
        });
        if (notifyErr || (notifyRes && (notifyRes as any).notified === false)) {
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

  // Position: bottom-LEFT, so we don't collide with the GTranslate floater on the right.
  return (
    <>
      {!open && nudgeVisible && (
        <div
          role="dialog"
          aria-label="Help nudge"
          className="fixed bottom-20 left-5 z-[59] w-[300px] max-w-[92vw] bg-card border border-border rounded-xl shadow-xl p-3"
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
            Ask me how the system works or report a problem.
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={openWidget} className="flex-1">Ask for help</Button>
            <Button size="sm" variant="ghost" onClick={dismissNudge}>Later</Button>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={openWidget}
          className="fixed bottom-5 left-5 z-[60] shadow-lg rounded-full bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 hover:opacity-90"
          aria-label="Open help"
        >
          <HelpCircle className="h-4 w-4" /> Help
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 left-5 z-[60] w-[380px] max-w-[94vw] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> Velocity Vision assistant
              </div>
              <div className="text-[11px] opacity-80">
                {inDemo ? "Demo mode — sample data only" : inApp ? "In-app support" : "Pre-sale & product help"}
                {aiDisabled ? " · offline mode" : ""}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                aria-label="Reset chat"
                className="opacity-80 hover:opacity-100 p-1"
                title="Start new conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setOpen(false); }}
                aria-label="Close"
                className="opacity-80 hover:opacity-100 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {mode === "chat" && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[52vh]">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap"
                          : "max-w-[92%] rounded-lg bg-muted text-foreground px-3 py-2 text-sm whitespace-pre-wrap"
                      }
                    >
                      {m.content}
                      {m.role === "assistant" && m.links && m.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {m.links.map((l) => (
                            <Link
                              key={l.to + l.label}
                              to={l.to}
                              onClick={() => setOpen(false)}
                              className="text-xs text-primary underline"
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                    </div>
                  </div>
                )}
                {messages.length === 1 && suggestions.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="text-[11px] font-medium text-muted-foreground">Try asking</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 3).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setInput(s.question)}
                          className="text-[11px] px-2 py-1 rounded-full border border-border hover:bg-accent hover:text-accent-foreground"
                        >
                          {s.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    disabled={thinking}
                  />
                  <Button size="sm" onClick={sendChat} disabled={thinking || !input.trim()}>
                    {thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Link to="/help" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 underline">
                      <BookOpen className="h-3 w-3" /> Open user guide
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMode("ticket")}
                      className="underline"
                    >
                      Raise a ticket
                    </button>
                  </div>
                  <span>{inApp ? location.pathname : ""}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  AI outputs are drafts. Activation still depends on sender verification, legal acceptance, credits and safe contacts. If something looks wrong, raise a ticket.
                </p>
              </div>
            </>
          )}

          {mode === "ticket" && (
            <div className="p-4 space-y-3">
              <div className="text-xs text-muted-foreground">
                We won't send emails, change your plan, or bypass any platform checks — we'll respond via ticket.
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
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
              />
              <div className="text-[11px] text-muted-foreground">
                We'll include your current page ({location.pathname}), the chat transcript, and browser details so we can help faster.
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={submitTicket} disabled={submitting}>
                  {submitting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                  Send ticket
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMode("chat")}>Back to chat</Button>
              </div>
            </div>
          )}

          {mode === "success" && (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
              <div className="font-medium text-sm">Ticket received</div>
              {ticketRef && <div className="text-xs text-muted-foreground">Ref: {ticketRef.slice(0, 8)}</div>}
              <p className="text-xs text-muted-foreground">
                Our team has been notified by email. Platform gates (legal, sender, activation, billing) remain in place — nothing is bypassed.
              </p>
              <Button size="sm" variant="outline" onClick={resetChat}>Back to chat</Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
