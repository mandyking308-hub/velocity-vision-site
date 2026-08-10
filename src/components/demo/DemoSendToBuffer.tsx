import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, CheckCircle2 } from "lucide-react";

type DemoMode = "draft" | "queue" | "schedule";

const DEMO_CHANNELS = ["Your LinkedIn", "Your Instagram", "Your Facebook", "Your X", "Your TikTok"];

const confirmationFor = (mode: DemoMode): string =>
  mode === "draft" ? "Saved to Buffer draft" : mode === "queue" ? "Added to Buffer queue" : "Scheduled in Buffer";

const DEMO_DRAFT =
  "Outreach does not have to live in five tabs. We put data review, drafts, sender checks and follow-up in one workspace — here is how the first campaign flow works.";

/**
 * Public-demo simulation of the optional Buffer handoff.
 * No OAuth, no API calls — everything here is local, illustrative state only.
 */
export default function DemoSendToBuffer() {
  const [text, setText] = useState(DEMO_DRAFT);
  const [channel, setChannel] = useState(DEMO_CHANNELS[0]);
  const [mode, setMode] = useState<DemoMode>("draft");
  const [dueLocal, setDueLocal] = useState("");
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const confirm = () => {
    setConfirmed(`${confirmationFor(mode)} (demo)`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Optional: send a reviewed draft to your own Buffer
          <Badge variant="outline" className="ml-auto">Demo — example state</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Velocity generates social drafts. You review and edit them, then — if you choose — send one to your own
          Buffer account. You sign in to your own Buffer account. Velocity never uses a shared Buffer account.
        </p>

        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          <Badge variant="secondary">Connected (example)</Badge>
          <span className="text-muted-foreground text-xs">
            In the real workspace this step is “Connect your own Buffer account” via Buffer sign-in. Velocity never
            asks for your social-network passwords.
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-buffer-text">1. Review and edit the generated draft</Label>
          <Textarea
            id="demo-buffer-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setConfirmed(null);
            }}
            rows={4}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>2. Choose one of your Buffer channels</Label>
            <Select
              value={channel}
              onValueChange={(v) => {
                setChannel(v);
                setConfirmed(null);
              }}
            >
              <SelectTrigger aria-label="Buffer channel (demo)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c} (example)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>3. How Buffer should handle it</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Buffer send mode (demo)">
              {(["draft", "queue", "schedule"] as DemoMode[]).map((m) => (
                <Button
                  key={m}
                  type="button"
                  variant={mode === m ? "default" : "outline"}
                  size="sm"
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m);
                    setConfirmed(null);
                  }}
                >
                  {m === "draft" ? "Draft" : m === "queue" ? "Queue" : "Schedule"}
                </Button>
              ))}
            </div>
            {mode === "draft" && <Badge variant="outline">Default — held as a Buffer draft</Badge>}
          </div>
        </div>

        {mode === "schedule" && (
          <div className="space-y-2">
            <Label htmlFor="demo-buffer-due">Schedule for</Label>
            <input
              id="demo-buffer-due"
              type="datetime-local"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={dueLocal}
              onChange={(e) => {
                setDueLocal(e.target.value);
                setConfirmed(null);
              }}
            />
          </div>
        )}

        <Button onClick={confirm} disabled={text.trim().length === 0} className="w-full sm:w-auto">
          {confirmationFor(mode)} — to {channel}
        </Button>

        {confirmed && (
          <p className="flex items-center gap-2 text-sm text-foreground" role="status">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {confirmed} — nothing is published automatically; Buffer’s own approval and channel settings still apply.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
