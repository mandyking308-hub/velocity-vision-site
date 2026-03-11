import { Outlet } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";

const CRMLayout = () => (
  <div className="flex min-h-screen w-full bg-background">
    <CRMSidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default CRMLayout;
