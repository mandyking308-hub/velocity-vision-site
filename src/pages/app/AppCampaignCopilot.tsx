import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, ArrowRight, Wand2, FlaskConical, Loader2, AlertCircle, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useDemo } from "@/contexts/DemoContext";
import { CREDIT_COSTS } from "@/lib/credits";
import { mergeGeneratedPack, type CampaignPack } from "@/lib/campaignPack";
import { checkPackQuality } from "@/lib/campaignQuality";
import { formatQualityFailure } from "@/lib/campaignQualityToast";
import { SAMPLE_BRIEF } from "@/lib/sampleCampaign";
import {
  COPILOT_CHANNELS, COPILOT_CTA_OPTIONS, COPILOT_DATA_SOURCE_LABEL, COPILOT_GOALS, COPILOT_TONES,
  COPILOT_VARIABLES, EMPTY_COPILOT_INPUT, buildCampaignInsert, buildCopilotPlan, canCreateFromCopilot,
  clearCopilotDraft, draftHasContent, loadCopilotDraft, saveCopilotDraft, toCampaignBrief,
  validateCopilotInput, type CopilotInput, type CopilotSource,
} from "@/lib/copilotBrief";

/**
 * First-Campaign Copilot.
 *
 * A guided, plain-English path from "I have nothing" to an editable campaign
 * draft. It reuses the existing generation edge function, quality guard, credit
 * ledger and campaigns table — it does not fork them. Output is always a draft:
 * activation stays behind the existing preflight and approval gate.
 */

const STEPS = [
  { key: "offer", title: "What you're offering" },
  { key: "audience", title: "Who you're contacting" },
  { key: "goal", title: "Goal and next step" },
  { key: "channels", title: "Channels and proof" },
  { key: "confirm", title: "Confirm and build" },
] as const;

export default function AppCampaignCopilot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentId: workspaceId } = useWorkspace();
  const { refresh: refreshCredits } = useCredits();
  const { guardAction } = useDemo();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [prefilled, setPrefilled] = useState<string[]>([]);
  const [input, setInput] = useState<CopilotInput>(() => loadCopilotDraft() ?? EMPTY_COPILOT_INPUT);
  const prefillDone = useRef(false);

  const set = <K extends keyof CopilotInput>(k: K, v: CopilotInput[K]) =>
    setInput((prev) => ({ ...prev, [k]: v }));

  // Tell the user we brought their work back rather than silently repopulating.
  useEffect(() => {
    if (draftHasContent(loadCopilotDraft() ?? EMPTY_COPILOT_INPUT)) setRestored(true);
  }, []);

  // Prefill from the workspace and profile. Never overwrite anything typed.
  useEffect(() => {
    if (!user || !workspaceId || prefillDone.current) return;
    prefillDone.current = true;
    (async () => {
      const [{ data: ws }, { data: profile }] = await Promise.all([
        supabase.from("client_workspaces").select("name, industry, website, default_country").eq("id", workspaceId).maybeSingle(),
        supabase.from("profiles").select("first_name, last_name").eq("user_id", user.id).maybeSingle(),
      ]);
      const filled: string[] = [];
      setInput((prev) => {
        const next = { ...prev };
        if (!next.website.trim() && ws?.website) { next.website = ws.website; filled.push("website"); }
        if (!next.industry.trim() && ws?.industry) { next.industry = ws.industry; filled.push("industry"); }
        if (!next.geography.trim() && ws?.default_country) { next.geography = ws.default_country; filled.push("location"); }
        return next;
      });
      if (filled.length) setPrefilled(filled);
      void profile;
    })();
  }, [user, workspaceId]);

  // Persist on every change so a failed call, refresh or accidental back never loses work.
  useEffect(() => {
    if (draftHasContent(input)) saveCopilotDraft(input);
  }, [input]);

  const issues = useMemo(() => validateCopilotInput(input), [input]);
  const issueFor = (field: keyof CopilotInput) => issues.find((i) => i.field === field)?.message;

  const stepValid = (): boolean => {
    if (step === 0) return !issueFor("offer");
    if (step === 1) return !issueFor("audience");
    if (step === 3) return !issueFor("channels");
    return true;
  };

  const toggleChannel = (id: string) =>
    setInput((prev) => ({
      ...prev,
      channels: prev.channels.includes(id) ? prev.channels.filter((c) => c !== id) : [...prev.channels, id],
    }));

  const startOver = () => {
    clearCopilotDraft();
    setInput(EMPTY_COPILOT_INPUT);
    setRestored(false);
    setError(null);
    setStep(0);
    prefillDone.current = false;
  };

  const create = async (opts: { sample: boolean }) => {
    if (!guardAction("Create campaign")) return;
    if (!user) { toast.error("Please sign in first"); return; }
    if (!opts.sample && !canCreateFromCopilot(input)) {
      setError(validateCopilotInput(input)[0]?.message ?? "Please complete the brief.");
      return;
    }

    setError(null);
    setBusy(true);
    setBusyLabel(opts.sample ? "Building your sample campaign…" : "Drafting your campaign…");
    try {
      const briefInput: CopilotInput = opts.sample
        ? { ...EMPTY_COPILOT_INPUT, ...SAMPLE_BRIEF as any, name: SAMPLE_BRIEF.name, channels: ["Email"], proof: "", constraints: "", dataSourceConfirmed: true }
        : input;
      const brief = opts.sample ? { ...SAMPLE_BRIEF } : toCampaignBrief(input);

      let pack: CampaignPack | null = null;
      let ledgerId: string | null = null;
      let source: CopilotSource = opts.sample ? "sample" : "ai";

      if (opts.sample) {
        // Sample drafts never call the model, never spend credits and can never send.
        pack = mergeGeneratedPack(brief, null) as CampaignPack;
      } else {
        try {
          const { data, error: fnError } = await supabase.functions.invoke("generate-campaign-pack", { body: { brief } });
          if (fnError) throw fnError;
          if (data?.pack) {
            pack = mergeGeneratedPack(brief, data.pack, data.generatedAs) as CampaignPack;
            ledgerId = (data as any)?.ledgerId ?? null;
          }
        } catch (aiErr: any) {
          const status = aiErr?.status ?? aiErr?.context?.status;
          const code = String(aiErr?.context?.body ?? aiErr?.message ?? "");
          if (/free_preview_pack_limit/.test(code)) {
            setError("Free Preview includes one full campaign pack. Your first pack stays available to review — upgrade to generate more. Your brief has been saved.");
            setBusy(false);
            await refreshCredits();
            return;
          }
          if (status === 402 || /insufficient_credits|starter_expired|no_plan/.test(code)) {
            setError(`A full campaign pack costs ${CREDIT_COSTS.full_campaign_pack} credits. Choose a paid plan or try the sample path. Your brief has been saved.`);
            setBusy(false);
            await refreshCredits();
            return;
          }
          console.warn("Copilot AI generation unavailable — building a manual starter", aiErr);
        }
        if (!pack) {
          // AI unavailable: hand back a clearly-labelled manual starter with the
          // user's brief intact rather than nothing at all.
          pack = mergeGeneratedPack(brief, null) as CampaignPack;
          source = "manual_starter";
        }
      }

      // The quality guard exists so we never charge for weak AI output. It is
      // tuned for generated copy, so it only applies to the paid AI path — a
      // manual starter or sample is explicitly labelled placeholder content and
      // must still reach the user rather than leaving them with nothing.
      if (source === "ai") {
        const quality = checkPackQuality(pack, brief);
        if (!quality.ok) {
          const { title, description } = formatQualityFailure(quality, false);
          setError(`${title} ${description ?? ""}`.trim());
          if (ledgerId) {
            try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* noop */ }
            await refreshCredits();
          }
          setBusy(false);
          return;
        }
      }


      const plan = buildCopilotPlan({ input: briefInput, brief, pack, source });
      const payload = buildCampaignInsert({ brief, pack, plan, userId: user.id, workspaceId, sample: opts.sample });

      const { data: row, error: insertError } = await (supabase.from("campaigns") as any)
        .insert(payload).select("id").single();
      if (insertError) {
        if (ledgerId) { try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* noop */ } }
        throw insertError;
      }
      if (ledgerId) {
        try { await supabase.rpc("finalise_campaign_credits", { _ledger_id: ledgerId, _ref_id: row.id, _label: brief.name }); } catch { /* noop */ }
      }
      await refreshCredits();
      clearCopilotDraft();

      toast.success(
        source === "sample" ? "Sample campaign created — explore and edit it freely"
          : source === "manual_starter" ? "Manual starter created — AI drafting was unavailable"
          : "Draft ready to review",
        { description: "Every word is editable. Nothing sends until you approve it." },
      );
      navigate(`/app/campaigns/${row.id}`);
    } catch (e: any) {
      setError(e?.message || "We couldn't create the campaign. Your brief has been saved — try again.");
    } finally {
      setBusy(false);
      setBusyLabel("");
    }
  };

  return (
    <div className="copilot-safe-bottom p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate("/app")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
      </Button>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary shrink-0" /> Build my first campaign
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A few short questions. We turn them into an editable draft — you review every word before anything is sent.
        </p>
      </div>

      {restored && (
        <Alert>
          <RotateCcw className="h-4 w-4" />
          <AlertTitle>We brought your unfinished brief back</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            Nothing was lost.
            <Button variant="link" size="sm" className="h-auto p-0" onClick={startOver}>Start over instead</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-dashed">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" /> Nothing to hand yet?
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Build a fully worked sample campaign with example data. No contacts needed, no credits used, and it can never be sent.
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto shrink-0" disabled={busy} onClick={() => create({ sample: true })}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Use sample data
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">Step {step + 1} of {STEPS.length}</span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>We couldn't finish that</AlertTitle>
          <AlertDescription>{error} Your answers are saved — fix the issue and try again.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{STEPS[step].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cp-offer">In plain English, what are you offering?</Label>
                <p className="text-xs text-muted-foreground">Describe what the recipient actually gets. The clearer this is, the better the draft.</p>
                <Textarea id="cp-offer" rows={5} value={input.offer} onChange={(e) => set("offer", e.target.value)}
                  placeholder="A short operations review that produces a written summary of where their follow-up process loses time." />
                {issueFor("offer") && <p className="text-xs text-destructive">{issueFor("offer")}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-web">Your website or company context (optional)</Label>
                <Input id="cp-web" value={input.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" />
                {prefilled.includes("website") && <p className="text-xs text-muted-foreground">Filled in from your workspace — edit if it's wrong.</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-name">Campaign name (optional)</Label>
                <Input id="cp-name" value={input.name} onChange={(e) => set("name", e.target.value)} placeholder="Q3 outreach — operations leads" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cp-audience">Who are you contacting?</Label>
                <p className="text-xs text-muted-foreground">Role, company type and size. Be specific.</p>
                <Textarea id="cp-audience" rows={4} value={input.audience} onChange={(e) => set("audience", e.target.value)}
                  placeholder="Operations leads at UK service businesses with 5–50 staff." />
                {issueFor("audience") && <p className="text-xs text-destructive">{issueFor("audience")}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cp-industry">Their industry (optional)</Label>
                  <Input id="cp-industry" value={input.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Professional services" />
                  {prefilled.includes("industry") && <p className="text-xs text-muted-foreground">From your workspace.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp-geo">Where are they? (optional)</Label>
                  <Input id="cp-geo" value={input.geography} onChange={(e) => set("geography", e.target.value)} placeholder="United States" />
                  {prefilled.includes("location") && <p className="text-xs text-muted-foreground">From your workspace.</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What should this campaign achieve?</Label>
                <div className="grid gap-2">
                  {COPILOT_GOALS.map((g) => (
                    <button key={g.value} type="button" onClick={() => set("goal", g.value)}
                      className={`text-left rounded-md border p-3 transition ${input.goal === g.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <div className="text-sm font-medium">{g.label}</div>
                      <div className="text-xs text-muted-foreground">{g.help}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>What should they do next?</Label>
                <p className="text-xs text-muted-foreground">One call to action, used word-for-word. We never invent a different one.</p>
                <Select value={input.cta} onValueChange={(v) => set("cta", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COPILOT_CTA_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tone of voice</Label>
                <Select value={input.tone} onValueChange={(v) => set("tone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COPILOT_TONES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Which channels should we draft for?</Label>
                <p className="text-xs text-muted-foreground">
                  Only email is sent by the platform, from your own connected mailbox. Social channels are drafted for review; external Buffer handoff is available only after moving to an eligible paid plan, and you control scheduling and publishing there. Press and paid ads stay manual.
                </p>
                <div className="grid gap-2">
                  {COPILOT_CHANNELS.map((c) => (
                    <label key={c.id} className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition ${input.channels.includes(c.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <Checkbox checked={input.channels.includes(c.id)} onCheckedChange={() => toggleChannel(c.id)} className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="text-sm font-medium block">{c.label}</span>
                        <span className="text-xs text-muted-foreground block">{c.help}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {issueFor("channels") && <p className="text-xs text-destructive">{issueFor("channels")}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-proof">Proof you can stand behind (optional)</Label>
                <p className="text-xs text-muted-foreground">A real example or credential. We won't invent results or add performance claims.</p>
                <Textarea id="cp-proof" rows={3} value={input.proof} onChange={(e) => set("proof", e.target.value)}
                  placeholder="We've run this review for 12 service businesses in the last year." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-constraints">Anything the draft must avoid? (optional)</Label>
                <Textarea id="cp-constraints" rows={2} value={input.constraints} onChange={(e) => set("constraints", e.target.value)}
                  placeholder="No pricing, no mention of competitors." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <Summary label="Offer" value={input.offer.trim() || "—"} />
              <Summary label="Audience" value={input.audience.trim() || "—"} />
              <Summary label="Goal" value={COPILOT_GOALS.find((g) => g.value === input.goal)?.label ?? input.goal} />
              <Summary label="Call to action" value={input.cta} />
              <Summary label="Tone" value={input.tone} />
              <Summary label="Channels" value={input.channels.join(", ") || "—"} />
              <Summary label="Proof" value={input.proof.trim() || "None given"} />
              <Summary label="Must avoid" value={input.constraints.trim() || "Nothing specified"} />

              <div className="rounded-md border border-border p-3 space-y-2">
                <div className="text-xs font-medium flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Personalization</div>
                <p className="text-xs text-muted-foreground">These are the only variables we use. Each has safe fallback text when a contact field is blank.</p>
                <ul className="text-xs space-y-1">
                  {COPILOT_VARIABLES.map((v) => (
                    <li key={v.token} className="flex flex-wrap gap-x-2">
                      <code className="bg-muted px-1 rounded">{v.token}</code>
                      <span className="text-muted-foreground">{v.label} — falls back to "{v.fallback}"</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer">
                <Checkbox checked={input.dataSourceConfirmed} onCheckedChange={(v) => set("dataSourceConfirmed", v === true)} className="mt-0.5" />
                <span className="text-xs">{COPILOT_DATA_SOURCE_LABEL}</span>
              </label>
              {issueFor("dataSourceConfirmed") && <p className="text-xs text-destructive">{issueFor("dataSourceConfirmed")}</p>}

              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                We'll save this as a <Badge variant="outline" className="mx-1">draft</Badge> you can edit line by line.
                Generating a full pack costs {CREDIT_COSTS.full_campaign_pack} credits. Nothing is sent until you clear preflight and approve it.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={step === 0 || busy} onClick={() => { setError(null); setStep((s) => Math.max(0, s - 1)); }}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!stepValid() || busy} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button disabled={busy || issues.length > 0} onClick={() => create({ sample: false })}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {busy ? busyLabel || "Working…" : "Create my draft"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3">
      <div className="w-32 shrink-0 text-xs text-muted-foreground pt-0.5">{label}</div>
      <div className="flex-1 min-w-0 break-words">{value}</div>
    </div>
  );
}
