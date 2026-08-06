import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Inbox, Sparkles, Copy, ShieldOff, MailX, Clock, TrendingUp, Check, Loader2, Info,
} from "lucide-react";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDemo } from "@/contexts/DemoContext";
import {
  classifyReply, draftReply, REPLY_CATEGORIES, REPLY_CATEGORY_ORDER, type ReplyCategory,
} from "@/lib/replyTriage";
import type { ActionLead } from "@/components/app/LeadActionPanel";
import MoveToPipelineDialog, { type MoveToPipelineLead } from "@/components/app/MoveToPipelineDialog";
import MeetingHandoffPanel from "@/components/app/MeetingHandoffPanel";
import { useBookingUrl } from "@/hooks/useBookingUrl";
import { describeWait, isWaitingForFollowUp } from "@/lib/replySla";
import { allowedOverrideCategories, deterministicCompliance, resolveIntent } from "@/lib/replyIntent";

/**
 * Supervised reply triage.
 *
 * Classifies a reply, explains why, and offers the safe next actions. Every
 * action requires an explicit click — nothing is sent, suppressed or promoted
 * automatically, and drafts are always shown for editing rather than sent.
 */
export default function ReplyTriagePanel({
  lead,
  onChanged,
}: {
  lead: ActionLead & { reply_category?: string | null; reply_snippet?: string | null };
  onChanged?: () => void;
}) {
  const { guardAction } = useDemo();
  const { bookingUrl } = useBookingUrl();
  const [text, setText] = useState(lead.reply_snippet || "");
  const [override, setOverride] = useState<ReplyCategory | "">((lead.reply_category as ReplyCategory) || "");
  const [busy, setBusy] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const suggestion = useMemo(() => classifyReply(text), [text]);
  // A deterministic opt-out or bounce in the text can never be downgraded to a
  // sales label, no matter what is stored or chosen manually.
  const complianceLock = useMemo(() => deterministicCompliance(text), [text]);
  const allowedCategories = useMemo(
    () => allowedOverrideCategories({ id: lead.id, reply_snippet: text }),
    [lead.id, text],
  );
  const effectiveOverride: ReplyCategory | "" =
    override && allowedCategories.includes(override) ? override : "";
  const category: ReplyCategory = resolveIntent({
    id: lead.id,
    reply_snippet: text,
    reply_category: effectiveOverride || null,
  });
  const meta = REPLY_CATEGORIES[category];


  const save = async (patch: Record<string, any>, successMsg: string) => {
    if (!guardAction("Reply triage")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("leads").update(patch as any).eq("id", lead.id);
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("lead_audit_log").insert({
          lead_id: lead.id,
          user_id: u.user.id,
          action: "reply_triaged",
          details: {
            category,
            confidence: suggestion.confidence,
            manual: Boolean(override),
            suggested_category: suggestion.category,
            previous_category: lead.reply_category ?? null,
            overridden: Boolean(override) && category !== suggestion.category,
          },
        });
      }
      toast.success(successMsg);
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const saveTriage = () =>
    save(
      {
        reply_category: category,
        reply_snippet: text.slice(0, 4000) || null,
        reply_triaged_at: new Date().toISOString(),
        replied_at: lead.replied_at || new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        last_action: `Reply triaged: ${meta.label}`,
      },
      `Saved as "${meta.label}"`,
    );

  const snooze = (days: number) =>
    save(
      {
        reply_category: category,
        reply_snippet: text.slice(0, 4000) || null,
        reply_triaged_at: new Date().toISOString(),
        snoozed_until: new Date(Date.now() + days * 86400000).toISOString(),
        follow_up_at: new Date(Date.now() + days * 86400000).toISOString(),
        follow_up_state: "snoozed",
        last_action: `Snoozed ${days}d after reply`,
      },
      `Snoozed for ${days} days`,
    );

  /**
   * One supervised suppression path for both an opt-out and a delivery failure.
   * It only ever runs from an explicit click — classification on its own never
   * suppresses anything. The reason distinguishes a compliance request
   * (`reply_optout`) from a technical bounce (`hard_bounce`).
   */
  const suppress = async () => {
    const isBounce = category === "bounce";
    if (!guardAction(isBounce ? "Stop sends after bounce" : "Suppress contact")) return;
    if (!lead.email) {
      toast.error(
        isBounce
          ? "This lead has no email address to stop sends to"
          : "This lead has no email address to suppress",
      );
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("suppressed_emails")
        .upsert(
          { email: lead.email.toLowerCase(), reason: isBounce ? "hard_bounce" : "reply_optout" },
          { onConflict: "email" },
        );
      if (error) throw error;
      const now = new Date().toISOString();
      await supabase
        .from("leads")
        .update({
          reply_category: isBounce ? "bounce" : "unsubscribe",
          reply_snippet: text.slice(0, 4000) || null,
          reply_triaged_at: now,
          follow_up_state: "suppressed",
          last_action: isBounce
            ? "Sending stopped after a delivery failure"
            : "Suppressed at their request",
        } as any)
        .eq("id", lead.id);
      if (isBounce) {
        const { data: u } = await supabase.auth.getUser();
        if (u.user) {
          await supabase.from("lead_audit_log").insert({
            lead_id: lead.id,
            user_id: u.user.id,
            action: "reply_triaged_bounce",
            details: { category: "bounce", reason: "hard_bounce", manual: Boolean(override) },
          });
        }
      }
      toast.success(
        isBounce
          ? "Sends stopped — check the address and correct it before trying again"
          : "Contact suppressed — they will not be contacted again",
      );
      onChanged?.();
    } catch (e: any) {
      toast.error(
        e?.message ||
          (isBounce ? "Could not stop sends to this address" : "Could not suppress this contact"),
      );
    } finally {
      setBusy(false);
    }
  };


  const makeDraft = () => {
    const d = draftReply(category, { firstName: lead.name, cta: null });
    if (!d) {
      toast.info(
        category === "bounce"
          ? "No reply to write — this message never reached a mailbox."
          : "No reply needed for an auto-response.",
      );
      return;
    }
    setDraft(d);
  };


  const mp: MoveToPipelineLead = {
    id: lead.id,
    name: lead.name || null,
    email: lead.email || null,
    campaign_id: lead.campaign_id || null,
    company_id: lead.company_id || null,
    contact_id: lead.contact_id || null,
    workspace_id: lead.workspace_id || null,
    opportunity_id: lead.opportunity_id || null,
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold truncate flex items-center gap-2">
              <Inbox className="h-4 w-4 text-primary shrink-0" />
              {lead.name || lead.email || "Anonymous"}
            </div>
            <div className="text-xs text-muted-foreground truncate">{lead.email || "—"}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={meta.tone}>{meta.label}</Badge>
            <span className="text-[11px] text-muted-foreground">
              {override ? "set by you" : `${suggestion.confidence} confidence`}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`reply-${lead.id}`} className="text-xs">Paste the reply you received</Label>
          <Textarea
            id={`reply-${lead.id}`}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the reply text here — we classify it and suggest a safe next step."
          />
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1.5">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span><b>Suggested:</b> {meta.suggestedAction}</span>
          </div>
          {suggestion.reasons.length > 0 && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{suggestion.reasons.join(" · ")}</span>
            </div>
          )}
          <div className="text-muted-foreground">
            This is a suggestion only. Nothing is sent, suppressed or moved without you choosing it.
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={override || suggestion.category} onValueChange={(v) => setOverride(v as ReplyCategory)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allowedCategories.map((c) => (
                <SelectItem key={c} value={c}>{REPLY_CATEGORIES[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {complianceLock && (
            <p className="text-[11px] text-muted-foreground">
              This reply is {complianceLock === "unsubscribe" ? "an opt-out request" : "a delivery failure"}.
              It cannot be reclassified as a sales reply. You can still correct it between opt-out and
              bounce if the wrong one was detected — every change is recorded.
            </p>
          )}
        </div>


        <div className="flex flex-wrap gap-1.5 pt-1 border-t">
          <Button size="sm" variant="outline" disabled={busy} onClick={saveTriage}>
            {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
            Save triage
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={makeDraft}>
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Draft a reply
          </Button>
          {(meta.actionKey === "move_to_pipeline" || meta.actionKey === "review_referral") && (
            <Button size="sm" disabled={busy} onClick={() => setPipelineOpen(true)}>
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Move to pipeline
            </Button>
          )}
          {(meta.actionKey === "snooze" || meta.actionKey === "ignore") && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => snooze(30)}>
              <Clock className="h-3.5 w-3.5 mr-1" /> Snooze 30 days
            </Button>
          )}
          {meta.actionKey === "suppress" && (
            <Button size="sm" variant="destructive" disabled={busy} onClick={suppress}>
              {category === "bounce" ? (
                <>
                  <MailX className="h-3.5 w-3.5 mr-1" /> Stop sends to this address
                </>
              ) : (
                <>
                  <ShieldOff className="h-3.5 w-3.5 mr-1" /> Suppress now
                </>
              )}
            </Button>
          )}


        </div>

        {isWaitingForFollowUp({ ...(lead as any), reply_category: category }) && (
          <p className="text-xs text-amber-700" data-testid="reply-waiting">
            {describeWait(lead as any)} — no action recorded yet.
          </p>
        )}

        <MeetingHandoffPanel
          lead={lead as any}
          category={category}
          replyText={text}
          bookingUrl={bookingUrl}
          onChanged={onChanged}
        />



        {draft && (
          <div className="space-y-1.5 pt-1 border-t">
            <Label className="text-xs">Editable draft — review before sending from your mailbox</Label>
            <Textarea rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(draft);
                toast.success("Draft copied");
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy draft
            </Button>
          </div>
        )}

        <MoveToPipelineDialog
          open={pipelineOpen}
          onOpenChange={setPipelineOpen}
          lead={mp}
          onDone={() => { setPipelineOpen(false); onChanged?.(); }}
        />
      </CardContent>
    </Card>
  );
}
