import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Rocket, Users, BarChart3, LayoutTemplate, Settings, Briefcase, LogOut, Plus, CreditCard, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace, WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { CreditPill } from "@/components/app/CreditMeter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const nav = [
  { to: "/app", label: "Launch", icon: LayoutDashboard, end: true },
  { to: "/app/data-vault", label: "Data Vault", icon: Database },
  { to: "/app/campaigns", label: "Campaigns", icon: Rocket },
  { to: "/app/leads", label: "Pipeline", icon: Users },
  { to: "/app/performance", label: "Performance", icon: BarChart3 },
  { to: "/app/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/app/workspaces", label: "Workspaces", icon: Briefcase },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function WorkspaceSwitcher() {
  const { workspaces, currentId, setCurrentId } = useWorkspace();
  if (workspaces.length < 2) return null;
  return (
    <Select value={currentId ?? undefined} onValueChange={setCurrentId}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select workspace" />
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((w) => (
          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Shell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="font-bold text-lg">Velocity</div>
          <div className="text-xs text-muted-foreground">Campaign launchpad</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 gap-3">
          <WorkspaceSwitcher />
          <div className="flex items-center gap-3">
            <CreditPill />
            <Button size="sm" onClick={() => navigate("/app/campaigns/new")}>
              <Plus className="h-4 w-4 mr-1" /> New campaign
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <WorkspaceProvider>
      <CreditsProvider>
        <Shell />
      </CreditsProvider>
    </WorkspaceProvider>
  );
}
