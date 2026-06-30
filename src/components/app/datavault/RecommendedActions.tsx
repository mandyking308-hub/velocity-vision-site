import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export interface Action {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  cta: string;
}

export default function RecommendedActions({ actions }: { actions: Action[] }) {
  if (actions.length === 0) {
    return <div className="text-sm text-muted-foreground py-3">Your data is in good shape. Nothing to action right now.</div>;
  }
  return (
    <div className="space-y-2">
      {actions.map((a, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <a.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{a.title}</div>
            <div className="text-xs text-muted-foreground">{a.description}</div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link to={a.to}>
              {a.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
