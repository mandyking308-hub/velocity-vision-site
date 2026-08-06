import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarCheck, Copy, ExternalLink, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDemo } from "@/contexts/DemoContext";
import { BOOKING_SETTING_PATH } from "@/lib/bookingUrl";
import { draftReply, type ReplyCategory } from "@/lib/replyTriage";
import { extractReferral, extractReturnDate, describeReturnDate } from "@/lib/replyReferral";

/**
 * Meeting handoff + referral review.
 *
 * Human-controlled conversion panel. Nothing is sent, no contact is created and
 * no sequence resumes without an explicit click by the operator.
 */
export default function MeetingHandoffPanel({
  lead,
  category,
  replyText,
  bookingUrl,
  readOnly = false,
  onChanged,
}: {
  lead: { id: string; name?: string | null; email?: string | null; workspace_id?: string | null; company_id?: string | null; meeting_booked_at?: string | null; meeting_note?: string | null };
  category: ReplyCategory;
  replyText: string;
  bookingUrl: string | null;
  readOnly?: boolean;
  onChanged?: () => void;
}) {
  const { guardAction } = useDemo();
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState(lead.meeting_note || "");
  const [followUp, setFollowUp] = useState("");

  const referral = useMemo(() => extractReferral(replyText), [replyText]);
  const returnDate = useMemo(() => extractReturnDate(replyText), [replyText]);
  const isConversion = category === "interested" || category === "question" || category === "referral";
  const isOoo = category === "auto_reply";

  if (!isConversion && !isOoo) return null;

  const makeDraft = () => {
    const cta = bookingUrl ? `You can grab a time that suits you here: ${bookingUrl}` : null;
    setDraft(draftReply(category, { firstName: lead.name, cta }));
  };

  const copyBooking = () => {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    toast.success("Booking link copied");
  };

  const markBooked = async () => {
    if (!guardAction("Mark meeting booked")) return;
    if (!when) {
      toast.error("Choose the meeting date and time first");
      return;
    }
    const at = new Date(when);
    if (Number.isNaN(at.getTime())) {
      toast.error("That date and time is not valid");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          meeting_booked_at: at.toISOString(),
          meeting_note: note.trim().slice(0, 2000) || null,
          last_interaction_at: new Date().toISOString(),
          last_action: "Meeting booked",
        } as any)
        .eq("id", lead.id);
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("lead_audit_log").insert({
          lead_id: lead.id,
          user_id: u.user.id,
          workspace_id: lead.workspace_id ?? null,
          action: "meeting_booked",
          details: { meeting_booked_at: at.toISOString(), category, manual: true },
        });
      }
      toast.success("Meeting recorded");
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not record the meeting");
    } finally {
      setBusy(false);
    }
  };

  const saveFollowUp = async () => {
    if (!guardAction("Set follow-up reminder")) return;
    const target = followUp || returnDate;
    if (!target) {
      toast.error("Choose a follow-up date");
      return;
    }
    setBusy(true);
    try {
      const at = new Date(`${target}T09:00:00`);
      const { error } = await supabase
        .from("leads")
        .update({
          follow_up_at: at.toISOString(),
          follow_up_state: "snoozed",
          last_action: `Follow-up reminder set for ${target}`,
        } as any)
        .eq("id", lead.id);
      if (error) throw error;
      toast.success(`Reminder set for ${target}. Nothing is sent automatically.`);
      onChanged?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not set the reminder");
    } finally {
      setBusy(false);
    }
  };

  const reviewReferral = () => {
    const parts = [referral.name, referral.email].filter(Boolean).join(" · ");
    toast.info(
      parts
        ? `Suggested contact: ${parts}. Add them yourself in Data Vault — nothing is created automatically.`
        : "No contact details were clearly stated. Read the reply and decide yourself.",
    );
  };

  return (
    <div className="rounded-md border p-3 space-y-3" data-testid="meeting-handoff">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold flex items-center gap-1.5">
          <CalendarCheck className="h-3.5 w-3.5 text-primary" />
          {isOoo ? "Out of office" : "Move this toward a meeting"}
        </span>
        {lead.meeting_booked_at && (
          <Badge className="bg-emerald-100 text-emerald-700" data-testid="meeting-booked-badge">
            Meeting booked
          </Badge>
        )}
      </div>

      {isOoo ? (
        <div className="space-y-2 text-xs">
          <p className="text-muted-foreground" data-testid="ooo-return">
            {returnDate
              ? describeReturnDate(returnDate)
              : "No return date was clearly stated — choose one yourself if you want a reminder."}
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Follow-up date</Label>
              <Input
                type="date"
                className="h-9 w-[170px]"
                value={followUp || returnDate || ""}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </div>
            {!readOnly && (
              <Button size="sm" variant="outline" disabled={busy} onClick={saveFollowUp}>
                {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                Set reminder
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            A reminder only. No sequence resumes and no email is sent on this date without you.
          </p>
        </div>
      ) : (
        <>
          {category === "referral" && (
            <div className="rounded-md bg-muted/50 p-2.5 text-xs space-y-1.5" data-testid="referral-review">
              <p className="font-medium flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" /> Suggested referral — needs your confirmation
              </p>
              <p className="text-muted-foreground">
                {referral.name ? `Name: ${referral.name}` : "No name clearly stated"}
                {referral.email ? ` · Email: ${referral.email}` : ""}
              </p>
              <p className="text-muted-foreground">
                No contact is created from a reply. Review it, then add them yourself so the source stays
                recorded as a referral from {lead.name || lead.email || "this contact"}.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={reviewReferral}>
                  Review referral
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/app/data-vault">Open Data Vault</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" onClick={makeDraft}>
              Draft reply{bookingUrl ? " with booking link" : ""}
            </Button>
            {bookingUrl ? (
              <Button size="sm" variant="outline" onClick={copyBooking}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy booking link
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild data-testid="booking-link-missing">
                <Link to={BOOKING_SETTING_PATH}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Add a booking link
                </Link>
              </Button>
            )}
          </div>

          {draft && (
            <div className="space-y-1.5">
              <Label className="text-xs">Editable draft — you review and send it from your mailbox</Label>
              <Textarea rows={7} value={draft} onChange={(e) => setDraft(e.target.value)} />
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

          <div className="flex flex-wrap items-end gap-2 pt-1 border-t">
            <div className="space-y-1">
              <Label className="text-xs">Meeting date &amp; time</Label>
              <Input
                type="datetime-local"
                className="h-9 w-[220px]"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div className="space-y-1 flex-1 min-w-[180px]">
              <Label className="text-xs">Note (optional)</Label>
              <Input className="h-9" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
            </div>
            {!readOnly && (
              <Button size="sm" disabled={busy} onClick={markBooked}>
                {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CalendarCheck className="h-3.5 w-3.5 mr-1" />}
                Mark meeting booked
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Nothing is ever sent automatically. Drafts are yours to edit and send.
          </p>
        </>
      )}
    </div>
  );
}
