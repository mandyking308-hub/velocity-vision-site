import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PortalNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["portal-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="gap-2">
            <Check size={14} /> Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {(notifications ?? []).map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "bg-card border rounded-xl p-4 shadow-card flex items-start justify-between gap-4 cursor-pointer transition-colors",
              n.read ? "border-border/50" : "border-accent/30 bg-accent/5"
            )}
            onClick={() => !n.read && markRead.mutate(n.id)}
          >
            <div className="flex items-start gap-3">
              <Bell size={18} className={cn("shrink-0 mt-0.5", n.read ? "text-muted-foreground" : "text-accent")} />
              <div>
                <p className={cn("text-sm", n.read ? "text-muted-foreground" : "text-foreground font-medium")}>{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "MMM d, yyyy · h:mm a")}</p>
              </div>
            </div>
            {!n.read && (
              <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2" />
            )}
          </motion.div>
        ))}
        {(!notifications || notifications.length === 0) && (
          <p className="text-muted-foreground text-sm text-center py-12">No notifications yet</p>
        )}
      </div>
    </div>
  );
};

export default PortalNotifications;
