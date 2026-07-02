import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import EmailIntegrationsStrip from "@/components/EmailIntegrationsStrip";
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
      title={"Velocity Vision — Marketing outreach, follow-up and pipeline in one workspace"}
      description={"Upload your data, generate marketing outreach assets — email sequences, social media, press releases — activate safely, work replies and move leads into pipeline. For businesses and agencies."}
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "name": "Velocity Vision",
            "url": "https://velocity-outreach.com",
            "description": "One workspace for marketing outreach, replies and pipeline. Self-serve, multilingual, multi-currency.",
          },
          {
            "@type": "WebSite",
            "name": "Velocity Vision",
            "url": "https://velocity-outreach.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://velocity-outreach.com/insights?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }}
    />
    <Navbar />
    <main>
      <HeroSection />
      <EmailIntegrationsStrip />
      <ProblemProof />
      <CampaignCapabilities />
      <SecurityTrust />
      <GlobalStrip />
      <HowItWorksPreview />
      <WorkflowSavings />
      <PricingTeaser />
      <AudienceSplit />
      <HomeFAQ />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
