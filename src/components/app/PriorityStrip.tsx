import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, MessageSquare, Mail, TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PriorityInputs {
  repliesDue: number;
  overdue: number;
  stuck: number;
  senderConnected: boolean;
  senderVerified: boolean;
  creditsRemaining: number;
}

interface PriorityItem {
  key: string;
  tone: "danger" | "warn" | "info";
  icon: any;
  text: string;
  to: string;
  cta?: string;
}

const TONE: Record<PriorityItem["tone"], string> = {
  danger: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200",
  warn: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100",
  info: "bg-primary/5 border-primary/30 text-primary",
};

export default function PriorityStrip(props: PriorityInputs) {
  const { t } = useTranslation("app");
  const nav = useNavigate();
  const items = buildItems(props, t);

  return (
    <div className="sticky top-0 z-20 -mx-2 px-2 py-3 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("priority.title")}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> {t("priority.empty")}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={() => nav(i.to)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition hover:shadow-sm ${TONE[i.tone]}`}
            >
              <i.icon className="h-4 w-4" />
              <span className="font-medium">{i.text}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 transition" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function buildItems(p: PriorityInputs, t: (k: string, opts?: any) => string): PriorityItem[] {
  const out: PriorityItem[] = [];
  if (!p.senderConnected) {
    out.push({ key: "sender-d", tone: "danger", icon: Mail, text: t("priority.senderDisconnected"), to: "/app/settings/email" });
  } else if (!p.senderVerified) {
    out.push({ key: "sender-v", tone: "warn", icon: ShieldCheck, text: t("priority.senderUnverified"), to: "/app/settings/email" });
  }
  if (p.creditsRemaining <= 0) {
    out.push({ key: "credits-x", tone: "danger", icon: Zap, text: t("priority.creditsExhausted"), to: "/app/billing" });
  } else if (p.creditsRemaining < 20) {
    out.push({ key: "credits-l", tone: "warn", icon: Zap, text: t("priority.creditsLow"), to: "/app/billing" });
  }
  if (p.repliesDue > 0) {
    out.push({
      key: "rep", tone: "warn", icon: MessageSquare,
      text: t("priority.repliesDue", { count: p.repliesDue }),
      to: "/app/follow-up?tab=replied",
    });
  }
  if (p.overdue > 0) {
    out.push({
      key: "ovd", tone: "warn", icon: Mail,
      text: t("priority.overdue", { count: p.overdue }),
      to: "/app/follow-up?tab=overdue",
    });
  }
  if (p.stuck > 0) {
    out.push({
      key: "stk", tone: "warn", icon: TrendingUp,
      text: t("priority.stuck", { count: p.stuck }),
      to: "/app/pipeline",
    });
  }
  return out;
}
