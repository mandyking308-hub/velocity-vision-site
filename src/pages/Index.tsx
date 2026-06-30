import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import ProblemProof from "@/components/ProblemProof";
import CorePromises from "@/components/CorePromises";
import CampaignCapabilities from "@/components/CampaignCapabilities";
import HowItWorksPreview from "@/components/HowItWorksPreview";
import PlatformPositioning from "@/components/PlatformPositioning";
import AudienceSplit from "@/components/AudienceSplit";
import PricingTeaser from "@/components/PricingTeaser";
import NotAnotherX from "@/components/NotAnotherX";
import HomeFAQ from "@/components/HomeFAQ";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <>
    <SEO
      title={"Velocity Vision — Commercial operating workspace for outreach & pipeline"}
      description={"From data to pipeline in one workspace. Upload contacts, review quality, activate safely, create outreach, work replies and move opportunities — for businesses and agencies."}
      path="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "name": "Velocity Vision",
            "url": "https://velocity-outreach.com",
            "description": "Commercial operating workspace for outreach, replies and pipeline. Self-serve, multilingual, multi-currency.",
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
      <ProblemProof />
      <CorePromises />
      <CampaignCapabilities />
      <HowItWorksPreview />
      <PlatformPositioning />
      <AudienceSplit />
      <PricingTeaser />
      <NotAnotherX />
      <HomeFAQ />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
