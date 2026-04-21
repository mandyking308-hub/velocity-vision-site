import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
