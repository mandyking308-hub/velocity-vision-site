import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index.tsx";
import Services from "./pages/Services.tsx";
import Industries from "./pages/Industries.tsx";
import Work from "./pages/Work.tsx";
import Insights from "./pages/Insights.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import BookDemo from "./pages/BookDemo.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import CRMLayout from "./pages/CRMLayout.tsx";
import CRMDashboard from "./pages/crm/CRMDashboard.tsx";
import CompaniesPage from "./pages/crm/CompaniesPage.tsx";
import ContactsPage from "./pages/crm/ContactsPage.tsx";
import LeadsPage from "./pages/crm/LeadsPage.tsx";
import OpportunitiesPage from "./pages/crm/OpportunitiesPage.tsx";
import TasksPage from "./pages/crm/TasksPage.tsx";
import CampaignsPage from "./pages/crm/CampaignsPage.tsx";
import CampaignDetailPage from "./pages/crm/CampaignDetailPage.tsx";
import CampaignDashboard from "./pages/crm/CampaignDashboard.tsx";
import FounderDashboard from "./pages/crm/FounderDashboard.tsx";
import PortalLayout from "./pages/PortalLayout.tsx";
import PortalDashboard from "./pages/portal/PortalDashboard.tsx";
import PortalCampaigns from "./pages/portal/PortalCampaigns.tsx";
import PortalDocuments from "./pages/portal/PortalDocuments.tsx";
import PortalMessages from "./pages/portal/PortalMessages.tsx";
import PortalBilling from "./pages/portal/PortalBilling.tsx";
import PortalCampaignRequest from "./pages/portal/PortalCampaignRequest.tsx";
import PortalNotifications from "./pages/portal/PortalNotifications.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public website */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/industries" element={<PageTransition><Industries /></PageTransition>} />
        <Route path="/work" element={<PageTransition><Work /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/book-demo" element={<PageTransition><BookDemo /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />

        {/* CRM (protected - internal team) */}
        <Route path="/crm" element={<ProtectedRoute><CRMLayout /></ProtectedRoute>}>
          <Route index element={<CRMDashboard />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="campaign-dashboard" element={<CampaignDashboard />} />
          <Route path="founder" element={<FounderDashboard />} />
        </Route>

        {/* Client Portal (protected) */}
        <Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
          <Route index element={<PortalDashboard />} />
          <Route path="campaigns" element={<PortalCampaigns />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="messages" element={<PortalMessages />} />
          <Route path="billing" element={<PortalBilling />} />
          <Route path="request" element={<PortalCampaignRequest />} />
          <Route path="notifications" element={<PortalNotifications />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
