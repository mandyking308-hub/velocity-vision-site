import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import CorePillars from "@/components/CorePillars";
import ControlFlow from "@/components/ControlFlow";
import SixSteps from "@/components/SixSteps";
import SocialBufferSection from "@/components/SocialBufferSection";
import GovernanceSection from "@/components/GovernanceSection";
import WorkflowSavings from "@/components/WorkflowSavings";
import PricingTeaser from "@/components/PricingTeaser";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import SecurityTrust from "@/components/SecurityTrust";
import GlobalStrip from "@/components/GlobalStrip";
import HomeFAQ from "@/components/HomeFAQ";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <>
    <SEO
      title="Velocity Vision — Customer-controlled B2B commercial workspace"
      description="Self-serve B2B software for approved prospect data, editable AI-assisted drafts, connected Buffer social publishing, governed activation controls, follow-up records and early opportunity administration."
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            name: "Velocity Vision",
            url: "https://velocity-outreach.com",
            description:
              "A self-serve B2B software workspace operated by Global Solutions Management LLC.",
          },
          {
            "@type": "WebSite",
            name: "Velocity Vision",
            url: "https://velocity-outreach.com",
          },
          {
            "@type": "SoftwareApplication",
            name: "Velocity Vision",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://velocity-outreach.com",
            description:
              "Self-serve software for customer-provided business data, editable AI-assisted drafts, connected Buffer social publishing, governed activation controls, follow-up records and early opportunity administration.",
          },
        ],
      }}
    />
    <Navbar />
    <main>
      <HeroSection />
      <CorePillars />
      <ControlFlow />
      <div className="panel-wrap">
        <div className="panel-blue">
          <SixSteps />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-pink">
          <SocialBufferSection />
        </div>
      </div>
      <GovernanceSection />
      <WorkflowSavings />
      <PricingTeaser />
      <CampaignChannelsStrip />
      <EmailIntegrationsStrip />
      <SecurityTrust />
      <GlobalStrip />
      <HomeFAQ />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
