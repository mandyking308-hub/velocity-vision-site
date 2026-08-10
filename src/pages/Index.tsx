import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PremiumHomepage from "@/components/PremiumHomepage";

const Index = () => (
  <>
    <SEO
      title="Velocity Vision — Customer-controlled B2B campaign workspace"
      description="Self-serve B2B software that turns approved prospect data and one brief into a complete campaign pack — strategy, landing and offer copy, email sequences, press, social, video scripts, paid ads and lead capture — with governed sending, Buffer social handoff, replies and early pipeline."
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
              "Self-serve software for customer-provided business data, complete AI-assisted campaign packs, governed email activation, connected Buffer social handoff, follow-up records and early opportunity administration.",
          },
        ],
      }}
    />
    <Navbar />
    <main>
      <PremiumHomepage />
    </main>
    <Footer />
  </>
);

export default Index;
