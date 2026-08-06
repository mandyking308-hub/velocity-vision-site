import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, ArrowRight, Wand2, FlaskConical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useDemo } from "@/contexts/DemoContext";
import { CREDIT_COSTS } from "@/lib/credits";
import {
  mergeGeneratedPack, type CampaignBrief, type CampaignGoal, type CampaignPack,
} from "@/lib/campaignPack";
import { checkPackQuality } from "@/lib/campaignQuality";
import { formatQualityFailure } from "@/lib/campaignQualityToast";
import { SAMPLE_BRIEF } from "@/lib/sampleCampaign";

/**
 * First-Campaign Copilot.
 *
 * A guided, plain-English path from "I have nothing" to an editable campaign
 * draft. It reuses the existing generation, quality-guard and credit logic —
 * it does not fork them. Drafts are saved with status "draft" and are never
 * activated from here; activation stays behind the preflight gate.
 */

const GOALS: { value: CampaignGoal; label: string; help: string }[] = [
  { value: "leads", label: "Start conversations with new prospects", help: "Cold-ish outreach to people who fit your offer." },
  { value: "bookings", label: "Get meetings in the diary", help: "Direct ask for a call or demo." },
  { value: "sales", label: "Sell a specific product or service", help: "A defined offer with a clear commercial next step." },
  { value: "signups", label: "Get sign-ups or registrations", help: "Event, waitlist or trial registration." },
  { value: "awareness", label: "Introduce what we do", help: "Softer positioning, useful for a new market." },
];

const CTA_OPTIONS = [
  "Reply to arrange a short call",
  "Reply if you'd like the details",
  "Book a time that suits you",
  "Reply with a yes and I'll send it over",
];

const STEPS = ["Your goal", "Your offer", "Who you're contacting", "Your next step", "Review"];

export default function AppCampaignCopilot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentId: workspaceId } = useWorkspace();
  const { refresh: refreshCredits } = useCredits();
  const { guardAction } = useDemo();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [goal, setGoal] = useState<CampaignGoal>("leads");
  const [name, setName] = useState("");
  const [offer, setOffer] = useState("");
  const [audience, setAudience] = useState("");
  const [geography, setGeography] = useState("");
  const [tone, setTone] = useState("Direct, practical, no hype");
  const [cta, setCta] = useState(CTA_OPTIONS[0]);

  const buildBrief = (): CampaignBrief => ({
    name: name.trim() || `${GOALS.find((g) => g.value === goal)?.label ?? "Campaign"}`,
    goal,
    kind: "lead_gen",
    offer: offer.trim(),
    audience: audience.trim(),
    industry: "",
    geography: geography.trim(),
    pricePoint: "",
    tone,
    cta,
    channels: ["Email"],
    deadline: "",
    notes: "",
    outputs: ["email", "landing", "offer"],
    language: "en",
  });

  const stepValid = (): boolean => {
    if (step === 1) return offer.trim().length >= 20;
    if (step === 2) return audience.trim().length >= 20;
    return true;
  };

  const create = async (opts: { sample: boolean }) => {
    if (!guardAction("Create campaign")) return;
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setBusy(true);
    try {
      const brief = opts.sample ? { ...SAMPLE_BRIEF } : buildBrief();
      let pack: CampaignPack | null = null;
      let ledgerId: string | null = null;
      let usedFallback = false;

      if (opts.sample) {
        // Sample drafts never consume credits and never call the model.
        pack = mergeGeneratedPack(brief, null) as CampaignPack;
        usedFallback = true;
      } else {
        try {
          const { data, error } = await supabase.functions.invoke("generate-campaign-pack", { body: { brief } });
          if (error) throw error;
          if (data?.pack) {
            pack = mergeGeneratedPack(brief, data.pack, data.generatedAs) as CampaignPack;
            ledgerId = (data as any)?.ledgerId ?? null;
          }
        } catch (aiErr: any) {
          const status = aiErr?.status ?? aiErr?.context?.status;
          const code = String(aiErr?.context?.body ?? aiErr?.message ?? "");
          if (status === 402 || /insufficient_credits|starter_expired|no_plan/.test(code)) {
            toast.error("You don't have enough Campaign Credits", {
              description: `A full campaign pack costs ${CREDIT_COSTS.full_campaign_pack} credits. Top up, upgrade, or try the sample path.`,
            });
            setBusy(false);
            await refreshCredits();
            return;
          }
          console.warn("Copilot AI generation failed, using deterministic fallback", aiErr);
        }
        if (!pack) {
          pack = mergeGeneratedPack(brief, null) as CampaignPack;
          usedFallback = true;
        }
      }

      const quality = checkPackQuality(pack, brief);
      if (!quality.ok) {
        const { title, description } = formatQualityFailure(quality, false);
        toast.error(title, { description });
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* noop */ }
          await refreshCredits();
        }
        setBusy(false);
        return;
      }

      const slug = `${(brief.name || "campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48)}-${Math.random().toString(36).slice(2, 7)}`;
      const { data: row, error } = await (supabase.from("campaigns") as any)
        .insert({
          name: brief.name,
          description: brief.offer,
          goal: brief.goal,
          campaign_kind: brief.kind,
          status: "draft",
          type: "email",
          owner_id: user.id,
          created_by: user.id,
          workspace_id: workspaceId,
          brief,
          pack,
          slug,
          language: "en",
          is_sample: opts.sample,
          objective: `${brief.goal} — ${brief.cta}`,
          target_audience_description: brief.audience,
          cadence_type: "one_off",
        })
        .select("id")
        .single();
      if (error) {
        if (ledgerId) {
          try { await supabase.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch { /* noop */ }
        }
        throw error;
      }
      if (ledgerId) {
        try { await supabase.rpc("finalise_campaign_credits", { _ledger_id: ledgerId, _ref_id: row.id, _label: brief.name }); } catch { /* noop */ }
      }
      await refreshCredits();
      toast.success(
        opts.sample ? "Sample campaign created — explore and edit it freely" : usedFallback ? "Draft ready (template used)" : "Draft ready to review",
        { description: "Nothing is sent until you approve it in preflight." },
      );
      navigate(`/app/campaigns/${row.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Could not create the campaign");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Build my first campaign
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Four short questions. We turn them into an editable draft — you review every word before anything is sent.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" /> Nothing to hand yet?
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a fully worked sample campaign with example data. It costs no credits and can never be sent.
            </p>
          </div>
          <Button variant="outline" disabled={busy} onClick={() => create({ sample: true })}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
            Use sample data
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </span>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              <Label>What do you want this campaign to achieve?</Label>
              <div className="grid gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`text-left rounded-md border p-3 transition ${goal === g.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                  >
                    <div className="text-sm font-medium">{g.label}</div>
                    <div className="text-xs text-muted-foreground">{g.help}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-name">Give it a name (optional)</Label>
                <Input id="cp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 outreach — operations leads" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="cp-offer">In plain English, what are you offering?</Label>
              <p className="text-xs text-muted-foreground">
                Describe what the recipient actually gets. Avoid slogans — the clearer this is, the better the draft.
              </p>
              <Textarea id="cp-offer" rows={5} value={offer} onChange={(e) => setOffer(e.target.value)}
                placeholder="A short operations review that produces a written summary of where their follow-up process loses time." />
              <div className="text-xs text-muted-foreground">{offer.trim().length}/20 characters minimum</div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cp-audience">Who are you contacting?</Label>
                <p className="text-xs text-muted-foreground">Role, company type and size. Be specific.</p>
                <Textarea id="cp-audience" rows={4} value={audience} onChange={(e) => setAudience(e.target.value)}
                  placeholder="Operations leads at UK service businesses with 5–50 staff." />
                <div className="text-xs text-muted-foreground">{audience.trim().length}/20 characters minimum</div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-geo">Where are they? (optional)</Label>
                <Input id="cp-geo" value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="United Kingdom" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>What should they do next?</Label>
                <p className="text-xs text-muted-foreground">
                  One call to action, used word-for-word. We never invent a different one.
                </p>
                <Select value={cta} onValueChange={setCta}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CTA_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-tone">Tone of voice</Label>
                <Input id="cp-tone" value={tone} onChange={(e) => setTone(e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <Summary label="Goal" value={GOALS.find((g) => g.value === goal)?.label ?? goal} />
              <Summary label="Offer" value={offer.trim() || "—"} />
              <Summary label="Audience" value={audience.trim() || "—"} />
              <Summary label="Location" value={geography.trim() || "Not specified"} />
              <Summary label="Call to action" value={cta} />
              <Summary label="Tone" value={tone} />
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                We'll save this as a <Badge variant="outline" className="mx-1">draft</Badge> you can edit.
                Generating a full pack costs {CREDIT_COSTS.full_campaign_pack} credits. Nothing is sent until you clear preflight and approve it.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={step === 0 || busy} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button disabled={!stepValid() || busy} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button disabled={busy || offer.trim().length < 20 || audience.trim().length < 20} onClick={() => create({ sample: false })}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Create my draft
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-32 shrink-0 text-xs text-muted-foreground pt-0.5">{label}</div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  );
}
