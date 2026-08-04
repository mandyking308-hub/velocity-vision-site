import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "valid" | "already" | "invalid" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.valid) setState("valid");
        else if (d?.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    setBusy(false);
    if (error) setState("error");
    else if (data?.success) setState("done");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  const message: Record<State, string> = {
    loading: "Checking your link…",
    valid: "Confirm that you'd like to stop receiving these emails.",
    already: "You're already unsubscribed — no further emails will be sent.",
    invalid: "This unsubscribe link is invalid or has expired.",
    done: "You've been unsubscribed. Sorry to see you go.",
    error: "Something went wrong. Please try again shortly.",
  };

  return (
    <>
      <SEO title="Unsubscribe — Velocity Vision" description="Manage your email preferences for Velocity Vision." path="/unsubscribe" />
      <main className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-card p-8 text-center">
          <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">Velocity Vision</p>
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Email preferences</h1>
          <p className="text-muted-foreground text-sm mb-6">{message[state]}</p>
          {state === "valid" && (
            <Button variant="cta" size="lg" onClick={confirm} disabled={busy}>
              {busy ? "Unsubscribing…" : "Confirm unsubscribe"}
            </Button>
          )}
        </div>
      </main>
    </>
  );
};

export default Unsubscribe;
