import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCredits } from "@/contexts/CreditsContext";
import { FREE_LIMITS } from "@/lib/credits";

const STORAGE_KEY = "vv_setup_wizard_dismissed_v1";

const STEPS: Array<{ title: string; body: string; cta: string; href: string }> = [
  { title: "Create your workspace", body: "One workspace holds your data, campaigns and pipeline. Set your goal and audience next.", cta: "Open workspaces", href: "/app/workspaces" },
  { title: "Upload your first contacts", body: `Free Preview supports up to ${FREE_LIMITS.maxContacts} contacts. CSV upload with quality review is included.`, cta: "Go to Data Vault", href: "/app/data-vault" },
  { title: "Review data quality", body: "Every row is scored for deliverability risk before you spend credits generating for it.", cta: "Review data", href: "/app/data-vault" },
  { title: "Generate your first campaign pack", body: `Use welcome credits to draft email, social, PR and landing assets. Free Preview allows ${FREE_LIMITS.maxCampaignPacks} full pack.`, cta: "New campaign", href: "/app/campaigns/new" },
  { title: "Review AI outputs", body: "Every asset is a draft. Edit, approve and choose what to activate — nothing sends automatically.", cta: "Open campaigns", href: "/app/campaigns" },
  { title: "Decide: buy credits or upgrade", body: "When you're ready for more, top up credits or upgrade to Growth for recurring cadence and larger sending caps.", cta: "See billing", href: "/app/billing" },
  { title: "Connect a sender only when eligible", body: "Live sending is gated. You'll be prompted to connect an inbox and complete verification when you upgrade.", cta: "Learn how", href: "/help/getting-started" },
];

export default function SetupWizard() {
  const { isFreePreview } = useCredits();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isFreePreview) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setOpen(true);
  }, [isFreePreview]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  const s = STEPS[step];
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <DialogTitle>Guided setup — Free Preview</DialogTitle>
          </div>
          <DialogDescription>
            Seven quick steps to get your first campaign pack drafted. You can skip and come back any time.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step + 1} of {STEPS.length}</div>
            <div className="font-semibold text-lg">{s.title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild size="sm">
                <Link to={s.href} onClick={dismiss}>{s.cta}</Link>
              </Button>
              {step < STEPS.length - 1 && (
                <Button size="sm" variant="outline" onClick={() => setStep(step + 1)}>Next step</Button>
              )}
              {step > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              )}
              <Button size="sm" variant="ghost" onClick={dismiss} className="ml-auto">
                <X className="h-4 w-4 mr-1" /> Skip
              </Button>
            </div>
          </CardContent>
        </Card>

        <ul className="text-xs text-muted-foreground space-y-1">
          {STEPS.map((st, i) => (
            <li key={st.title} className="flex items-center gap-2">
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <Circle className="h-3.5 w-3.5" />}
              <span className={i === step ? "text-foreground font-medium" : ""}>{st.title}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
