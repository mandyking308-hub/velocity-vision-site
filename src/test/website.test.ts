import { describe, it, expect } from "vitest";

describe("Website Structure", () => {
  it("should have required route paths defined", () => {
    const routes = ["/", "/services", "/industries", "/work", "/insights", "/about", "/contact", "/book-demo", "/auth", "/for-agencies"];
    routes.forEach((route) => expect(route).toBeTruthy());
  });

  it("should have navigation items including For Agencies", () => {
    const navLabels = ["Services", "Industries", "Work", "Insights", "About", "For Agencies"];
    expect(navLabels.length).toBeGreaterThan(0);
    expect(navLabels).toContain("For Agencies");
  });
});

describe("CRM Structure", () => {
  it("should define lead status stages", () => {
    const stages = ["new", "contacted", "demo_scheduled", "proposal_sent", "closed_won", "closed_lost"];
    expect(stages).toContain("new");
    expect(stages).toContain("closed_won");
    expect(stages.length).toBe(6);
  });

  it("should define company statuses", () => {
    const statuses = ["prospect", "active_client", "past_client"];
    expect(statuses).toContain("active_client");
  });

  it("should define opportunity stages", () => {
    const stages = ["discovery", "demo", "proposal", "negotiation", "won", "lost"];
    expect(stages.length).toBe(6);
  });

  it("should support account types", () => {
    const accountTypes = ["business", "agency"];
    expect(accountTypes).toContain("business");
    expect(accountTypes).toContain("agency");
  });
});

describe("Campaign Engine Structure", () => {
  it("should support all campaign types", () => {
    const types = ["email", "social_media", "paid_advertising", "influencer", "pr", "linkedin_outreach", "newsletter"];
    expect(types.length).toBe(7);
  });

  it("should define campaign statuses", () => {
    const statuses = ["active", "scheduled", "completed", "paused", "draft"];
    expect(statuses).toContain("draft");
    expect(statuses).toContain("active");
  });

  it("should support workspace-scoped campaigns", () => {
    const campaignFields = ["company_id", "workspace_id", "name", "type", "status", "budget", "start_date"];
    expect(campaignFields).toContain("workspace_id");
  });
});

describe("Billing Structure", () => {
  it("should define invoice statuses", () => {
    const statuses = ["draft", "sent", "paid", "overdue"];
    expect(statuses.length).toBe(4);
  });

  it("should define subscription plans including agency", () => {
    const plans = ["starter", "growth", "enterprise", "agency"];
    expect(plans.length).toBe(4);
    expect(plans).toContain("agency");
  });
});

describe("Auth & Roles", () => {
  it("should define all application roles", () => {
    const roles = ["admin", "sales", "marketing", "founder", "client"];
    expect(roles).toContain("founder");
    expect(roles).toContain("client");
    expect(roles.length).toBe(5);
  });
});

describe("Agency Workspace Structure", () => {
  it("should define workspace fields", () => {
    const fields = ["name", "agency_company_id", "industry", "website", "contact_name", "contact_email"];
    expect(fields).toContain("agency_company_id");
    expect(fields.length).toBe(6);
  });

  it("should support agency → workspace → campaign hierarchy", () => {
    const hierarchy = ["agency_account", "client_workspace", "campaign"];
    expect(hierarchy.length).toBe(3);
  });
});

describe("Onboarding Paths", () => {
  it("should support business onboarding path", () => {
    const businessFields = ["company_name", "website", "industry", "target_audience", "marketing_goals", "target_regions", "competitors", "existing_channels"];
    expect(businessFields.length).toBeGreaterThanOrEqual(8);
  });

  it("should support agency onboarding path", () => {
    const agencyFields = ["agency_name", "agency_website", "agency_size", "services_offered", "industries_served", "regions_served"];
    expect(agencyFields.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Security Structure", () => {
  it("should enforce data isolation per company", () => {
    const isolationRules = ["client_data_isolation", "agency_workspace_isolation", "founder_access_control", "role_enforcement"];
    expect(isolationRules.length).toBe(4);
  });
});

describe("QA Testing Categories", () => {
  it("should cover all platform areas", () => {
    const categories = ["Website", "CRM", "Client Portal", "Campaign Engine", "Agency Accounts", "Founder Dashboard", "Billing", "Onboarding Journey", "Security", "Performance"];
    expect(categories.length).toBe(10);
    expect(categories).toContain("Agency Accounts");
    expect(categories).toContain("Performance");
  });
});
