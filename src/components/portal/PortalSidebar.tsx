import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Megaphone, FileText, MessageSquare,
  CreditCard, Bell, PlusCircle, LogOut, ChevronLeft, ChevronRight, Compass
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Dashboard", path: "/portal", icon: LayoutDashboard },
  { label: "Campaigns", path: "/portal/campaigns", icon: Megaphone },
  { label: "Documents", path: "/portal/documents", icon: FileText },
  { label: "Messages", path: "/portal/messages", icon: MessageSquare },
  { label: "Billing", path: "/portal/billing", icon: CreditCard },
  { label: "Request Campaign", path: "/portal/request", icon: PlusCircle },
  { label: "Notifications", path: "/portal/notifications", icon: Bell },
];

const PortalSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      return count ?? 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  return (
    <aside className={cn(
      "h-screen bg-primary border-r border-border/20 flex flex-col transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
        {!collapsed && (
          <Link to="/portal" className="font-display text-lg font-bold text-primary-foreground">
            Velocity<span className="text-accent">.</span> Portal
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-primary-foreground/60 hover:text-primary-foreground p-1">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const showBadge = item.path === "/portal/notifications" && (unreadCount ?? 0) > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {showBadge && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-primary-foreground/10">
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

export default PortalSidebar;
