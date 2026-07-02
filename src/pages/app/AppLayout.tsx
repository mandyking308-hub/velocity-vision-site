import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Rocket, Users, BarChart3, LayoutTemplate, Settings, Briefcase, LogOut, Plus, CreditCard, Database, MessageSquare, TrendingUp, Send, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace, WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { CreditPill } from "@/components/app/CreditMeter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguageSync } from "@/hooks/useLanguageSync";
import { GTranslateSlot } from "@/components/GTranslate";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navConfig: { to: string; key: string; icon: typeof LayoutDashboard; end?: boolean }[] = [
  { to: "/app", key: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/data-vault", key: "dataVault", icon: Database },
  { to: "/app/activate", key: "activate", icon: Send },
  { to: "/app/campaigns", key: "campaigns", icon: Rocket },
  { to: "/app/follow-up", key: "followUp", icon: MessageSquare },
  { to: "/app/leads", key: "leads", icon: Users },
  { to: "/app/pipeline", key: "pipeline", icon: TrendingUp },
  { to: "/app/performance", key: "performance", icon: BarChart3 },
  { to: "/app/templates", key: "templates", icon: LayoutTemplate },
  { to: "/app/billing", key: "billing", icon: CreditCard },
  { to: "/app/settings", key: "settings", icon: Settings },
  { to: "/app/workspaces", key: "workspaces", icon: Briefcase },
];

function WorkspaceSwitcher() {
  const { workspaces, currentId, setCurrentId } = useWorkspace();
  if (workspaces.length < 2) return null;
  return (
    <Select value={currentId ?? undefined} onValueChange={setCurrentId}>
      <SelectTrigger className="w-[160px] sm:w-[200px] max-w-[45vw]">
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

function NavList({ onNavigate, t, signOut, navigate }: { onNavigate?: () => void; t: (k: string) => string; signOut: () => Promise<void>; navigate: (p: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="font-bold text-lg notranslate" translate="no">Velocity</div>
        <div className="text-xs text-muted-foreground">Campaign launchpad</div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navConfig.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`
            }
          >
            <n.icon className="h-4 w-4" />
            {t(`nav.${n.key}`)}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function Shell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("app");
  useLanguageSync();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card flex-col">
        <NavList t={t} signOut={signOut} navigate={navigate} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile drawer trigger */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-[300px]">
                <NavList t={t} signOut={signOut} navigate={navigate} onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>
            <WorkspaceSwitcher />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block"><GTranslateSlot /></div>
            <CreditPill />
            <Button size="sm" onClick={() => navigate("/app/campaigns/new")} className="whitespace-nowrap">
              <Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">New campaign</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-3 sm:p-6">
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
