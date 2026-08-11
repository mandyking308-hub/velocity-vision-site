import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, ShieldCheck, ClipboardList, Save, Loader2, AlertCircle, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CopilotEmailStep, CopilotPlan } from "@/lib/copilotBrief";

/**
 * Read-only summary of what the Copilot produced: objective, ICP, offer angle,
 * channel handoff tasks, personalization variables and the compliance note.
 */
export function CopilotPlanCard({ plan }: { plan: CopilotPlan }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Copilot plan
          <Badge variant={plan.source === "ai" ? "outline" : "secondary"} className="ml-auto">
            {plan.source === "ai" ? "AI draft" : plan.source === "sample" ? "Sample" : "Manual starter"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {plan.source === "manual_starter" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>This is a manual starter, not an AI draft</AlertTitle>
            <AlertDescription>
              AI drafting wasn't available when this was created, so we saved a structure with editable placeholders
              marked <code className="bg-muted px-1 rounded">[EDIT]</code>. Your brief was kept in full.
            </AlertDescription>
          </Alert>
        )}

        <Row label="Objective" value={plan.objective} />
        <Row label="ICP summary" value={plan.icpSummary} />
        <Row label="Offer angle" value={plan.offerAngle} />
        {plan.proof && <Row label="Proof supplied" value={plan.proof} />}
        {plan.constraints && <Row label="Must avoid" value={plan.constraints} />}

        {plan.manualTasks.length > 0 && (
          <div>
            <div className="text-xs font-medium flex items-center gap-2 mb-1.5">
              <ClipboardList className="h-4 w-4 text-primary" /> Channel handoff tasks
            </div>
            <ul className="space-y-1.5">
              {plan.manualTasks.map((t) => (
                <li key={t.channel} className="rounded-md border border-border p-2">
                  <span className="font-medium">{t.channel}</span>
                  <span className="text-muted-foreground block text-xs">{t.task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="text-xs font-medium mb-1.5">Personalization variables</div>
          <ul className="text-xs space-y-1">
            {plan.variables.map((v) => (
              <li key={v.token} className="flex flex-wrap gap-x-2">
                <code className="bg-muted px-1 rounded">{v.token}</code>
                <span className="text-muted-foreground">{v.label} — falls back to "{v.fallback}"</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs flex gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{plan.complianceNote}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Editable three-step sequence. Saves subject/body back into the existing
 * `campaigns.pack.emails` and the step delays into `campaigns.brief.copilot`.
 * Editing never sends anything.
 */
export function CopilotSequenceEditor({
  campaignId, plan, brief, pack, onSaved,
}: {
  campaignId: string;
  plan: CopilotPlan;
  brief: any;
  pack: any;
  onSaved?: (next: { brief: any; pack: any }) => void;
}) {
  const [steps, setSteps] = useState<CopilotEmailStep[]>(plan.emailSteps);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (i: number, patch: Partial<CopilotEmailStep>) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const emails = [...(pack?.emails ?? [])];
      steps.forEach((s, i) => {
        emails[i] = { ...(emails[i] ?? {}), subject: s.subject, body: s.body, preview: emails[i]?.preview ?? "" };
      });
      const nextPack = { ...pack, emails };
      const nextBrief = { ...brief, copilot: { ...plan, emailSteps: steps } };
      const { error } = await (supabase.from("campaigns") as any)
        .update({ pack: nextPack, brief: nextBrief }).eq("id", campaignId);
      if (error) throw error;
      setDirty(false);
      onSaved?.({ brief: nextBrief, pack: nextPack });
      toast.success("Sequence saved", { description: "Still a draft — nothing has been sent." });
    } catch (e: any) {
      toast.error(e?.message || "Could not save the sequence");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-primary" /> Edit sequence
          <Button size="sm" className="ml-auto" disabled={!dirty || saving} onClick={save}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {dirty ? "Save changes" : "Saved"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {steps.map((s, i) => (
          <div key={i} className="rounded-md border border-border p-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Step {i + 1}</Badge>
              <span className="text-xs text-muted-foreground">{s.purpose}</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`seq-sub-${i}`}>Subject</Label>
              <Input id={`seq-sub-${i}`} value={s.subject} onChange={(e) => update(i, { subject: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`seq-body-${i}`}>Body</Label>
              <Textarea id={`seq-body-${i}`} rows={7} value={s.body} onChange={(e) => update(i, { body: e.target.value })} />
            </div>
            <div className="space-y-1.5 max-w-[16rem]">
              <Label htmlFor={`seq-delay-${i}`}>
                {i === 0 ? "Send day" : "Suggested delay after the previous step (days)"}
              </Label>
              <Input
                id={`seq-delay-${i}`}
                type="number"
                min={0}
                max={90}
                disabled={i === 0}
                value={s.delayDays}
                onChange={(e) => update(i, { delayDays: Math.max(0, Math.min(90, Number(e.target.value) || 0)) })}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Delays are a suggestion for when you schedule each step. Saving here changes the draft only.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <div className="w-32 shrink-0 text-xs text-muted-foreground pt-0.5">{label}</div>
      <div className="flex-1 min-w-0 break-words">{value || "—"}</div>
    </div>
  );
}
