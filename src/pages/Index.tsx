import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import WhatWeDo from "@/components/WhatWeDo";
import PlatformPositioning from "@/components/PlatformPositioning";
import IndustriesSection from "@/components/IndustriesSection";
import CampaignCapabilities from "@/components/CampaignCapabilities";
import FeaturedWork from "@/components/FeaturedWork";
import InsightsSection from "@/components/InsightsSection";
import AgencyPositioning from "@/components/AgencyPositioning";
import AgencySection from "@/components/AgencySection";
import ROICalculator from "@/components/ROICalculator";
import MidPageCTA from "@/components/MidPageCTA";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <>
    <SEO
        title={"Velocity Influence — Marketing Platform + Agency for Growth"}
        description={"Run campaigns end-to-end with a marketing platform plus a full-service team. Try it instantly or book a demo with Velocity Influence."}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Velocity Influence",
              "url": "https://velocity-outreach.com",
              "description": "Global marketing and PR platform plus full-service agency for businesses and agencies.",
            },
            {
              "@type": "WebSite",
              "name": "Velocity Influence",
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
      <WhatWeDo />
      <PlatformPositioning />
      <IndustriesSection />
      <CampaignCapabilities />
      <ROICalculator />
      <AgencySection />
      <FeaturedWork />
      <MidPageCTA />
      <InsightsSection />
      <AgencyPositioning />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
