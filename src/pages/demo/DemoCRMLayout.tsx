import { Outlet, useNavigate } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";
import DemoBanner from "@/components/DemoBanner";
import { useDemo } from "@/contexts/DemoContext";
import { useEffect } from "react";
import { GTranslateSlot } from "@/components/GTranslate";

const DemoCRMLayout = () => {
  const { isDemoMode } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDemoMode) {
      navigate("/demo", { replace: true });
    }
  }, [isDemoMode, navigate]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <DemoBanner />
      <div className="flex flex-1">
        <CRMSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 border-b border-border bg-card flex items-center justify-end px-6">
            <GTranslateSlot />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DemoCRMLayout;
