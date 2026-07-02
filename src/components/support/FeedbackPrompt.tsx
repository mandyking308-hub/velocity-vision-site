import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Inline, one-time feedback prompt tied to a specific moment
 * (campaign generated, import complete, checkout done, etc).
 *
 * Uses localStorage to make sure the same user never sees the same
 * prompt twice, and offers a subtle rating + free-text field.
 * Never blocks the flow. Not a support channel.
 */
type Props = {
  /** Unique key per moment (e.g. "campaign_pack", "data_vault_import", "checkout"). */
  promptKey: string;
  /** Question shown at the top. */
  question: string;
  /** Default feedback_type stored with the row. */
  feedbackType:
    | "confusing"
    | "missing_feature"
    | "bug"
    | "loved"
    | "pricing_billing"
    | "other";
  /** Optional workspace_id override; otherwise reads vv.currentWorkspaceId. */
  workspaceId?: string | null;
  className?: string;
};

const STORAGE_PREFIX = "vv.feedback.prompt.";

export default function FeedbackPrompt({
  promptKey,
  question,
  feedbackType,
  workspaceId,
  className,
}: Props) {
  const { user } = useAuth();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const storageKey = `${STORAGE_PREFIX}${promptKey}`;

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey);
      if (!seen) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  const markSeen = () => {
    try { localStorage.setItem(storageKey, new Date().toISOString()); } catch { /* ignore */ }
  };

  const dismiss = () => {
    markSeen();
    setVisible(false);
  };

  const submit = async () => {
    if (!rating && !message.trim()) {
      toast.info("Add a rating or short note first");
      return;
    }
    setSubmitting(true);
    try {
      const wsId =
        workspaceId ??
        (typeof localStorage !== "undefined" ? localStorage.getItem("vv.currentWorkspaceId") : null);
      const source = location.pathname.startsWith("/app")
        ? "app"
        : location.pathname.startsWith("/demo")
        ? "demo"
        : "public_site";
      const { error } = await supabase.from("customer_feedback").insert({
        user_id: user?.id ?? null,
        workspace_id: wsId,
        email: user?.email ?? null,
        rating: rating > 0 ? rating : null,
        feedback_type: feedbackType,
        message: message.trim().slice(0, 2000) || `[${feedbackType}] rating ${rating}/5`,
        route: location.pathname,
        source,
        contact_permission: false,
        browser_info:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        metadata: { prompt_key: promptKey, timestamp: new Date().toISOString() },
      });
      if (error) throw error;
      markSeen();
      setSent(true);
      setTimeout(() => setVisible(false), 2400);
    } catch (e: any) {
      console.error("feedback prompt error", e);
      toast.error("Couldn't send feedback", { description: e?.message ?? "Try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={
        "mt-4 rounded-xl border border-border bg-card/60 p-3 relative " + (className ?? "")
      }
      role="region"
      aria-label="Feedback prompt"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss feedback"
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {sent ? (
        <div className="flex items-center gap-2 text-sm text-green-700 py-1">
          <CheckCircle2 className="h-4 w-4" /> Thanks — feedback received.
        </div>
      ) : (
        <>
          <div className="text-sm font-medium pr-6">{question}</div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} out of 5`}
                className={
                  "h-7 w-7 rounded-md border text-xs " +
                  (rating >= n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50")
                }
              >
                {n}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Optional — what could be better?"
            rows={2}
            className="mt-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Not a support channel — for problems, use Help → Raise a ticket.</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
              <Button size="sm" onClick={submit} disabled={submitting}>
                {submitting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                Send
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
