import { Outlet, useNavigate } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";
import { GTranslateSlot } from "@/components/GTranslate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Building2, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const CRMLayout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <CRMSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-12 border-b border-border bg-card flex items-center justify-between gap-2 px-3 sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85vw] max-w-[280px]">
              <div onClick={() => setDrawerOpen(false)}>
                <CRMSidebar />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap justify-end">
            <Button size="sm" variant="outline" onClick={() => navigate("/app")} className="h-8 px-2 sm:px-3">
              <LayoutDashboard className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Go to app</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/app/workspaces")} className="h-8 px-2 sm:px-3">
              <Building2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Workspaces</span>
            </Button>
            <Button size="sm" variant="destructive" onClick={handleSignOut} className="h-8 px-2 sm:px-3">
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <div className="hidden sm:block"><GTranslateSlot /></div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CRMLayout;
