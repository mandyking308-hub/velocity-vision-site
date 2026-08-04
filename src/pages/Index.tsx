import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
import CampaignChannelsStrip from "@/components/CampaignChannelsStrip";
import ProblemProof from "@/components/ProblemProof";
import CampaignCapabilities from "@/components/CampaignCapabilities";
import HowItWorksPreview from "@/components/HowItWorksPreview";
import WorkflowSavings from "@/components/WorkflowSavings";
import PricingTeaser from "@/components/PricingTeaser";
import AudienceSplit from "@/components/AudienceSplit";
import SecurityTrust from "@/components/SecurityTrust";
import GlobalStrip from "@/components/GlobalStrip";
import HomeFAQ from "@/components/HomeFAQ";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <>
    <SEO
      title="Velocity Vision — Customer-controlled B2B commercial workspace"
      description="Self-serve B2B software for customer-provided business data, editable AI-assisted drafts, sender verification, governed activation controls, follow-up records and early opportunity administration."
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
              "Self-serve software for customer-provided business data, editable AI-assisted drafts, governed activation controls, follow-up records and early opportunity administration.",
          },
        ],
      }}
    />
    <Navbar />
    <main>
      <HeroSection />
      <div className="panel-wrap">
        <div className="panel-pink">
          <AudienceSplit />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-blue">
          <HowItWorksPreview />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-pink">
          <ProblemProof />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-pink">
          <CampaignChannelsStrip />
        </div>
      </div>
      <CampaignCapabilities />
      <WorkflowSavings />
      <PricingTeaser />
      <div className="panel-wrap">
        <div className="panel-blue">
          <EmailIntegrationsStrip />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-blue">
          <SecurityTrust />
        </div>
      </div>
      <div className="panel-wrap">
        <div className="panel-pink">
          <GlobalStrip />
        </div>
      </div>
      <HomeFAQ />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
