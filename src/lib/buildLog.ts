export interface BuildLogEntry {
  date: string;
  feature: string;
  description: string;
  component: string;
}

export const buildLog: BuildLogEntry[] = [
  {
    date: "2026-02-01",
    feature: "Platform Architecture",
    description: "Initial platform scaffolding with React, Vite, Tailwind CSS, and TypeScript. Established project structure, design system, and routing framework.",
    component: "Core Infrastructure"
  },
  {
    date: "2026-02-05",
    feature: "Public Website",
    description: "Created all public-facing pages: Homepage, Services, Industries, For Agencies, About, Contact, and Book a Demo. Implemented responsive navigation, hero sections, and lead capture forms.",
    component: "Website"
  },
  {
    date: "2026-02-10",
    feature: "Authentication System",
    description: "Implemented email/password authentication with signup, login, session management, and protected routes. Added role-based routing for CRM vs Client Portal.",
    component: "Authentication"
  },
  {
    date: "2026-02-14",
    feature: "Database Schema",
    description: "Designed and deployed core database tables: companies, contacts, leads, opportunities, campaigns, invoices, tasks, activities, notifications, and profiles. Applied Row-Level Security policies.",
    component: "Database"
  },
  {
    date: "2026-02-18",
    feature: "CRM System",
    description: "Built full CRM interface with company management, contact database, lead pipeline, opportunity tracking, and task management. Implemented CRUD operations across all entities.",
    component: "CRM"
  },
  {
    date: "2026-02-22",
    feature: "Campaign Engine",
    description: "Created campaign management system supporting email, social media, paid advertising, influencer, PR, LinkedIn outreach, and newsletter campaign types. Built campaign creation, editing, and status management.",
    component: "Campaigns"
  },
  {
    date: "2026-02-25",
    feature: "Campaign Analytics",
    description: "Implemented campaign performance dashboard with metrics tracking, charts, and reporting. Added daily metric entries for emails sent, open rates, click-through rates, leads generated, and ad spend.",
    component: "Analytics"
  },
  {
    date: "2026-02-28",
    feature: "Client Portal",
    description: "Built client-facing portal with dashboard, campaign views, document management, messaging, billing, notifications, and onboarding flow. Scoped to authenticated client users.",
    component: "Client Portal"
  },
  {
    date: "2026-03-01",
    feature: "Agency Workspace System",
    description: "Implemented multi-tenant agency workspace architecture. Agencies can create and manage multiple client workspaces, each with isolated campaigns, contacts, and analytics.",
    component: "Agency System"
  },
  {
    date: "2026-03-03",
    feature: "Billing System",
    description: "Created billing infrastructure including subscription management, invoice generation, payment recording, billing adjustments, and billing dashboard for both CRM and client portal.",
    component: "Billing"
  },
  {
    date: "2026-03-05",
    feature: "Founder Dashboard",
    description: "Built executive command dashboard with KPI cards, revenue growth charts, lead source analysis, campaign performance rankings, industry breakdown, client activity table, and activity feed.",
    component: "Founder Dashboard"
  },
  {
    date: "2026-03-07",
    feature: "Legal Centre",
    description: "Created Legal Centre with nine legal documents: Terms of Service, Client Services Agreement, Privacy Policy, Acceptable Use Policy, Marketing Compliance Policy, Data Processing Agreement, Cookie Policy, Platform Security Policy, and Service Level Agreement.",
    component: "Legal"
  },
  {
    date: "2026-03-08",
    feature: "Legal Acceptance System",
    description: "Implemented mandatory legal acceptance during signup with audit logging. Records user ID, email, account type, timestamp, IP address, and document versions. Created admin compliance dashboard.",
    component: "Legal Compliance"
  },
  {
    date: "2026-03-09",
    feature: "Demo Environment",
    description: "Created sandboxed demo environment with public login, 300 sample contacts, 3 demo campaigns, 3 agency workspaces, and analytics data. All write operations blocked with guard function.",
    component: "Demo Environment"
  },
  {
    date: "2026-03-10",
    feature: "QA Testing Dashboard",
    description: "Built QA testing dashboard for platform validation. Tracks test categories across website, demo, CRM, campaigns, agency, billing, legal, founder dashboard, and security modules.",
    component: "QA System"
  },
  {
    date: "2026-03-11",
    feature: "Founder Operations Manual",
    description: "Created comprehensive operations manual documenting all platform systems, architecture, workflows, and configurations. Includes platform build log, search functionality, and downloadable export.",
    component: "Documentation"
  },
  {
    date: "2026-03-15",
    feature: "Homepage Repositioning",
    description: "Refined homepage to position Velocity Influence as platform + agency. Added PlatformPositioning four-block grid and MidPageCTA. Updated HeroSection with dual CTAs ('Explore the Platform' and 'Book a Demo'). Tightened copy across WhatWeDo, IndustriesSection, CampaignCapabilities, AgencySection, and FinalCTA.",
    component: "Website"
  },
  {
    date: "2026-03-15",
    feature: "ROI Calculator",
    description: "Built homepage ROI calculator (src/components/ROICalculator.tsx) with inputs for deal value, close rate, and monthly leads. Computes monthly and annual revenue and compares against service cost. Includes lead-capture CTA.",
    component: "Website"
  },
  {
    date: "2026-03-18",
    feature: "Security Hardening — Phase 1",
    description: "Tenant isolation pass across 18 tables. Created app_private schema for security definer helpers (has_role, is_internal, user_company). Replaced broad RLS policies on profiles, user_roles, companies, contacts, invoices, payments, subscriptions, messages, notifications, client_documents, error_logs, qa_test_results. Enabled HIBP leaked-password protection. Converted client-documents storage bucket to private with folder-scoped policies.",
    component: "Security"
  },
  {
    date: "2026-03-19",
    feature: "SEO Phase 2",
    description: "Installed react-helmet-async with HelmetProvider. Created src/components/SEO.tsx and added per-page titles, meta descriptions, canonical URLs, and Open Graph tags across 9 public pages. Added Organization, WebSite, and CollectionPage JSON-LD. Created public/sitemap.xml, public/robots.txt, and public/llms.txt. Improved accessibility on Navbar mobile button and 'Learn More' links.",
    component: "SEO"
  },
  {
    date: "2026-03-19",
    feature: "CRM Route Protection",
    description: "Created src/components/CRMProtectedRoute.tsx enforcing internal-role requirement (founder, admin, sales, marketing) on every /crm/* route. Updated PortalDocuments to use 1-hour signed URLs for private-bucket downloads instead of public URLs.",
    component: "Security"
  },
  {
    date: "2026-03-20",
    feature: "Security Hardening — Phase 2",
    description: "Cleared residual USING(true)/WITH CHECK(true) policies on CRM tables (leads, opportunities, client_onboarding, campaign_requests, client_workspaces, campaigns, campaign_metrics, campaign_assets, notes, activities, tasks, campaign_attributions). Removed unrestricted anonymous INSERT policies on companies and contacts; anonymous writes restricted to leads table only. Scanner result: 42 findings → 0 critical.",
    component: "Security"
  },
  {
    date: "2026-03-22",
    feature: "Manual PDF Export",
    description: "Added PDF export to the Founder Operations Manual using jspdf and jspdf-autotable. Includes branded cover page, full table of contents, all chapters and sections paginated cleanly, and the build log as a formatted table with page-numbered footer. Markdown and Text exports retained.",
    component: "Documentation"
  },
  {
    date: "2026-06-30",
    feature: "Manual Refresh — Pre-Launch",
    description: "Refreshed Operations Manual with new chapters: Homepage Conversion Layer, SEO & Discoverability, Security Hardening Programme, and Operations Manual Export. Verified that every chapter, section, and build log entry is included in the PDF, Markdown, and Text exports with no truncation.",
    component: "Documentation"
  }
];
