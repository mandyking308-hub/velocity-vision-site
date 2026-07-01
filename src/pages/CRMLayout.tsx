import { Outlet } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";
import { GTranslateSlot } from "@/components/GTranslate";

const CRMLayout = () => (
  <div className="flex min-h-screen w-full bg-background">
    <CRMSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-12 border-b border-border bg-card flex items-center justify-end px-6">
        <GTranslateSlot />
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default CRMLayout;
