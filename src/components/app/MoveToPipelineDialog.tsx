import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const STAGES = ["discovery", "demo", "proposal", "negotiation", "won", "lost"] as const;

export interface MoveToPipelineLead {
  id: string;
  name: string | null;
  email: string | null;
  company_id?: string | null;
  contact_id?: string | null;
  campaign_id?: string | null;
}

export default function MoveToPipelineDialog({
  open, onOpenChange, lead, onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead: MoveToPipelineLead | null;
  onDone?: () => void;
}) {
  const tc = useTranslation("common").t;
  const [stage, setStage] = useState<typeof STAGES[number]>("discovery");
  const [value, setValue] = useState("");
  const [close, setClose] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (!lead) return null;

  const submit = async () => {
    setBusy(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const uid = user.user?.id;
      const { data: opp, error } = await supabase
        .from("opportunities")
        .insert({
          stage: stage as any,
          estimated_value: value ? Number(value) : null,
          expected_close_date: close || null,
          notes: notes || null,
          owner_id: uid,
          source_lead_id: lead.id,
          source_campaign_id: lead.campaign_id || null,
          company_id: lead.company_id || null,
          contact_id: lead.contact_id || null,
          service: "Outreach campaign",
          stage_changed_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (error) throw error;

      await supabase.from("leads").update({
        opportunity_id: opp.id,
        follow_up_state: stage === "won" ? "won" : stage === "lost" ? "lost" : "in_pipeline",
        status: stage === "won" ? "closed_won" : stage === "lost" ? "closed_lost" : "demo_scheduled",
        last_action: `Moved to pipeline (${stage})`,
      } as any).eq("id", lead.id);

      if (uid) {
        await supabase.from("lead_audit_log").insert({
          lead_id: lead.id,
          opportunity_id: opp.id,
          user_id: uid,
          action: "moved_to_pipeline",
          details: { stage, value: value || null, close: close || null },
        });
      }

      toast.success("Moved to pipeline");
      onOpenChange(false);
      onDone?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to move to pipeline");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to pipeline — {lead.name || lead.email || "lead"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected value (£)</Label>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div>
            <Label>Expected close date</Label>
            <Input type="date" value={close} onChange={(e) => setClose(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context, requirements, next step…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving…" : "Create opportunity"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
