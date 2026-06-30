import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const INTERNAL_ROLES = new Set(["founder", "admin", "sales", "marketing"]);

/**
 * Wraps CRM routes. Requires the user to be authenticated AND hold an internal role.
 * Defence-in-depth on top of RLS for /crm/* admin pages.
 */
const CRMProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["crm-guard-roles", user?.id],
    queryFn: async () => {
      if (!user) return [] as string[];
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return (data?.map((r) => r.role as string)) ?? [];
    },
    enabled: !!user,
  });

  if (loading || (user && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const hasAccess = (roles ?? []).some((r) => INTERNAL_ROLES.has(r));
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          The CRM is restricted to internal team members. If you believe this is an error, please contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default CRMProtectedRoute;
