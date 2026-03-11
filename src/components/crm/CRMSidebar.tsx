import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, Target, TrendingUp,
  CheckSquare, LogOut, ChevronLeft, ChevronRight, Globe, Megaphone, BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/crm", icon: LayoutDashboard },
  { label: "Companies", path: "/crm/companies", icon: Building2 },
  { label: "Contacts", path: "/crm/contacts", icon: Users },
  { label: "Leads", path: "/crm/leads", icon: Target },
  { label: "Opportunities", path: "/crm/opportunities", icon: TrendingUp },
  { label: "Tasks", path: "/crm/tasks", icon: CheckSquare },
  { label: "Campaigns", path: "/crm/campaigns", icon: Megaphone },
  { label: "Campaign Perf.", path: "/crm/campaign-dashboard", icon: BarChart3 },
];

const CRMSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-primary border-r border-border/20 flex flex-col transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
        {!collapsed && (
          <Link to="/crm" className="font-display text-lg font-bold text-primary-foreground">
            Velocity<span className="text-accent">.</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-primary-foreground/60 hover:text-primary-foreground p-1"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-primary-foreground/10 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors"
        >
          <Globe size={18} className="shrink-0" />
          {!collapsed && <span>Public Site</span>}
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-colors w-full"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default CRMSidebar;
