import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import CRMProtectedRoute from "@/components/CRMProtectedRoute";
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
import ForAgencies from "./pages/ForAgencies.tsx";
import ForBusinesses from "./pages/ForBusinesses.tsx";
import Pricing from "./pages/Pricing.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Features from "./pages/Features.tsx";
import Templates from "./pages/Templates.tsx";
import Help from "./pages/Help.tsx";
import LegalCentre from "./pages/legal/LegalCentre.tsx";
import LegalDocumentPage from "./pages/legal/LegalDocumentPage.tsx";
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
import BillingPage from "./pages/crm/BillingPage.tsx";
import QADashboard from "./pages/crm/QADashboard.tsx";
import LegalCompliancePage from "./pages/crm/LegalCompliancePage.tsx";
import FounderManual from "./pages/crm/FounderManual.tsx";
import FounderMonetisation from "./pages/crm/FounderMonetisation.tsx";
import PortalLayout from "./pages/PortalLayout.tsx";
import PortalDashboard from "./pages/portal/PortalDashboard.tsx";
import PortalCampaigns from "./pages/portal/PortalCampaigns.tsx";
import PortalDocuments from "./pages/portal/PortalDocuments.tsx";
import PortalMessages from "./pages/portal/PortalMessages.tsx";
import PortalBilling from "./pages/portal/PortalBilling.tsx";
import PortalCampaignRequest from "./pages/portal/PortalCampaignRequest.tsx";
import PortalNotifications from "./pages/portal/PortalNotifications.tsx";
import PortalOnboarding from "./pages/portal/PortalOnboarding.tsx";
import PortalWorkspaces from "./pages/portal/PortalWorkspaces.tsx";
import PortalLegal from "./pages/portal/PortalLegal.tsx";
import DemoLogin from "./pages/DemoLogin.tsx";
import DemoCRMLayout from "./pages/demo/DemoCRMLayout.tsx";
import DemoCRMDashboard from "./pages/demo/DemoCRMDashboard.tsx";
import AppLayout from "./pages/app/AppLayout.tsx";
import AppDashboard from "./pages/app/AppDashboard.tsx";
import AppCampaigns from "./pages/app/AppCampaigns.tsx";
import AppCampaignNew from "./pages/app/AppCampaignNew.tsx";
import AppCampaignWorkspace from "./pages/app/AppCampaignWorkspace.tsx";
import AppLeads from "./pages/app/AppLeads.tsx";
import AppTemplates from "./pages/app/AppTemplates.tsx";
import AppPerformance from "./pages/app/AppPerformance.tsx";
import AppSettings from "./pages/app/AppSettings.tsx";
import AppWorkspaces from "./pages/app/AppWorkspaces.tsx";
import AppBilling from "./pages/app/AppBilling.tsx";
import AppEmailConnections from "./pages/app/AppEmailConnections.tsx";
import HostedCapture from "./pages/HostedCapture.tsx";

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
        <Route path="/for-agencies" element={<PageTransition><ForAgencies /></PageTransition>} />
        <Route path="/for-businesses" element={<PageTransition><ForBusinesses /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/features" element={<PageTransition><Features /></PageTransition>} />
        <Route path="/templates" element={<PageTransition><Templates /></PageTransition>} />
        <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
        <Route path="/legal" element={<PageTransition><LegalCentre /></PageTransition>} />
        <Route path="/legal/:slug" element={<PageTransition><LegalDocumentPage /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/demo" element={<PageTransition><DemoLogin /></PageTransition>} />

        {/* Hosted public lead capture pages */}
        <Route path="/c/:slug" element={<HostedCapture />} />

        {/* Demo CRM (sandboxed — no auth required) */}
        <Route path="/demo/crm" element={<DemoCRMLayout />}>
          <Route index element={<DemoCRMDashboard />} />
        </Route>

        {/* CRM (protected - internal team) */}
        <Route path="/crm" element={<CRMProtectedRoute><CRMLayout /></CRMProtectedRoute>}>
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
          <Route path="billing" element={<BillingPage />} />
          <Route path="qa" element={<QADashboard />} />
          <Route path="legal-compliance" element={<LegalCompliancePage />} />
          <Route path="manual" element={<FounderManual />} />
          <Route path="monetisation" element={<FounderMonetisation />} />
        </Route>

        {/* Self-serve customer app (protected) */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<AppDashboard />} />
          <Route path="campaigns" element={<AppCampaigns />} />
          <Route path="campaigns/new" element={<AppCampaignNew />} />
          <Route path="campaigns/:id" element={<AppCampaignWorkspace />} />
          <Route path="leads" element={<AppLeads />} />
          <Route path="performance" element={<AppPerformance />} />
          <Route path="templates" element={<AppTemplates />} />
          <Route path="settings" element={<AppSettings />} />
          <Route path="settings/email" element={<AppEmailConnections />} />
          <Route path="billing" element={<AppBilling />} />
          <Route path="workspaces" element={<AppWorkspaces />} />
        </Route>

        {/* Legacy client portal (still available, kept for billing/legal/docs) */}
        <Route path="/portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
          <Route index element={<PortalDashboard />} />
          <Route path="campaigns" element={<PortalCampaigns />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="messages" element={<PortalMessages />} />
          <Route path="billing" element={<PortalBilling />} />
          <Route path="request" element={<PortalCampaignRequest />} />
          <Route path="notifications" element={<PortalNotifications />} />
          <Route path="onboarding" element={<PortalOnboarding />} />
          <Route path="workspaces" element={<PortalWorkspaces />} />
          <Route path="legal" element={<PortalLegal />} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DemoProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
