import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface JourneyStep {
  to: string;
  label: string;
  variant?: "default" | "outline" | "ghost";
  icon?: LucideIcon;
}

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  why?: string;
  steps: JourneyStep[];
  /** Where this surface sits in the operating flow — shown as a subtle breadcrumb. */
  flow?: string;
}

/**
 * Connected empty state. Every customer-facing surface uses this when there
 * is nothing to show, so the user always knows what to do next and why this
 * page exists in the wider Upload → Activate → Send → Reply → Pipeline flow.
 */
export default function JourneyEmptyState({
  icon: Icon, title, description, why, steps, flow,
}: Props) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 md:p-12 text-center max-w-2xl mx-auto">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
        {flow && (
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {flow}
          </div>
        )}
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        {why && (
          <p className="text-xs text-muted-foreground mt-3 italic">{why}</p>
        )}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          {steps.map((s, i) => {
            const Icn = s.icon;
            return (
              <Button key={i} asChild variant={s.variant ?? (i === 0 ? "default" : "outline")} size="sm">
                <Link to={s.to}>
                  {Icn && <Icn className="h-4 w-4 mr-1.5" />}
                  {s.label}
                  {i === 0 && <ArrowRight className="h-3.5 w-3.5 ml-1.5" />}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
