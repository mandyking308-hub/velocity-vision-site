import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, RefreshCw, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";

interface BufferConnectionRow {
  id: string;
  status: string;
  connected_at: string | null;
  last_error: string | null;
  scopes: string | null;
}

interface BufferChannel {
  id: string;
  name: string | null;
  displayName: string | null;
  service: string | null;
  isQueuePaused: boolean | null;
}

type State = "loading" | "not_connected" | "connected" | "reconnect_required";

const ERROR_COPY: Record<string, string> = {
  denied: "Buffer connection was cancelled.",
  provider_error: "Buffer could not complete the connection. Please try again.",
  missing_params: "Buffer connection failed. Please try again.",
  unknown_state: "Buffer connection session was not recognized. Please try again.",
  state_consumed: "That Buffer connection link was already used. Please try again.",
  state_expired: "Buffer connection session expired. Please try again.",
  token_exchange_failed: "Buffer could not verify the connection. Please try again.",
  connection_save_failed: "Buffer connected but could not be saved. Please try again.",
  buffer_not_configured: "Buffer isn't configured yet.",
  internal_error: "Something went wrong connecting Buffer. Please try again.",
};

async function invokeError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return typeof body?.error === "string" ? body.error : "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

export default function BufferSettingsCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<State>("loading");
  const [connection, setConnection] = useState<BufferConnectionRow | null>(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [channels, setChannels] = useState<BufferChannel[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await (supabase.from as any)("buffer_connections")
      .select("id, status, connected_at, last_error, scopes")
      .maybeSingle();
    const row = data as BufferConnectionRow | null;
    setConnection(row);
    setState(row ? (row.status === "reconnect_required" ? "reconnect_required" : "connected") : "not_connected");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle the safe status query returned by the OAuth callback.
  useEffect(() => {
    const status = searchParams.get("buffer");
    if (!status) return;
    if (status === "connected") {
      toast.success("Buffer connected");
      load();
    } else {
      const reason = searchParams.get("reason") || "internal_error";
      toast.error(ERROR_COPY[reason] || ERROR_COPY.internal_error);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("buffer");
    next.delete("reason");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, load]);

  const connect = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("buffer-oauth-start", {
        body: { return_to: "/app/settings" },
      });
      if (error) {
        const code = await invokeError(error);
        if (code === "buffer_not_configured") {
          // Fail closed: no fake connected state.
          setConfigMissing(true);
        } else {
          toast.error("Could not start Buffer connection. Please try again.");
        }
        return;
      }
      if (data?.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } finally {
      setBusy(false);
    }
  };

  const refreshChannels = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("buffer-channels", { body: {} });
      if (error) {
        const code = await invokeError(error);
        if (code === "reconnect_required" || code === "not_connected") {
          setState(code === "reconnect_required" ? "reconnect_required" : "not_connected");
          setChannels(null);
          return;
        }
        toast.error("Could not load Buffer channels right now.");
        return;
      }
      setChannels((data?.channels as BufferChannel[]) ?? []);
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("buffer-disconnect", { body: {} });
      if (error) {
        toast.error("Could not disconnect Buffer. Please try again.");
        return;
      }
      setConnection(null);
      setChannels(null);
      setState("not_connected");
      toast.success("Buffer disconnected");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Share2 className="h-6 w-6 text-primary" />
          {state === "connected" && <Badge>Connected</Badge>}
          {state === "reconnect_required" && <Badge variant="destructive">Reconnect required</Badge>}
        </div>
        <CardTitle className="text-lg">Social publishing — Buffer</CardTitle>
        <CardDescription>
          Send reviewed campaign post drafts to your own Buffer account as a draft, to the queue, or on a
          schedule. Velocity never publishes automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {configMissing && (
          <p className="text-sm text-muted-foreground" role="status">
            Buffer isn't configured yet. Check back soon.
          </p>
        )}

        {state === "loading" && <p className="text-sm text-muted-foreground">Loading…</p>}

        {(state === "not_connected" || state === "reconnect_required") && !configMissing && (
          <div className="space-y-2">
            {state === "reconnect_required" && (
              <p className="text-sm text-muted-foreground">
                {connection?.last_error || "Your Buffer connection expired. Reconnect to continue."}
              </p>
            )}
            <Button onClick={connect} disabled={busy} size="sm">
              {state === "reconnect_required" ? "Reconnect Buffer" : "Connect Buffer"}
            </Button>
          </div>
        )}

        {state === "connected" && (
          <div className="space-y-3">
            {connection?.connected_at && (
              <p className="text-xs text-muted-foreground">
                Connected {new Date(connection.connected_at).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={refreshChannels} disabled={busy}>
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh channels
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnect} disabled={busy}>
                <Unplug className="h-3 w-3 mr-1" /> Disconnect
              </Button>
            </div>
            {channels && (
              <div className="space-y-1">
                {channels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No Buffer channels found on this account.</p>
                ) : (
                  channels.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{c.service || "channel"}</Badge>
                      <span>{c.displayName || c.name || c.id}</span>
                      {c.isQueuePaused && <span className="text-xs text-muted-foreground">(queue paused)</span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Text-only posts for now. Tokens are stored encrypted on our servers — never in your browser — and you
          can disconnect at any time. You can also revoke access in your Buffer account settings.
        </p>
      </CardContent>
    </Card>
  );
}
