import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  BufferPostMode,
  bufferServiceHint,
  confirmationForMode,
  isFutureIso,
  localDateTimeToIso,
} from "../../../supabase/functions/_shared/buffer-shared";

interface BufferChannel {
  id: string;
  name: string | null;
  displayName: string | null;
  service: string | null;
  isQueuePaused: boolean | null;
}

type LoadState = "idle" | "loading" | "ready" | "disconnected" | "error";

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

export default function SendToBufferDialog({ platform, defaultText }: { platform: string; defaultText: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);
  const [mode, setMode] = useState<BufferPostMode>("draft");
  const [dueLocal, setDueLocal] = useState("");
  const [channels, setChannels] = useState<BufferChannel[]>([]);
  const [channelId, setChannelId] = useState<string>("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [sending, setSending] = useState(false);

  const hint = bufferServiceHint(platform);

  // Recommended channels first; if the service hint matches nothing the
  // customer deliberately picks from all available channels — never dead-end.
  const ordered = useMemo(() => {
    if (!hint) return channels;
    const recommended = channels.filter((c) => c.service === hint);
    const rest = channels.filter((c) => c.service !== hint);
    return [...recommended, ...rest];
  }, [channels, hint]);

  const isRecommended = (c: BufferChannel) => hint !== null && c.service === hint;

  useEffect(() => {
    if (!open || loadState !== "idle") return;
    setLoadState("loading");
    supabase.functions
      .invoke("buffer-channels", { body: {} })
      .then(async ({ data, error }) => {
        if (error) {
          const code = await invokeError(error);
          setLoadState(code === "not_connected" || code === "reconnect_required" ? "disconnected" : "error");
          return;
        }
        const list = ((data?.channels as BufferChannel[]) ?? []) as BufferChannel[];
        setChannels(list);
        // Preselect the first recommended channel when available.
        const first = (hint ? list.find((c) => c.service === hint) : undefined) ?? list[0];
        if (first) setChannelId(first.id);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [open, loadState, hint]);

  const dueIso = mode === "schedule" ? localDateTimeToIso(dueLocal) : null;
  const canSend =
    loadState === "ready" &&
    !!channelId &&
    text.trim().length > 0 &&
    (mode !== "schedule" || (dueIso !== null && isFutureIso(dueIso)));

  const send = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("buffer-create-post", {
        body: { channelId, text: text.trim(), mode, dueAt: dueIso },
      });
      if (error) {
        const code = await invokeError(error);
        if (code === "not_connected" || code === "reconnect_required") {
          setLoadState("disconnected");
          return;
        }
        if (code === "invalid_channel") {
          toast.error("That Buffer channel is no longer available. Refresh and choose again.");
          return;
        }
        toast.error("Buffer could not save this post. Please try again.");
        return;
      }
      // Buffer may force drafts/approval itself — trust the server's message.
      toast.success(data?.message || confirmationForMode(mode));
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Send to Buffer">
          <Share2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send to Buffer</DialogTitle>
          <DialogDescription>
            Review and edit the draft, then choose how Buffer should handle it. Nothing is published
            automatically.
          </DialogDescription>
        </DialogHeader>

        {loadState === "disconnected" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Buffer account before sending post drafts.
            </p>
            <Button asChild size="sm">
              <Link to="/app/settings">Connect Buffer in Settings</Link>
            </Button>
          </div>
        )}

        {loadState === "loading" && <p className="text-sm text-muted-foreground">Loading Buffer channels…</p>}
        {loadState === "error" && (
          <p className="text-sm text-muted-foreground">Could not reach Buffer right now. Please try again.</p>
        )}

        {loadState === "ready" && channels.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No Buffer channels found. Add a social channel in Buffer first, then refresh.
          </p>
        )}

        {loadState === "ready" && channels.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buffer-post-text">Post text</Label>
              <Textarea
                id="buffer-post-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                maxLength={4000}
              />
            </div>

            <div className="space-y-2">
              <Label>Buffer channel</Label>
              <Select value={channelId} onValueChange={setChannelId}>
                <SelectTrigger aria-label="Buffer channel">
                  <SelectValue placeholder="Choose a channel" />
                </SelectTrigger>
                <SelectContent>
                  {ordered.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName || c.name || c.id}
                      {c.service ? ` (${c.service})` : ""}
                      {isRecommended(c) ? " — recommended" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hint && !channels.some((c) => c.service === hint) && (
                <p className="text-xs text-muted-foreground">
                  No {platform} channel found in Buffer — pick any channel you want to use instead.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>How Buffer should handle it</Label>
              <div className="flex gap-2" role="radiogroup" aria-label="Buffer send mode">
                {(["draft", "queue", "schedule"] as BufferPostMode[]).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={mode === m ? "default" : "outline"}
                    size="sm"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                  >
                    {m === "draft" ? "Draft" : m === "queue" ? "Queue" : "Schedule"}
                  </Button>
                ))}
              </div>
              {mode === "draft" && <Badge variant="outline">Default — safest: held as a Buffer draft</Badge>}
            </div>

            {mode === "schedule" && (
              <div className="space-y-2">
                <Label htmlFor="buffer-due-at">Schedule for</Label>
                <input
                  id="buffer-due-at"
                  type="datetime-local"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={dueLocal}
                  onChange={(e) => setDueLocal(e.target.value)}
                />
                {dueLocal && !isFutureIso(dueIso) && (
                  <p className="text-xs text-destructive">Pick a time in the future.</p>
                )}
              </div>
            )}

            <Button onClick={send} disabled={!canSend || sending} className="w-full">
              {sending ? "Sending…" : confirmationForMode(mode)}
            </Button>
            <p className="text-xs text-muted-foreground">
              Velocity hands this text to Buffer as you choose — Buffer's own channel settings still apply, and
              nothing goes live without your say-so there.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
