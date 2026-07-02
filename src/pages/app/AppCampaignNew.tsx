import { useEffect, useState } from "react";
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
import { CampaignBrief, CampaignGoal, CampaignKind, CampaignLanguage, CampaignPack, CAMPAIGN_LANGUAGES, makeSlug, mergeGeneratedPack } from "@/lib/campaignPack";
import { checkPackQuality } from "@/lib/campaignQuality";
import { formatQualityFailure } from "@/lib/campaignQualityToast";
import { useTranslation } from "react-i18next";
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
  const { remaining, starterExpired, refresh: refreshCredits } = useCredits();
  const [params] = useSearchParams();
  const { i18n, t } = useTranslation("app");
  const defaultLang: CampaignLanguage = (i18n.language?.startsWith("es") ? "es" : "en");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [qualityDebug, setQualityDebug] = useState(false);
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
    language: defaultLang,
  });
  const [cadence, setCadence] = useState<CadenceConfig>(defaultCadence());
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.from("user_roles") as any)
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "founder"]);
      setQualityDebug(!!data?.length);
    })();
  }, [user]);
  const updateCadence = <K extends keyof CadenceConfig>(k: K, v: CadenceConfig[K]) =>
    setCadence((c) => ({ ...c, [k]: v }));

  const totalSteps = 6;
  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const update = <K extends keyof CampaignBrief>(k: K, v: CampaignBrief[K]) => setBrief((b) => ({ ...b, [k]: v }));

  const generate = async () => {
    if (!user) return;
    // Hard credit gate — never insert a campaign if the user cannot pay for it.
    if (remaining < CREDIT_COSTS.full_campaign_pack) {
      toast.error("You don't have enough Campaign Credits", {
        description: `Generating a full campaign pack costs ${CREDIT_COSTS.full_campaign_pack} credits. Top up or upgrade to continue.`,
      });
      return;
    }
    if (starterExpired) {
      toast.error("Starter access has ended", { description: "Upgrade or buy another Starter to keep generating." });
      return;
    }
    setSaving(true);
    try {
      // 1) Server-side credit gate + AI generation (credits are reserved
      // inside the edge function BEFORE the AI call, and auto-refunded
      // if generation fails). No client-side consume() needed.
      let pack: CampaignPack | null = null;
      let usedFallback = false;
      let ledgerId: string | null = null;
      try {
        const { data: aiData, error: aiErr } = await supabase.functions.invoke("generate-campaign-pack", {
          body: { brief },
        });
        if (aiErr) throw aiErr;
        if (aiData?.pack) {
          pack = mergeGeneratedPack(brief, aiData.pack, aiData.generatedAs) as CampaignPack;
          ledgerId = (aiData as any)?.ledgerId ?? null;
        }
      } catch (aiErr: any) {
        const status = aiErr?.status ?? aiErr?.context?.status;
        const code = aiErr?.context?.body ? String(aiErr.context.body) : String(aiErr?.message || "");
        if (status === 402 || /insufficient_credits|starter_expired|no_plan/.test(code)) {
          toast.error("You don't have enough Campaign Credits", {
            description: `Generating a full campaign pack costs ${CREDIT_COSTS.full_campaign_pack} credits. Top up or upgrade to continue.`,
          });
          setSaving(false);
          await refreshCredits();
          return;
        }
        console.warn("AI generation failed, using deterministic fallback", aiErr);
      }
      if (!pack) {
        pack = mergeGeneratedPack(brief, null);
        usedFallback = true;
      }

      // 2) Quality guard. Refund the server-side reservation if the guard fails.
      const quality = checkPackQuality(pack, brief);
      if (!quality.ok) {
        const { title, description } = formatQualityFailure(quality, qualityDebug);
        toast.error(title, { description });
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch (_e) { /* noop */ }
          await refreshCredits();
        }
        setSaving(false);
        return;
      }

      // 3) Persist campaign.
      const slug = makeSlug(brief.name || "campaign");
      const nextRun = computeNextRun(cadence);
      const startIsFuture = cadence.start_at && new Date(cadence.start_at) > new Date();
      const insertRow: any = {
        name: brief.name,
        description: brief.offer,
        goal: brief.goal,
        campaign_kind: brief.kind,
        status: startIsFuture ? "scheduled" : "active",
        type: "email",
        owner_id: user.id,
        created_by: user.id,
        workspace_id: workspaceId,
        company_id: null,
        brief,
        language: brief.language || "en",
        pack,
        slug,
        objective: `${brief.goal} — ${brief.cta}`,
        target_audience_description: brief.audience,
        cadence_type: cadence.cadence_type,
        cadence_interval: cadence.cadence_interval,
        cadence_unit: cadence.cadence_unit,
        start_at: cadence.start_at,
        timezone: cadence.timezone,
        cadence_end_at: cadence.cadence_end_at,
        cadence_max_runs: cadence.cadence_max_runs,
        next_run_at: nextRun ? nextRun.toISOString() : cadence.start_at,
        refresh_strategy: cadence.refresh_strategy,
      };
      const { data, error } = await (supabase.from("campaigns") as any)
        .insert(insertRow)
        .select("id")
        .single();
      if (error) {
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch (_e) { /* noop */ }
        }
        throw error;
      }
      if (ledgerId) {
        try {
          await supabase.rpc("finalise_campaign_credits", { _ledger_id: ledgerId, _ref_id: data.id, _label: brief.name });
        } catch (_e) { /* noop — spend row is already recorded */ }
      }
      await refreshCredits();
      if (usedFallback) {
        toast.success("Campaign pack ready (fallback template used)");
      } else {
        toast.success(t("campaigns.toasts.packGenerated"));
      }
      navigate(`/app/campaigns/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || t("campaigns.toasts.generateFailed"));
    } finally {
      setSaving(false);
    }
  };


  const blocked = remaining < CREDIT_COSTS.full_campaign_pack || starterExpired;
  const schedulePastError =
    cadence.cadence_type === "one_off" &&
    !!cadence.start_at &&
    new Date(cadence.start_at).getTime() <= Date.now();

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
            <Field
              label="Campaign name"
              v={brief.name}
              on={(v) => update("name", v)}
              id="campaign-name"
              name="campaign_name"
              placeholder="e.g. July outreach campaign"
              required
              testId="campaign-name-input"
            />
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
              <Label className="mb-2 block">Output language</Label>
              <Select value={brief.language || "en"} onValueChange={(v) => update("language", v as CampaignLanguage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}{!l.supported && " — falls back to English"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                English and Spanish generate natively. Other languages store metadata and render English copy for now.
              </p>
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
          <CardHeader>
            <CardTitle>Timing and cadence</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">When does this start, and does it repeat?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Cadence</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(Object.keys(CADENCE_LABELS) as CadenceType[]).map((t) => {
                  const on = cadence.cadence_type === t;
                  return (
                    <button key={t} type="button" onClick={() => updateCadence("cadence_type", t)}
                      className={`px-3 py-2 rounded-md text-sm border text-left ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      {CADENCE_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Start date</Label>
                <Input type="date" value={cadence.start_at ? cadence.start_at.slice(0, 10) : ""}
                  onChange={(e) => {
                    const time = cadence.start_at ? cadence.start_at.slice(11, 16) : "09:00";
                    updateCadence("start_at", e.target.value ? new Date(`${e.target.value}T${time}:00`).toISOString() : null);
                  }} />
              </div>
              <div>
                <Label>Start time</Label>
                <Input type="time" value={cadence.start_at ? cadence.start_at.slice(11, 16) : "09:00"}
                  onChange={(e) => {
                    const day = cadence.start_at ? cadence.start_at.slice(0, 10) : new Date().toISOString().slice(0, 10);
                    updateCadence("start_at", new Date(`${day}T${e.target.value}:00`).toISOString());
                  }} />
              </div>
              <div>
                <Label>Timezone</Label>
                <Select value={cadence.timezone} onValueChange={(v) => updateCadence("timezone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {cadence.cadence_type === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Repeat every</Label>
                  <Input type="number" min={1} value={cadence.cadence_interval}
                    onChange={(e) => updateCadence("cadence_interval", Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={cadence.cadence_unit} onValueChange={(v) => updateCadence("cadence_unit", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day(s)</SelectItem>
                      <SelectItem value="week">Week(s)</SelectItem>
                      <SelectItem value="month">Month(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {cadence.cadence_type !== "one_off" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>End date (optional)</Label>
                  <Input type="date" value={cadence.cadence_end_at ? cadence.cadence_end_at.slice(0, 10) : ""}
                    onChange={(e) => updateCadence("cadence_end_at", e.target.value ? new Date(`${e.target.value}T23:59:00`).toISOString() : null)} />
                </div>
                <div>
                  <Label>Max runs (optional)</Label>
                  <Input type="number" min={1} value={cadence.cadence_max_runs ?? ""}
                    onChange={(e) => updateCadence("cadence_max_runs", e.target.value ? parseInt(e.target.value) : null)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Asset strategy for each new run</Label>
                  <Select value={cadence.refresh_strategy} onValueChange={(v) => updateCadence("refresh_strategy", v as RefreshStrategy)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(REFRESH_LABELS) as RefreshStrategy[]).map((s) => (
                        <SelectItem key={s} value={s}>{REFRESH_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="rounded-md bg-muted/60 p-3 text-sm">
              <div className="font-medium mb-1">Schedule preview</div>
              <div className="text-muted-foreground">{plainEnglish(cadence)}</div>
            </div>

            {schedulePastError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                Choose a future campaign date and time.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 6 && (
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
            <Row label="Cadence" v={CADENCE_LABELS[cadence.cadence_type]} />
            <Row label="Schedule" v={plainEnglish(cadence)} />
          </CardContent>
        </Card>
      )}


      <div className="flex justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < totalSteps ? (
          <Button
            data-testid="campaign-next-button"
            onClick={next}
            disabled={step === 2 && (!brief.name || !brief.offer || !brief.audience)}
          >
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button data-testid="campaign-create-button" onClick={generate} disabled={saving || blocked}>
            <Sparkles className="h-4 w-4 mr-2" /> {saving ? "Generating…" : "Generate campaign pack"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label, v, on, full, id, name, placeholder, required, testId,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  full?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  testId?: string;
}) {
  const autoId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label htmlFor={autoId}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={autoId}
        name={name}
        placeholder={placeholder}
        aria-label={label}
        aria-required={required || undefined}
        data-testid={testId}
        value={v}
        onChange={(e) => on(e.target.value)}
      />
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
