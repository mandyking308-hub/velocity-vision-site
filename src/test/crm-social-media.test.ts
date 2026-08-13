import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");

describe("CRM social media surface", () => {
  it("registers the protected /crm/social-media route", () => {
    const app = read("src/App.tsx");
    expect(app).toContain('import SocialMediaPage from "./pages/crm/SocialMediaPage.tsx"');
    expect(app).toContain('<Route path="social-media" element={<SocialMediaPage />} />');
  });

  it("exposes a Social Media nav item between Campaigns and Campaign Perf.", () => {
    const sidebar = read("src/components/crm/CRMSidebar.tsx");
    const campaigns = sidebar.indexOf('path: "/crm/campaigns"');
    const social = sidebar.indexOf('path: "/crm/social-media"');
    const perf = sidebar.indexOf('path: "/crm/campaign-dashboard"');
    expect(campaigns).toBeGreaterThan(-1);
    expect(social).toBeGreaterThan(campaigns);
    expect(perf).toBeGreaterThan(social);
    expect(sidebar).toContain('label: "Social Media"');
  });

  it("filters campaigns by social_media and links to campaign detail", () => {
    const page = read("src/pages/crm/SocialMediaPage.tsx");
    expect(page).toContain('c.type === "social_media"');
    expect(page).toContain("/crm/campaigns/");
  });

  it("states the customer-controlled Buffer handoff truth", () => {
    const page = read("src/pages/crm/SocialMediaPage.tsx");
    expect(page).toContain("Buffer publishing");
    expect(page).toContain("does not auto-publish");
    expect(page).toContain("/app/settings");
  });

  it("does not invent performance metrics we do not store", () => {
    const page = read("src/pages/crm/SocialMediaPage.tsx").toLowerCase();
    for (const banned of ["impression", "engagement rate", "reach", "followers"]) {
      expect(page).not.toContain(banned);
    }
  });

  it("surfaces social campaigns on the CRM dashboard", () => {
    const dash = read("src/pages/crm/CRMDashboard.tsx");
    expect(dash).toContain('"social_media"');
    expect(dash).toContain("/crm/social-media");
  });
});
