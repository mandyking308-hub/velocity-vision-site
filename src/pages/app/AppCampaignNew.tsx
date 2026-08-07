import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, CalendarClock, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCredits } from "@/contexts/CreditsContext";
import {
  CAMPAIGN_LANGUAGES,
  type CampaignBrief,
  type CampaignGoal,
  type CampaignKind,
  type CampaignLanguage,
  mergeGeneratedPack,
} from "@/lib/campaignPack";
import { checkPackQuality } from "@/lib/campaignQuality";
import { formatQualityFailure } from "@/lib/campaignQualityToast";
import { CREDIT_COSTS, canUseRecurringCadence } from "@/lib/credits";
import {
  COMMON_TIMEZONES,
  defaultCadence,
  plainEnglish,
  type CadenceConfig,
  type CadenceType,
  type CadenceUnit,
} from "@/lib/cadence";
import UpgradeNudge from "@/components/app/UpgradeNudge";

const GOALS: { value: CampaignGoal; label: string }[] = [
  { value: "leads", label: "Generate leads" },
  { value: "sales", label: "Support sales outreach" },
  { value: "signups", label: "Drive sign-ups" },
  { value: "bookings", label: "Encourage bookings" },
  { value: "awareness", label: "Build awareness" },
];

const KINDS: { value: CampaignKind; label: string }[] = [
  { value: "lead_gen", label: "Lead generation" },
  { value: "launch", label: "Offer launch" },
  { value: "promo", label: "Promotion" },
  { value: "nurture", label: "Nurture" },
  { value: "re_engagement", label: "Re-engagement" },
  { value: "pr_push", label: "PR announcement" },
];

const CHANNELS = ["Email", "LinkedIn", "Instagram", "X", "Facebook", "TikTok", "PR", "Video", "Paid ads"];

function normaliseKind(raw: string | null): CampaignKind {
  return KINDS.some((x) => x.value === raw) ? (raw as CampaignKind) : "lead_gen";
}
function normaliseGoal(raw: string | null): CampaignGoal {
  return GOALS.some((x) => x.value === raw) ? (raw as CampaignGoal) : "leads";
}

export default function AppCampaignNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { currentId } = useWorkspace();
  const { plan, remaining, isFreePreview, starterExpired, refresh: refreshCredits } = useCredits();
  const [generating, setGenerating] = useState(false);
  const [freePackUsed, setFreePackUsed] = useState(false);

  const [name, setName] = useState("New campaign");
  const [goal, setGoal] = useState<CampaignGoal>(normaliseGoal(params.get("goal")));
  const [kind, setKind] = useState<CampaignKind>(normaliseKind(params.get("kind")));
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [industry, setIndustry] = useState("");
  const [geography, setGeography] = useState("");
  const [pricePoint, setPricePoint] = useState("");
  const [tone, setTone] = useState("Clear, credible and human");
  const [cta, setCta] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState<CampaignLanguage>("en");
  const [channels, setChannels] = useState<string[]>(["Email", "LinkedIn"]);
  const [cadence, setCadence] = useState<CadenceConfig>(() => defaultCadence());

  const recurringAllowed = canUseRecurringCadence(plan);
  const supportedLanguages = CAMPAIGN_LANGUAGES.filter((x) => x.supported);

  useEffect(() => {
    if (!isFreePreview || !currentId) {
      setFreePackUsed(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from("campaigns").select("id, pack").eq("workspace_id", currentId).not("pack", "is", null).limit(1);
      setFreePackUsed((data?.length ?? 0) > 0);
    })();
  }, [isFreePreview, currentId]);

  useEffect(() => {
    if (!recurringAllowed && cadence.cadence_type !== "one_off") {
      setCadence((c) => ({ ...c, cadence_type: "one_off" }));
    }
  }, [recurringAllowed, cadence.cadence_type]);

  const brief = useMemo<CampaignBrief>(() => ({
    name: name.trim() || "New campaign",
    goal,
    kind,
    offer: offer.trim(),
    audience: audience.trim(),
    industry: industry.trim(),
    geography: geography.trim(),
    pricePoint: pricePoint.trim(),
    tone: tone.trim(),
    cta: cta.trim(),
    channels,
    deadline,
    notes: notes.trim(),
    outputs: ["email", "social", "press", "video", ...(channels.includes("Paid ads") ? ["paid ads"] : [])],
    language,
  }), [name, goal, kind, offer, audience, industry, geography, pricePoint, tone, cta, channels, deadline, notes, language]);

  const canGenerate = Boolean(currentId && brief.offer && brief.audience && brief.cta && channels.length > 0 && !generating);

  const toggleChannel = (channel: string, checked: boolean) => {
    setChannels((current) => checked ? Array.from(new Set([...current, channel])) : current.filter((x) => x !== channel));
  };

  const updateCadenceType = (value: CadenceType) => {
    if (value !== "one_off" && !recurringAllowed) {
      toast.info("Recurring cadence is available on Growth and Agency", { description: "Starter and Free Preview support one-off campaigns only." });
      return;
    }
    setCadence((c) => ({ ...c, cadence_type: value }));
  };

  const generate = async () => {
    if (!canGenerate || !currentId) return;
    if (starterExpired) {
      toast.error("Starter access has ended", { description: "Choose an eligible paid plan before generating another campaign pack." });
      return;
    }
    if (isFreePreview && freePackUsed) {
      toast.info("Free Preview includes one full campaign pack", { description: "Compare paid plans to generate another full pack." });
      return;
    }
    if (remaining < CREDIT_COSTS.full_campaign_pack) {
      toast.info("Not enough Campaign Credits", {
        description: isFreePreview
          ? "Free Preview receives daily free credits up to its balance cap. Wait for the next daily grant or compare paid plans; Free Preview does not accept top-ups."
          : `Full campaign-pack generation costs ${CREDIT_COSTS.full_campaign_pack} credits. Add eligible paid-workspace credits or change plan to continue.`,
      });
      return;
    }

    setGenerating(true);
    let ledgerId: string | null = null;
    try {
      const { data: aiData, error: aiErr } = await supabase.functions.invoke("generate-campaign-pack", { body: { brief } });
      if (aiErr) {
        const status = (aiErr as any)?.status ?? (aiErr as any)?.context?.status;
        const body = (aiErr as any)?.context?.body ? String((aiErr as any).context.body) : String((aiErr as any)?.message || "");
        if (status === 402 || /insufficient_credits|starter_expired|no_plan|free_preview_pack_limit/.test(body)) {
          await refreshCredits();
          if (/free_preview_pack_limit/.test(body)) setFreePackUsed(true);
          toast.info(/free_preview_pack_limit/.test(body) ? "Free Preview includes one full campaign pack" : "Campaign-pack generation is not currently available", {
            description: /free_preview_pack_limit/.test(body)
              ? "Compare paid plans to generate another full pack."
              : isFreePreview
                ? "Wait for the next eligible daily free-credit grant or compare paid plans."
                : "Review your plan and Campaign Credit balance, then try again.",
          });
          return;
        }
        throw aiErr;
      }
      if (!aiData?.pack) throw new Error("Campaign-pack generation returned no pack");

      ledgerId = aiData?.ledgerId ?? null;
      const pack = mergeGeneratedPack(brief, aiData.pack, aiData.generatedAs);
      const quality = checkPackQuality(pack, brief);
      if (!quality.ok) {
        const { title, description } = formatQualityFailure(quality, false);
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* best effort */ }
        }
        await refreshCredits();
        toast.error(title, { description });
        return;
      }

      const cadencePayload = {
        cadence_type: cadence.cadence_type,
        cadence_interval: cadence.cadence_interval,
        cadence_unit: cadence.cadence_unit,
        start_at: cadence.start_at,
        timezone: cadence.timezone,
        cadence_end_at: cadence.cadence_end_at,
        cadence_max_runs: cadence.cadence_max_runs,
        refresh_strategy: cadence.refresh_strategy,
        next_run_at: cadence.start_at,
      };

      const { data: created, error: insertError } = await supabase.from("campaigns").insert({
        name: brief.name,
        goal: brief.goal,
        campaign_kind: brief.kind,
        brief: brief as any,
        pack: pack as any,
        workspace_id: currentId,
        status: "draft",
        ...cadencePayload,
      } as any).select("id").single();

      if (insertError || !created?.id) {
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* best effort */ }
        }
        throw insertError || new Error("Campaign could not be saved");
      }

      if (ledgerId) {
        try { await supabase.rpc("finalise_campaign_credits", { _ledger_id: ledgerId, _ref_id: created.id, _label: brief.name }); } catch { /* best effort */ }
      }
      await refreshCredits();
      if (isFreePreview) setFreePackUsed(true);
      toast.success("Campaign pack generated and saved as a draft");
      navigate(`/app/campaigns/${created.id}`);
    } catch (error: any) {
      if (ledgerId) {
        try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* best effort */ }
        await refreshCredits();
      }
      toast.error("Could not generate the campaign pack", { description: error?.message || "Please try again later." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => navigate("/app/campaigns")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> All campaigns</button>
      <div>
        <h1 className="text-3xl font-bold">Create a campaign</h1>
        <p className="text-muted-foreground mt-1">Define the brief, choose the campaign language and channels, then generate one editable full campaign pack. The server reserves Campaign Credits before generation; there is no uncharged fallback pack.</p>
      </div>

      {isFreePreview && freePackUsed && <UpgradeNudge reason="free_preview_second_pack_gate" variant="card" />}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Campaign brief</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Campaign name"><Input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} /></Field>
              <Field label="Campaign type"><Select value={kind} onValueChange={(v) => setKind(v as CampaignKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{KINDS.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Goal"><Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GOALS.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Campaign language"><Select value={language} onValueChange={(v) => setLanguage(v as CampaignLanguage)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{supportedLanguages.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}</SelectContent></Select></Field>
            </div>
            <Field label="Offer / proposition *"><Textarea value={offer} onChange={(e) => setOffer(e.target.value)} rows={3} maxLength={1500} placeholder="What are you offering, and what should the reader understand?" /></Field>
            <Field label="Audience *"><Textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={3} maxLength={1500} placeholder="Describe the business audience using data you are authorised to process." /></Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Industry"><Input value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={200} /></Field>
              <Field label="Geography"><Input value={geography} onChange={(e) => setGeography(e.target.value)} maxLength={200} /></Field>
              <Field label="Price point / commercial context"><Input value={pricePoint} onChange={(e) => setPricePoint(e.target.value)} maxLength={200} /></Field>
              <Field label="Deadline"><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
            </div>
            <Field label="Tone"><Input value={tone} onChange={(e) => setTone(e.target.value)} maxLength={240} /></Field>
            <Field label="Single call to action *"><Input value={cta} onChange={(e) => setCta(e.target.value)} maxLength={300} placeholder="e.g. Reply if a short walkthrough would be useful" /></Field>
            <Field label="Additional notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1500} /></Field>

            <div>
              <Label>Channels *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {CHANNELS.map((channel) => <label key={channel} className="flex items-center gap-2 rounded border p-2 text-sm"><Checkbox checked={channels.includes(channel)} onCheckedChange={(v) => toggleChannel(channel, !!v)} />{channel}</label>)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Generated materials are editable drafts. Velocity Vision does not publish social posts, buy media or send outreach automatically.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Cadence</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="Cadence type"><Select value={cadence.cadence_type} onValueChange={(v) => updateCadenceType(v as CadenceType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one_off">One-off</SelectItem><SelectItem value="weekly" disabled={!recurringAllowed}>Weekly</SelectItem><SelectItem value="monthly" disabled={!recurringAllowed}>Monthly</SelectItem><SelectItem value="custom" disabled={!recurringAllowed}>Custom recurring</SelectItem></SelectContent></Select></Field>
              {cadence.cadence_type === "custom" && <div className="grid grid-cols-2 gap-2"><Field label="Every"><Input type="number" min={1} max={52} value={cadence.cadence_interval} onChange={(e) => setCadence((c) => ({ ...c, cadence_interval: Math.max(1, Number(e.target.value) || 1) }))} /></Field><Field label="Unit"><Select value={cadence.cadence_unit} onValueChange={(v) => setCadence((c) => ({ ...c, cadence_unit: v as CadenceUnit }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent></Select></Field></div>}
              <Field label="First review date"><Input type="datetime-local" value={cadence.start_at ? toLocalInput(cadence.start_at) : ""} onChange={(e) => setCadence((c) => ({ ...c, start_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} /></Field>
              <Field label="Time zone"><Select value={cadence.timezone} onValueChange={(v) => setCadence((c) => ({ ...c, timezone: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMMON_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent></Select></Field>
              <p className="text-xs text-muted-foreground">{plainEnglish(cadence)}</p>
              {!recurringAllowed && <p className="text-xs text-muted-foreground">Recurring cadence is available on Growth and Agency. Starter and Free Preview are one-off only.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Before generation</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Full campaign-pack generation costs <strong className="text-foreground">{CREDIT_COSTS.full_campaign_pack} Campaign Credits</strong>.</p>
              <p>Current balance: <strong className="text-foreground">{remaining}</strong>.</p>
              <p>Free Preview is capped at one full campaign pack and cannot buy top-ups.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Generation creates drafts, not a live campaign</AlertTitle>
        <AlertDescription>After generation, review the pack and record human approval. Activation preparation and live sending are separate customer-controlled steps with their own checks.</AlertDescription>
      </Alert>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/app/campaigns")}>Cancel</Button>
        <Button size="lg" onClick={generate} disabled={!canGenerate || (isFreePreview && freePackUsed)}>{generating ? "Generating…" : <>Generate full pack <ArrowRight className="h-4 w-4 ml-2" /></>}</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
