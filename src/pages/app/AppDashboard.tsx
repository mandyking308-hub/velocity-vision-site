import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, FolderOpen, Users, BarChart3, LayoutTemplate, Settings, Briefcase, ArrowRight, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreditMeter from "@/components/app/CreditMeter";
import FollowUpReminders from "@/components/app/FollowUpReminders";
import DataVaultDashboardWidget from "@/components/app/datavault/DataVaultDashboardWidget";

export default function AppDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [stats, setStats] = useState({ active: 0, leads: 0, followups: 0, latestId: null as string | null });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: campaigns }, { data: leads }] = await Promise.all([
        supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("campaigns").select("id, status, created_at").order("created_at", { ascending: false }),
        supabase.from("leads").select("id, status, follow_up_at"),
      ]);
      setFirstName(profile?.first_name || "");
      const active = (campaigns || []).filter((c: any) => c.status === "active" || c.status === "planning").length;
      const followups = (leads || []).filter((l: any) => l.follow_up_at && new Date(l.follow_up_at) <= new Date()).length;
      setStats({
        active,
        leads: (leads || []).length,
        followups,
        latestId: campaigns?.[0]?.id || null,
      });
    })();
  }, [user]);

  const cards = [
    { title: "Start a campaign", desc: "Begin a new guided brief", icon: Rocket, to: "/app/campaigns/new", primary: true },
    { title: "My current campaigns", desc: "See active and draft campaigns", icon: FolderOpen, to: "/app/campaigns" },
    { title: "Lead capture & pipeline", desc: "See new leads and what needs action", icon: Users, to: "/app/leads" },
    { title: "Performance review", desc: "See what worked and what to improve", icon: BarChart3, to: "/app/performance" },
    { title: "Templates", desc: "Start faster from previous winners", icon: LayoutTemplate, to: "/app/templates" },
    { title: "Workspace settings", desc: "Billing, integrations, profile, email", icon: Settings, to: "/app/settings" },
    { title: "Client workspaces", desc: "Switch between client accounts", icon: Briefcase, to: "/app/workspaces" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
          <p className="text-muted-foreground mt-1">Your campaign launchpad. Pick up where you left off, or start something new.</p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" onClick={() => navigate("/app/campaigns/new")}>
            <Rocket className="h-4 w-4 mr-2" /> Start a new campaign
          </Button>
          <Button size="lg" variant="outline" disabled={!stats.latestId} onClick={() => stats.latestId && navigate(`/app/campaigns/${stats.latestId}`)}>
            Open latest campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active campaigns" value={stats.active} />
        <StatCard label="Leads captured" value={stats.leads} />
        <StatCard label="Follow-ups due" value={stats.followups} />
        <StatCard label="Last performance" value="—" hint="Launch your first to see data" />
      </div>

      <FollowUpReminders />

      <DataVaultDashboardWidget />

      <CreditMeter />


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className={`h-full hover:shadow-md transition cursor-pointer ${c.primary ? "border-primary" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <c.icon className="h-6 w-6 text-primary" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg mt-3">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-3xl font-bold mt-1">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
