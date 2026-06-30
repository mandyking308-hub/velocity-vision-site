import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Mail, MessageSquare, Clock, ArrowRight, Snowflake, Flame,
  CheckCircle2, XCircle, PauseCircle, NotebookPen, Send, TrendingUp, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { deriveFollowUpState, deriveTemperature, STATE_LABEL, STATE_TONE, TEMP_TONE, type LeadLike } from "@/lib/leadStates";
import MoveToPipelineDialog, { type MoveToPipelineLead } from "./MoveToPipelineDialog";

export interface ActionLead extends LeadLike {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  last_email_subject?: string | null;
  last_action?: string | null;
  owner_id?: string | null;
  campaign_id?: string | null;
  company_id?: string | null;
  contact_id?: string | null;
}

async function logAction(leadId: string, action: string, details: any = {}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase.from("lead_audit_log").insert({
    lead_id: leadId, user_id: u.user.id, action, details,
  });
}

export default function LeadActionPanel({
  lead, onChanged, campaignName,
}: {
  lead: ActionLead;
  onChanged?: () => void;
  campaignName?: string | null;
}) {
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const state = deriveFollowUpState(lead);
  const temp = deriveTemperature(lead);

  const update = async (patch: Record<string, any>, action: string, details: any = {}) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("leads").update(patch as any).eq("id", lead.id);
      if (error) throw error;
      await logAction(lead.id, action, details);
      toast.success("Updated");
      onChanged?.();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally { setBusy(false); }
  };

  const markReplied = () => update(
    { replied_at: new Date().toISOString(), follow_up_state: "replied", last_interaction_at: new Date().toISOString(), last_action: "Marked replied" },
    "marked_replied"
  );
  const markFollowedUp = () => update(
    { last_contacted_at: new Date().toISOString(), follow_up_at: null, follow_up_state: "warm", last_action: "Follow-up completed" },
    "followup_completed"
  );
  const snooze = (days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    return update({ snoozed_until: until, follow_up_state: "snoozed", follow_up_at: until, last_action: `Snoozed ${days}d` }, "snoozed", { days });
  };
  const snoozeUntil = (date: Date) => {
    const until = date.toISOString();
    setSnoozeOpen(false);
    return update({ snoozed_until: until, follow_up_state: "snoozed", follow_up_at: until, last_action: `Snoozed until ${format(date, "PP")}` }, "snoozed", { until });
  };
  const markWarm = () => update({ follow_up_state: "warm", last_action: "Marked warm" }, "marked_warm");
  const markDormant = () => update({ follow_up_state: "dormant", last_action: "Marked dormant" }, "marked_dormant");
  const markWon = () => update({ status: "closed_won" as any, follow_up_state: "won", last_action: "Won" }, "marked_won");
  const markLost = () => update({ status: "closed_lost" as any, follow_up_state: "lost", last_action: "Lost" }, "marked_lost");

  const mp: MoveToPipelineLead = {
    id: lead.id, name: lead.name || null, email: lead.email || null,
    campaign_id: lead.campaign_id || null, company_id: lead.company_id || null, contact_id: lead.contact_id || null,
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold truncate">{lead.name || lead.email || "Anonymous"}</div>
            <div className="text-xs text-muted-foreground truncate">{lead.email || "—"}{lead.phone ? ` · ${lead.phone}` : ""}</div>
            {campaignName && <div className="text-xs text-muted-foreground mt-0.5">Source: {campaignName}</div>}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={STATE_TONE[state]}>{STATE_LABEL[state]}</Badge>
            <Badge variant="outline" className={TEMP_TONE[temp]}>
              {temp === "hot" ? <Flame className="h-3 w-3 mr-1" /> : <Snowflake className="h-3 w-3 mr-1" />}
              {temp}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Mini icon={Mail} label="Last email" value={lead.last_email_sent_at ? new Date(lead.last_email_sent_at).toLocaleDateString() : "—"} hint={lead.last_email_subject || undefined} />
          <Mini icon={MessageSquare} label="Last interaction" value={lead.last_interaction_at ? new Date(lead.last_interaction_at).toLocaleDateString() : lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : "—"} />
          <Mini icon={Clock} label="Follow-up due" value={lead.follow_up_at ? new Date(lead.follow_up_at).toLocaleDateString() : "—"} />
          <Mini icon={ArrowRight} label="Next action" value={state === "overdue" ? "Catch up now" : state === "due" ? "Today" : state === "replied" ? "Respond" : state === "in_pipeline" ? "Progress deal" : "Nurture"} />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1 border-t">
          <Quick onClick={markReplied} icon={MessageSquare}>Mark replied</Quick>
          <Quick onClick={markFollowedUp} icon={CheckCircle2}>Followed up</Quick>
          <Quick onClick={() => setPipelineOpen(true)} icon={TrendingUp} primary>Move to pipeline</Quick>
          <Quick onClick={markWarm} icon={Flame}>Warm</Quick>
          <Quick onClick={markDormant} icon={Snowflake}>Dormant</Quick>
          <Quick onClick={() => snooze(3)} icon={PauseCircle}>Snooze 3d</Quick>
          <Quick onClick={() => snooze(7)} icon={PauseCircle}>Snooze 7d</Quick>
          <Quick onClick={markWon} icon={CheckCircle2}>Won</Quick>
          <Quick onClick={markLost} icon={XCircle}>Lost</Quick>
        </div>

        <MoveToPipelineDialog
          open={pipelineOpen}
          onOpenChange={setPipelineOpen}
          lead={mp}
          onDone={() => onChanged?.()}
        />
      </CardContent>
    </Card>
  );
}

function Mini({ icon: Icon, label, value, hint }: any) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-medium text-sm mt-0.5 truncate">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground truncate">{hint}</div>}
    </div>
  );
}

function Quick({ children, onClick, icon: Icon, primary }: any) {
  return (
    <Button size="sm" variant={primary ? "default" : "outline"} className="h-7 text-xs px-2" onClick={onClick}>
      <Icon className="h-3 w-3 mr-1" />{children}
    </Button>
  );
}
