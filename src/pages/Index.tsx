import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import WhatWeDo from "@/components/WhatWeDo";
import IndustriesSection from "@/components/IndustriesSection";
import CampaignCapabilities from "@/components/CampaignCapabilities";
import FeaturedWork from "@/components/FeaturedWork";
import InsightsSection from "@/components/InsightsSection";
import AgencyPositioning from "@/components/AgencyPositioning";
import FinalCTA from "@/components/FinalCTA";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <WhatWeDo />
      <IndustriesSection />
      <CampaignCapabilities />
      <FeaturedWork />
      <InsightsSection />
      <AgencyPositioning />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

export default Index;
