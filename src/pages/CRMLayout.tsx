import { Outlet, useNavigate } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";
import { GTranslateSlot } from "@/components/GTranslate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";

const CRMLayout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <CRMSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-border bg-card flex items-center justify-end gap-2 px-6">
          <Button size="sm" variant="outline" onClick={() => navigate("/app")}>
            <LayoutDashboard className="h-4 w-4 mr-1.5" />
            Go to app
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/app/workspaces")}>
            <Building2 className="h-4 w-4 mr-1.5" />
            Workspaces
          </Button>
          <Button size="sm" variant="destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign out
          </Button>
          <GTranslateSlot />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
