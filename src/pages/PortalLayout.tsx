import { Outlet } from "react-router-dom";
import PortalSidebar from "@/components/portal/PortalSidebar";

const PortalLayout = () => (
  <div className="flex min-h-screen w-full bg-background">
    <PortalSidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default PortalLayout;
