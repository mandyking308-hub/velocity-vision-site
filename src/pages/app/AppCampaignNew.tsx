import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { CampaignBrief, CampaignGoal, CampaignKind, generatePack, makeSlug } from "@/lib/campaignPack";
import { toast } from "sonner";
import { useCredits } from "@/contexts/CreditsContext";
import { CREDIT_COSTS } from "@/lib/credits";
import {
  CadenceConfig, CADENCE_LABELS, CadenceType, COMMON_TIMEZONES, REFRESH_LABELS,
  RefreshStrategy, computeNextRun, defaultCadence, plainEnglish,
} from "@/lib/cadence";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const GOALS: { id: CampaignGoal; label: string; desc: string }[] = [
  { id: "leads", label: "Leads", desc: "Capture qualified prospects" },
  { id: "sales", label: "Sales", desc: "Close revenue directly" },
  { id: "signups", label: "Sign-ups", desc: "Grow your user base" },
  { id: "bookings", label: "Bookings", desc: "Fill your calendar" },
  { id: "awareness", label: "Awareness", desc: "Reach more people" },
];

const KINDS: { id: CampaignKind; label: string }[] = [
  { id: "lead_gen", label: "Lead generation" },
  { id: "launch", label: "Offer launch" },
  { id: "promo", label: "Promotion" },
  { id: "nurture", label: "Nurture" },
  { id: "re_engagement", label: "Re-engagement" },
  { id: "pr_push", label: "PR push" },
];

const OUTPUTS = [
  { id: "full", label: "Full campaign bundle" },
  { id: "social", label: "Social media pack" },
  { id: "email", label: "Email sequence" },
  { id: "landing", label: "Landing page copy" },
  { id: "press", label: "Press release" },
  { id: "video", label: "Video pack" },
];

const CHANNELS = ["LinkedIn", "Instagram", "X", "Facebook", "TikTok", "Email", "PR", "Paid ads"];

export default function AppCampaignNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentId: workspaceId } = useWorkspace();
  const { remaining, consume, starterExpired } = useCredits();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [brief, setBrief] = useState<CampaignBrief>({
    name: "",
    goal: (params.get("goal") as CampaignGoal) || "leads",
    kind: (params.get("kind") as CampaignKind) || "lead_gen",
    offer: "",
    audience: "",
    industry: "",
    geography: "",
    pricePoint: "",
    tone: "Professional, warm",
    cta: "Book a call",
    channels: ["LinkedIn", "Email"],
    deadline: "",
    notes: "",
    outputs: ["full"],
  });

  const totalSteps = 5;
  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const update = <K extends keyof CampaignBrief>(k: K, v: CampaignBrief[K]) => setBrief((b) => ({ ...b, [k]: v }));

  const generate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const pack = generatePack(brief);
      const slug = makeSlug(brief.name || "campaign");
      const insertRow: any = {
        name: brief.name,
        description: brief.offer,
        goal: brief.goal,
        campaign_kind: brief.kind,
        status: "active",
        type: "marketing",
        owner_id: user.id,
        created_by: user.id,
        workspace_id: workspaceId,
        company_id: null,
        brief,
        pack,
        slug,
        objective: `${brief.goal} — ${brief.cta}`,
        target_audience_description: brief.audience,
      };
      const { data, error } = await (supabase.from("campaigns") as any)
        .insert(insertRow)
        .select("id")
        .single();
      if (error) throw error;
      const ok = await consume("full_campaign_pack", data.id, brief.name);
      if (!ok) {
        // Campaign saved as draft but no credits charged
        toast.message("Campaign saved as draft", { description: "Top up credits to unlock the AI-generated pack." });
      } else {
        toast.success("Campaign pack generated");
      }
      navigate(`/app/campaigns/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate campaign");
    } finally {
      setSaving(false);
    }
  };

  const blocked = remaining < CREDIT_COSTS.full_campaign_pack || starterExpired;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New campaign</h1>
        <p className="text-muted-foreground">A short brief. We generate the full pack.</p>
      </div>
      {blocked && (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <strong>{starterExpired ? "Starter access has ended." : "You don't have enough Campaign Credits."}</strong> Generating a full campaign pack costs {CREDIT_COSTS.full_campaign_pack} credits. <a href="/app/billing" className="underline">Top up or upgrade</a> to keep launching.
        </div>
      )}
      <Progress value={(step / totalSteps) * 100} />
      <div className="text-sm text-muted-foreground">Step {step} of {totalSteps} · This generation will use {CREDIT_COSTS.full_campaign_pack} Campaign Credits</div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>What's the goal?</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={brief.goal} onValueChange={(v) => update("goal", v as CampaignGoal)} className="space-y-2">
              {GOALS.map((g) => (
                <label key={g.id} className="flex items-start gap-3 p-3 rounded-md border border-border cursor-pointer hover:bg-muted">
                  <RadioGroupItem value={g.id} className="mt-1" />
                  <div>
                    <div className="font-medium">{g.label}</div>
                    <div className="text-sm text-muted-foreground">{g.desc}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Tell us about the business</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Campaign name" v={brief.name} on={(v) => update("name", v)} />
            <Field label="Key CTA" v={brief.cta} on={(v) => update("cta", v)} />
            <Field label="Offer / product / service" v={brief.offer} on={(v) => update("offer", v)} full />
            <Field label="Target audience" v={brief.audience} on={(v) => update("audience", v)} />
            <Field label="Industry" v={brief.industry} on={(v) => update("industry", v)} />
            <Field label="Geography" v={brief.geography} on={(v) => update("geography", v)} />
            <Field label="Price point" v={brief.pricePoint} on={(v) => update("pricePoint", v)} />
            <Field label="Tone of voice" v={brief.tone} on={(v) => update("tone", v)} />
            <Field label="Deadline / timing" v={brief.deadline} on={(v) => update("deadline", v)} />
            <div className="md:col-span-2">
              <Label className="mb-2 block">Preferred channels</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((c) => {
                  const on = brief.channels.includes(c);
                  return (
                    <button key={c} type="button" onClick={() => update("channels", on ? brief.channels.filter((x) => x !== c) : [...brief.channels, c])}
                      className={`px-3 py-1 rounded-full text-sm border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Notes / existing assets</Label>
              <Textarea value={brief.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader><CardTitle>What kind of campaign?</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={brief.kind} onValueChange={(v) => update("kind", v as CampaignKind)} className="grid grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <label key={k.id} className="flex items-center gap-3 p-3 rounded-md border border-border cursor-pointer hover:bg-muted">
                  <RadioGroupItem value={k.id} />
                  <span>{k.label}</span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader><CardTitle>What should we generate?</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {OUTPUTS.map((o) => {
              const on = brief.outputs.includes(o.id);
              return (
                <label key={o.id} className="flex items-center gap-3 p-3 rounded-md border border-border cursor-pointer hover:bg-muted">
                  <Checkbox checked={on} onCheckedChange={(v) => update("outputs", v ? [...brief.outputs, o.id] : brief.outputs.filter((x) => x !== o.id))} />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader><CardTitle>Review and generate</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" v={brief.name} />
            <Row label="Goal" v={brief.goal} />
            <Row label="Type" v={brief.kind.replace("_", " ")} />
            <Row label="Offer" v={brief.offer} />
            <Row label="Audience" v={brief.audience} />
            <Row label="Industry" v={brief.industry} />
            <Row label="Geography" v={brief.geography} />
            <Row label="Channels" v={brief.channels.join(", ")} />
            <Row label="Outputs" v={brief.outputs.join(", ")} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < totalSteps ? (
          <Button onClick={next} disabled={step === 2 && (!brief.name || !brief.offer || !brief.audience)}>
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={generate} disabled={saving}>
            <Sparkles className="h-4 w-4 mr-2" /> {saving ? "Generating…" : "Generate campaign pack"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, v, on, full }: { label: string; v: string; on: (v: string) => void; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label>{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{v || <CheckCircle2 className="h-4 w-4 inline text-muted-foreground" />}</span>
    </div>
  );
}
