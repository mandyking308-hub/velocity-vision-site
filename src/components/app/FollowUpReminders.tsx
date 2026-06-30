import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReminderState {
  staleLeads: number;       // leads with no action 48h+
  followupsDue: number;     // follow_up_at <= today, status not won/lost
  scheduledPending: number; // emails scheduled in next 24h
  noEmailConnection: boolean;
  connectionIssue: boolean;
}

export default function FollowUpReminders() {
  const [state, setState] = useState<ReminderState | null>(null);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const [{ data: leads }, { data: scheduled }, { data: connections }] = await Promise.all([
        supabase.from("leads").select("id, status, follow_up_at, last_action, last_email_sent_at, created_at"),
        supabase.from("email_sends").select("id, scheduled_for").eq("status", "scheduled").lte("scheduled_for", next24h),
        supabase.from("email_connections").select("status"),
      ]);

      const open = (leads || []).filter((l: any) => l.status !== "won" && l.status !== "lost");
      const staleLeads = open.filter((l: any) => {
        const last = l.last_email_sent_at || l.created_at;
        return last && last < cutoff48h;
      }).length;
      const followupsDue = open.filter((l: any) => l.follow_up_at && new Date(l.follow_up_at) <= now).length;

      const noEmailConnection = (connections || []).length === 0;
      const connectionIssue = (connections || []).some((c: any) => c.status === "error" || c.status === "reconnect_required");

      setState({
        staleLeads,
        followupsDue,
        scheduledPending: (scheduled || []).length,
        noEmailConnection,
        connectionIssue,
      });
    })();
  }, []);

  if (!state) return null;
  const items = [
    state.followupsDue > 0 && { tone: "default" as const, icon: Clock, label: `${state.followupsDue} lead${state.followupsDue === 1 ? "" : "s"} need follow-up today`, to: "/app/leads" },
    state.staleLeads > 0 && { tone: "muted" as const, icon: Mail, label: `${state.staleLeads} lead${state.staleLeads === 1 ? " has" : "s have"} had no action in 48 hours`, to: "/app/leads" },
    state.scheduledPending > 0 && { tone: "muted" as const, icon: Send, label: `${state.scheduledPending} email${state.scheduledPending === 1 ? "" : "s"} scheduled in next 24h`, to: "/app/campaigns" },
    state.noEmailConnection && { tone: "warn" as const, icon: AlertCircle, label: "Connect your email to start sending follow-ups", to: "/app/settings/email" },
    state.connectionIssue && { tone: "warn" as const, icon: AlertCircle, label: "An email connection needs reconnecting", to: "/app/settings/email" },
  ].filter(Boolean) as { tone: "default" | "muted" | "warn"; icon: any; label: string; to: string }[];

  if (items.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm">Needs your attention</h3>
          <Badge variant="outline">{items.length}</Badge>
        </div>
        {items.map((i, idx) => (
          <Link key={idx} to={i.to} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition">
            <i.icon className={`h-4 w-4 ${i.tone === "warn" ? "text-destructive" : "text-primary"}`} />
            <span className="text-sm flex-1">{i.label}</span>
            <Button variant="ghost" size="sm">Open →</Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
