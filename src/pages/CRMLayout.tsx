import { Outlet } from "react-router-dom";
import CRMSidebar from "@/components/crm/CRMSidebar";

// Internal operator surface — never translate. `translate="no"` and the
// `notranslate` class tell Google Translate / GTranslate to skip this subtree.
const CRMLayout = () => (
  <div className="flex min-h-screen w-full bg-background notranslate" translate="no">
    <CRMSidebar />
    <main className="flex-1 overflow-auto">
      <Outlet />
    </main>
  </div>
);

export default CRMLayout;
