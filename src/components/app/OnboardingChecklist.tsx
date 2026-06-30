import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ArrowRight, Upload, ShieldCheck, Send, Mail, Sparkles, Clock, MessageSquare, TrendingUp } from "lucide-react";

export interface ChecklistSignals {
  hasContacts: boolean;
  hasReviewed: boolean;       // any clean/safe contacts after import
  hasSafeSegment: boolean;    // safe_to_activate > 0
  hasSender: boolean;
  hasAssets: boolean;         // any campaign created
  hasCadence: boolean;        // any campaign with start_at/cadence
  hasActivated: boolean;      // any send made
  hasWorkedReplies: boolean;  // any reply or opportunity
}

interface Step {
  key: keyof ChecklistSignals;
  label: string;
  desc: string;
  to: string;
  cta: string;
  icon: any;
}

const STEPS: Step[] = [
  { key: "hasContacts", label: "Upload your contacts", desc: "CSV, paste or manual entry — this is your operating data.", to: "/app/data-vault/upload", cta: "Upload", icon: Upload },
  { key: "hasReviewed", label: "Review data quality", desc: "We flag risky, duplicate or blocked records before sending.", to: "/app/data-vault", cta: "Review", icon: ShieldCheck },
  { key: "hasSafeSegment", label: "Create a safe segment", desc: "Only clean, opt-in contacts get activated.", to: "/app/activate", cta: "Open Activate", icon: Send },
  { key: "hasSender", label: "Connect your sender", desc: "Authenticate SPF / DKIM to protect deliverability.", to: "/app/settings/email", cta: "Connect", icon: Mail },
  { key: "hasAssets", label: "Create outreach assets", desc: "Email sequence, social pack, press release or video pack.", to: "/app/campaigns/new", cta: "Create", icon: Sparkles },
  { key: "hasCadence", label: "Set your campaign timing", desc: "One-off, weekly, monthly — your outreach rhythm.", to: "/app/campaigns", cta: "Schedule", icon: Clock },
  { key: "hasActivated", label: "Activate safely", desc: "Send to your safe segment within your daily safety cap.", to: "/app/activate", cta: "Activate", icon: Send },
  { key: "hasWorkedReplies", label: "Work replies & move to pipeline", desc: "Turn warm conversations into opportunities and revenue.", to: "/app/follow-up", cta: "Open queue", icon: MessageSquare },
];

export default function OnboardingChecklist({ signals }: { signals: ChecklistSignals }) {
  const done = STEPS.filter((s) => signals[s.key]).length;
  const pct = Math.round((done / STEPS.length) * 100);
  if (done >= STEPS.length) return null;
  const nextStep = STEPS.find((s) => !signals[s.key]);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Get your workspace live
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload → Review → Activate → Create assets → Send → Work replies → Pipeline.
            </p>
          </div>
          {nextStep && (
            <Button asChild size="sm">
              <Link to={nextStep.to}>Next: {nextStep.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{done} / {STEPS.length} done</span>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {STEPS.map((s) => {
            const ok = signals[s.key];
            const Icon = s.icon;
            return (
              <li key={s.key} className={`flex items-center gap-3 rounded-md border p-2.5 ${ok ? "border-emerald-200 bg-emerald-50/40" : "border-border bg-background/60"}`}>
                {ok ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${ok ? "line-through text-muted-foreground" : ""}`}>{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                {!ok && (
                  <Button asChild size="sm" variant="ghost" className="shrink-0">
                    <Link to={s.to}><Icon className="h-3.5 w-3.5 mr-1" />{s.cta}</Link>
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
