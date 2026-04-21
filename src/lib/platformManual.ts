export interface ManualChapter {
  id: string;
  title: string;
  sections: ManualSection[];
}

export interface ManualSection {
  title: string;
  content: string;
}

export const platformManual: ManualChapter[] = [
  {
    id: "overview",
    title: "Platform Overview",
    sections: [
      {
        title: "Purpose & Vision",
        content: `Velocity Influence is a full-stack marketing operations platform engineered to act as the marketing engine for the broader organisation group. It unifies campaign execution, client relationship management, billing, compliance, and executive analytics into one cohesive system.\n\n**Three Core Functions:**\n- **Internal marketing engine** — powering campaigns across the organisation's portfolio of brands and ventures\n- **External client services** — managing end-to-end marketing campaigns for external business clients on a subscription basis\n- **Agency capability** — enabling marketing agencies to manage multiple client workspaces under a single parent account with full data isolation\n\n**Strategic Position:**\nVelocity Influence is the operational foundation for the broader AI infrastructure strategy. The architecture is designed so that intelligent automation, predictive lead scoring, AI-driven campaign optimisation, and generative content can be layered on top of the existing data model without re-engineering the platform.`
      },
      {
        title: "Platform Architecture",
        content: `The platform is a single-page application with a managed serverless backend.\n\n**Frontend Stack:**\n- **React 18** with functional components and hooks\n- **Vite 5** for development and production builds\n- **TypeScript 5** for type safety across the entire codebase\n- **Tailwind CSS v3** with HSL-based semantic design tokens\n- **shadcn/ui** for the base component library (40+ components)\n- **Framer Motion** for page transitions and micro-interactions\n- **Recharts** for all data visualisation\n- **React Router v6** for client-side routing\n- **TanStack Query (React Query)** for server-state and cache management\n- **React Hook Form + Zod** for form handling and validation\n- **Lucide React** for the icon system\n- **date-fns** for date manipulation\n\n**Backend Stack (Lovable Cloud):**\n- **PostgreSQL** database with Row-Level Security on every table\n- **Supabase Auth** for user authentication and JWT session management\n- **Supabase Storage** for file uploads (client documents, campaign assets)\n- **Edge Functions** for server-side logic (when required)\n- **Realtime subscriptions** for live data updates\n\n**Build & Deployment:**\n- Hot module replacement during development\n- Vite produces optimised production bundles\n- Lovable Cloud handles hosting, edge distribution, and SSL`
      },
      {
        title: "User Roles",
        content: `The platform uses role-based access control (RBAC) with five defined roles, stored in the dedicated \`user_roles\` table (never on the profiles table) to prevent privilege escalation attacks.\n\n| Role | Access Level | Primary Surface |\n|------|-------------|-----------------|\n| **Founder** | Full platform access, executive dashboard, operations manual, all CRM data | \`/crm/founder\`, \`/crm/manual\` |\n| **Admin** | Full CRM access, user management, legal compliance, QA dashboard | \`/crm/*\` |\n| **Sales** | CRM, leads, opportunities, contacts, companies | \`/crm/leads\`, \`/crm/opportunities\` |\n| **Marketing** | Campaigns, analytics, content, audiences | \`/crm/campaigns\`, \`/crm/campaign-dashboard\` |\n| **Client** | Client portal only — own company data | \`/portal/*\` |\n\n**Role Enforcement:**\nRoles are checked via the \`has_role(_user_id uuid, _role app_role)\` security definer function which bypasses RLS recursion. Client-side checks are mirrored on the server through RLS policies.`
      },
      {
        title: "High-Level Module Map",
        content: `The platform is organised into clearly bounded modules:\n\n1. **Public Website** — marketing presence, lead capture\n2. **Authentication** — signup, login, legal acceptance\n3. **CRM** — companies, contacts, leads, opportunities, tasks, activities\n4. **Campaign Engine** — campaign CRUD, audiences, assets, metrics\n5. **Client Portal** — client-facing interface scoped to their company\n6. **Agency Workspace System** — multi-tenant workspaces under an agency parent\n7. **Billing** — subscriptions, invoices, payments, adjustments\n8. **Legal Centre** — nine legal policies + acceptance audit log\n9. **Founder Dashboard** — executive analytics & KPIs\n10. **QA Dashboard** — test tracking across all modules\n11. **Operations Manual** — this document + build log\n12. **Demo Environment** — sandboxed public preview`
      }
    ]
  },
  {
    id: "website",
    title: "Website Architecture",
    sections: [
      {
        title: "Public Pages — Complete Inventory",
        content: `Every public page, its route, and primary purpose:\n\n| Page | Route | File | Purpose |\n|------|-------|------|---------|\n| **Homepage** | \`/\` | \`pages/Index.tsx\` | Hero, value proposition, featured work, final CTA |\n| **Services** | \`/services\` | \`pages/Services.tsx\` | Marketing services offered |\n| **Industries** | \`/industries\` | \`pages/Industries.tsx\` | Industry-specific solutions |\n| **For Agencies** | \`/for-agencies\` | \`pages/ForAgencies.tsx\` | Agency partnership programme |\n| **Work** | \`/work\` | \`pages/Work.tsx\` | Featured case studies |\n| **Insights** | \`/insights\` | \`pages/Insights.tsx\` | Articles & thought leadership |\n| **About** | \`/about\` | \`pages/About.tsx\` | Company story, team, mission |\n| **Contact** | \`/contact\` | \`pages/Contact.tsx\` | Contact form with lead capture |\n| **Book a Demo** | \`/book-demo\` | \`pages/BookDemo.tsx\` | Demo booking form |\n| **Legal Centre** | \`/legal\` | \`pages/legal/LegalCentre.tsx\` | Index of all legal documents |\n| **Legal Document** | \`/legal/:slug\` | \`pages/legal/LegalDocumentPage.tsx\` | Individual legal document view |\n| **Auth** | \`/auth\` | \`pages/AuthPage.tsx\` | Signup / Login |\n| **Demo Login** | \`/demo\` | \`pages/DemoLogin.tsx\` | Public demo entry point |\n| **Not Found** | \`*\` | \`pages/NotFound.tsx\` | 404 page |`
      },
      {
        title: "Homepage Composition",
        content: `The homepage (\`pages/Index.tsx\`) is composed of these sections in order:\n\n1. **HeroSection** — Headline, subheading, primary CTA "Explore the Platform" linking to \`/demo\`, secondary CTA to \`/book-demo\`\n2. **AgencyPositioning** — Statement of agency capability\n3. **WhatWeDo** — Four-pillar service overview\n4. **FeaturedWork** — Visual case study tiles\n5. **CampaignCapabilities** — Campaign engine highlights\n6. **AgencySection** — Deeper agency value proposition\n7. **IndustriesSection** — Industry verticals served\n8. **InsightsSection** — Latest articles preview\n9. **FinalCTA** — Conversion-focused closing CTA\n10. **Footer** — Site map, legal links, social\n\nAll sections are individual components in \`src/components/\` for maintainability.`
      },
      {
        title: "Navigation",
        content: `**Top Navigation (\`components/Navbar.tsx\`):**\n- Logo (links to \`/\`)\n- Primary nav links: Services, Industries, For Agencies, Work, About\n- Secondary actions: Book a Demo, Sign In\n- Mobile: hamburger menu with full-screen drawer\n\n**Footer (\`components/Footer.tsx\`):**\n- Company info\n- Quick links to all primary pages\n- Legal links (Privacy, Terms, Cookies)\n- Social media\n- Copyright notice with current year\n\n**Page Transitions:**\n\`PageTransition.tsx\` wraps route changes with Framer Motion fade/slide animations. \`ScrollToTop.tsx\` ensures every route change scrolls to top.`
      },
      {
        title: "Design System",
        content: `**Token Source of Truth:**\n- \`src/index.css\` — CSS variables (\`--background\`, \`--foreground\`, \`--primary\`, \`--accent\`, etc.) defined in HSL\n- \`tailwind.config.ts\` — Maps CSS variables to Tailwind colour utilities\n\n**Critical Rule:** Components MUST use semantic tokens (e.g. \`bg-primary\`, \`text-foreground\`) and NEVER hard-coded colours (\`bg-white\`, \`text-black\`). This guarantees consistent theming.\n\n**Typography:**\n- Display font for headings (\`font-display\`)\n- Body font for paragraphs and UI\n- Defined in \`tailwind.config.ts\` font families\n\n**Spacing & Layout:**\n- Container max-width with responsive padding\n- Mobile-first breakpoints: \`sm\` 640, \`md\` 768, \`lg\` 1024, \`xl\` 1280\n\n**Components:**\nAll base components live in \`src/components/ui/\` (shadcn/ui). Custom components in \`src/components/\` extend or compose these.`
      },
      {
        title: "SEO Requirements",
        content: `Every page must include:\n- **Title tag** under 60 characters with primary keyword\n- **Meta description** under 160 characters\n- **Single H1** per page\n- **Semantic HTML** (\`<header>\`, \`<main>\`, \`<section>\`, \`<article>\`)\n- **Alt text** on all meaningful images\n- **JSON-LD structured data** where applicable (Organization, Article)\n- **Canonical tag** to prevent duplicate content\n- **Responsive viewport** meta tag\n- **Open Graph tags** for social sharing`
      }
    ]
  },
  {
    id: "auth",
    title: "Authentication System",
    sections: [
      {
        title: "Signup Flow",
        content: `**Route:** \`/auth\` (\`pages/AuthPage.tsx\`)\n\n**Signup Steps:**\n1. User selects account type: **Business** or **Agency**\n2. User enters first name, last name, email, password\n3. User must check the **mandatory legal acceptance checkbox** confirming agreement to:\n   - Platform Terms of Service\n   - Client Services Agreement\n   - Privacy Policy\n   - All other applicable legal documents (Acceptable Use, Marketing Compliance, DPA, Cookies, Security, SLA)\n4. On submit:\n   - \`supabase.auth.signUp()\` creates the user\n   - Email verification is sent (auto-confirm is disabled by default)\n   - Profile row inserted into \`profiles\` table\n   - Default role assigned\n   - Legal acceptance record inserted into \`legal_acceptances\` with IP captured via ipify API\n5. User redirected to verify email page\n\n**Important:** Anonymous sign-ups are disabled. All users must complete the standard signup flow.`
      },
      {
        title: "Login Flow",
        content: `**Login Steps:**\n1. User enters email and password\n2. \`supabase.auth.signInWithPassword()\` validates credentials\n3. On success:\n   - Session stored in \`localStorage\` with auto-refresh token\n   - \`AuthContext\` updates with user and session\n   - User redirected based on role:\n     - Founder/Admin/Sales/Marketing → \`/crm/dashboard\`\n     - Client → \`/portal/dashboard\`\n4. Failed login displays toast notification\n\n**Auto Token Refresh:** Supabase client is configured with \`autoRefreshToken: true\` so sessions persist seamlessly.`
      },
      {
        title: "AuthContext",
        content: `**Location:** \`src/contexts/AuthContext.tsx\`\n\n**Provides:**\n- \`user\` — current Supabase User object or null\n- \`session\` — current Session object or null\n- \`loading\` — boolean while initial auth state is being resolved\n- \`signOut()\` — async function to terminate session\n\n**Initialisation Pattern:**\n1. Subscribe to \`supabase.auth.onAuthStateChange()\` FIRST\n2. THEN call \`supabase.auth.getSession()\` to get existing session\n\nThis order prevents race conditions where the app loads before auth state is hydrated.`
      },
      {
        title: "Protected Routes",
        content: `Routes inside \`/crm/*\` and \`/portal/*\` are protected. Each layout (\`CRMLayout\`, \`PortalLayout\`) checks:\n1. \`useAuth()\` — is the user authenticated?\n2. If not → redirect to \`/auth\`\n3. If yes → query \`user_roles\` to determine permitted access\n4. If role mismatch → redirect to appropriate surface or show "Access Denied"`
      },
      {
        title: "Session Management",
        content: `- Sessions persist across browser restarts via \`localStorage\`\n- JWT tokens automatically refresh before expiry\n- Sign out clears local session and revokes server-side\n- Multi-tab sync via Supabase auth listener`
      }
    ]
  },
  {
    id: "crm",
    title: "CRM System",
    sections: [
      {
        title: "Lead Capture Channels",
        content: `Leads enter the system through multiple channels, all writing to the \`leads\` table:\n\n1. **Contact form** (\`/contact\`) — captures name, email, company, message; creates contact + lead with \`source = 'contact_form'\`\n2. **Book a Demo form** (\`/book-demo\`) — captures demo request; creates contact + lead with \`source = 'book_demo'\`\n3. **Manual entry** — CRM users create leads via \`/crm/leads\` "+ New Lead" button\n4. **Campaign attribution** — leads attributed to specific campaigns via \`campaign_attributions\` table\n\nEach lead links to a contact (\`contact_id\`) and optionally a company (\`company_id\`).`
      },
      {
        title: "Companies Module",
        content: `**Route:** \`/crm/companies\` (\`pages/crm/CompaniesPage.tsx\`)\n\n**Schema (\`companies\` table):**\n| Field | Type | Notes |\n|-------|------|-------|\n| id | uuid | Primary key |\n| name | text | Required |\n| account_type | text | 'business' or 'agency' |\n| status | enum | prospect / active_client / past_client |\n| industry | text | Industry vertical |\n| country | text | ISO country |\n| company_size | text | e.g. "11-50" |\n| website | text | URL |\n| created_at, updated_at | timestamptz | Auto-managed |\n| created_by | uuid | User who created |\n\n**Relationships:**\n- One company → many contacts, leads, opportunities, campaigns, invoices, subscriptions\n- One agency company → many client_workspaces`
      },
      {
        title: "Contacts Module",
        content: `**Route:** \`/crm/contacts\` (\`pages/crm/ContactsPage.tsx\`)\n\n**Schema (\`contacts\` table):**\n| Field | Type | Notes |\n|-------|------|-------|\n| id | uuid | PK |\n| first_name, last_name | text | Required |\n| email | text | Optional but indexed |\n| phone | text | Optional |\n| company_id | uuid | FK to companies |\n| job_title | text | Decision-making context |\n| decision_maker_level | text | e.g. "C-Suite", "Manager" |\n| linkedin_url | text | Profile link |\n| created_at, updated_at | timestamptz | Auto-managed |\n\n**Operations:**\n- Search & filter by name/email/company\n- Click-through to contact detail with activity timeline\n- Inline edit\n- Bulk operations (planned)`
      },
      {
        title: "Leads Pipeline",
        content: `**Route:** \`/crm/leads\` (\`pages/crm/LeadsPage.tsx\`)\n\n**Pipeline Stages (\`lead_status\` enum):**\n1. **new** — Fresh lead, not yet contacted\n2. **contacted** — Initial outreach made\n3. **demo_scheduled** — Discovery call or demo booked\n4. **proposal_sent** — Formal proposal delivered\n5. **closed_won** — Converted to client (triggers opportunity creation)\n6. **closed_lost** — Did not convert (with optional reason)\n\n**Lead Schema:**\n- contact_id, company_id, source, status, marketing_interest, created_by, timestamps\n\n**Pipeline View:**\n- Kanban-style columns by status\n- Drag-to-move between stages\n- Filter by source, date range, owner`
      },
      {
        title: "Opportunities Module",
        content: `**Route:** \`/crm/opportunities\` (\`pages/crm/OpportunitiesPage.tsx\`)\n\n**Schema (\`opportunities\` table):**\n| Field | Type | Notes |\n|-------|------|-------|\n| stage | enum | discovery / demo / proposal / negotiation / won / lost |\n| estimated_value | numeric | Deal size |\n| probability | numeric | 0-100% |\n| expected_close_date | date | Forecast date |\n| service | text | Service line |\n| company_id, contact_id | uuid | FKs |\n\n**Forecasting:**\n- Pipeline value = sum of (estimated_value × probability) for non-closed stages\n- Won deals roll into revenue analytics`
      },
      {
        title: "Tasks & Activities",
        content: `**Tasks (\`/crm/tasks\`):**\n- Status: pending / in_progress / completed\n- Assigned to user, due date, linked to entity (lead, opportunity, etc.)\n\n**Activities (\`activities\` table):**\n- Types: email, call, meeting, note, campaign_interaction\n- Logged against contacts for audit trail\n- Displayed as timeline on contact detail view\n\n**Notes (\`notes\` table):**\n- Polymorphic: linked via \`entity_type\` + \`entity_id\` to any record\n- Used for free-form context on leads, opportunities, companies`
      },
      {
        title: "CRM Dashboard",
        content: `**Route:** \`/crm/dashboard\` (\`pages/crm/CRMDashboard.tsx\`)\n\n**Widgets:**\n- New leads this week\n- Open opportunities count + total pipeline value\n- Tasks due today\n- Recent activities feed\n- Top performing campaigns\n- Quick action buttons (new lead, new task, new contact)`
      }
    ]
  },
  {
    id: "campaigns",
    title: "Campaign Engine",
    sections: [
      {
        title: "Campaign Types",
        content: `The platform supports seven campaign types (\`campaign_type\` enum):\n\n1. **email** — Direct email marketing\n2. **social_media** — Organic social content\n3. **paid_advertising** — PPC, display, programmatic ads\n4. **influencer** — Influencer partnership\n5. **pr** — Public relations & media outreach\n6. **linkedin_outreach** — B2B prospecting on LinkedIn\n7. **newsletter** — Recurring newsletter\n\nEach type unlocks type-specific metric fields and asset requirements.`
      },
      {
        title: "Campaign Lifecycle",
        content: `**States (\`campaign_status\` enum):**\n- **draft** — Being configured, no scheduled date\n- **scheduled** — Ready to launch at \`start_date\`\n- **active** — Currently running\n- **paused** — Temporarily suspended\n- **completed** — Finished (past \`end_date\`)\n\n**Lifecycle Rules:**\n- Drafts can be deleted; active campaigns cannot\n- Pausing freezes metric collection\n- Completed campaigns are read-only`
      },
      {
        title: "Campaign Schema",
        content: `**Table: \`campaigns\`**\n\n| Field | Type | Notes |\n|-------|------|-------|\n| id | uuid | PK |\n| name | text | Required |\n| type | enum | One of seven types |\n| status | enum | draft/scheduled/active/paused/completed |\n| company_id | uuid | Owning company |\n| workspace_id | uuid | Optional, for agency workspaces |\n| budget | numeric | Total budget |\n| start_date, end_date | date | Schedule |\n| objective | text | Goal statement |\n| target_audience_description | text | Audience definition |\n| owner_id | uuid | Campaign owner |\n| created_by, created_at, updated_at | — | Audit fields |`
      },
      {
        title: "Audiences",
        content: `**Table: \`campaign_audiences\`**\n\nStores the target list per campaign:\n- name, email, company_name, job_title, industry\n- contact_id (optional link to existing contact)\n\nAudiences can be uploaded via CSV (production) or hand-built. Demo environment blocks uploads.`
      },
      {
        title: "Assets",
        content: `**Table: \`campaign_assets\`**\n\nFiles attached to a campaign:\n- name, file_url, file_size, asset_type (image/video/document/copy)\n- uploaded_by, created_at\n- Stored in \`client-documents\` Supabase storage bucket`
      },
      {
        title: "Performance Metrics",
        content: `**Table: \`campaign_metrics\`** — daily entries per campaign\n\n| Metric | Field | Description |\n|--------|-------|-------------|\n| Emails sent | emails_sent | Outbound volume |\n| Open rate | open_rate | % opened |\n| Click-through rate | click_through_rate | % clicked |\n| Clicks | clicks | Total clicks |\n| Replies | replies | Reply count |\n| Conversions | conversions | Goal completions |\n| Conversion rate | conversion_rate | % converted |\n| Leads generated | leads_generated | New leads attributed |\n| Ad spend | ad_spend | Daily expenditure |\n| Cost per lead | cost_per_lead | Calculated CPL |\n| Impressions | impressions | Total impressions |\n| Reach | reach | Unique audience |\n| Engagement | engagement | Engagement actions |\n| Traffic | traffic | Site visits attributed |\n\nMetrics are aggregated for the dashboard via SQL views.`
      },
      {
        title: "Campaign Dashboard",
        content: `**Route:** \`/crm/campaign-dashboard\` (\`pages/crm/CampaignDashboard.tsx\`)\n\n**Visualisations:**\n- Status breakdown (pie)\n- Performance comparison (bar) across campaigns\n- Lead generation trend (line) over time\n- ROI & cost-per-lead (table)\n- Top campaigns by leads (horizontal bar)\n- Drill-down to individual campaign detail (\`/crm/campaign/:id\`)`
      },
      {
        title: "Campaign Requests (Client Portal)",
        content: `**Table: \`campaign_requests\`**\n\nClients submit campaign briefs from the portal:\n- objective, target_audience, budget_range, timeline, notes\n- status: pending / reviewed / approved / rejected\n\nMarketing team reviews requests in \`/crm/campaigns\` and converts approved requests into actual campaigns.`
      }
    ]
  },
  {
    id: "portal",
    title: "Client Portal",
    sections: [
      {
        title: "Portal Architecture",
        content: `**Layout:** \`pages/PortalLayout.tsx\` wraps all portal routes. Sidebar (\`components/portal/PortalSidebar.tsx\`) provides navigation.\n\n**Access Control:**\n- Only authenticated users with \`client\` role\n- Data scoped via \`useClientCompany\` hook to the user's \`company_id\`\n- All queries filter by company_id; RLS enforces server-side`
      },
      {
        title: "Portal Pages",
        content: `| Page | Route | File |\n|------|-------|------|\n| Dashboard | \`/portal/dashboard\` | \`PortalDashboard.tsx\` |\n| Campaigns | \`/portal/campaigns\` | \`PortalCampaigns.tsx\` |\n| Campaign Request | \`/portal/campaign-request\` | \`PortalCampaignRequest.tsx\` |\n| Documents | \`/portal/documents\` | \`PortalDocuments.tsx\` |\n| Messages | \`/portal/messages\` | \`PortalMessages.tsx\` |\n| Billing | \`/portal/billing\` | \`PortalBilling.tsx\` |\n| Notifications | \`/portal/notifications\` | \`PortalNotifications.tsx\` |\n| Onboarding | \`/portal/onboarding\` | \`PortalOnboarding.tsx\` |\n| Workspaces (agency only) | \`/portal/workspaces\` | \`PortalWorkspaces.tsx\` |\n| Legal | \`/portal/legal\` | \`PortalLegal.tsx\` |`
      },
      {
        title: "Onboarding Flow",
        content: `**Table: \`client_onboarding\`**\n\nFields collected:\n- business_description, services_offered, industries_served, target_audience, target_regions\n- marketing_goals, existing_channels, competitors\n- agency_size (agency accounts only)\n- completed (boolean), completed_at\n\nOnboarding is required before campaign requests can be submitted. Agencies fill an extended version including agency-specific clauses.`
      },
      {
        title: "Documents",
        content: `**Table: \`client_documents\`**\n\nStored in \`client-documents\` storage bucket. Categorised by \`document_type\`:\n- contract, brief, asset, report, invoice\n\nClients can upload (production) and download. Demo environment blocks uploads.`
      },
      {
        title: "Messaging",
        content: `**Table: \`messages\`**\n\nTwo-way client ↔ team messaging:\n- content, file_url (optional attachment)\n- is_from_client (boolean)\n- read (boolean) — drives unread badges\n- Realtime subscription for live updates`
      },
      {
        title: "Notifications",
        content: `**Table: \`notifications\`**\n\nPer-user notifications:\n- title, message, type (info/success/warning/error)\n- link (optional deep link)\n- read (boolean)\n- RLS: users can only view/update their own`
      }
    ]
  },
  {
    id: "agency",
    title: "Agency Workspace System",
    sections: [
      {
        title: "Workspace Concept",
        content: `An **agency** is a company with \`account_type = 'agency'\`. A single agency manages multiple **client workspaces**, each representing one of their clients. Workspaces provide complete data isolation while sharing a single agency login.`
      },
      {
        title: "Workspace Schema",
        content: `**Table: \`client_workspaces\`**\n\n| Field | Type | Notes |\n|-------|------|-------|\n| id | uuid | PK |\n| agency_company_id | uuid | FK to parent agency company |\n| name | text | Workspace name (e.g. "Alpha Technologies") |\n| contact_name, contact_email | text | Client contact at this workspace |\n| industry | text | Workspace industry |\n| website | text | Workspace site |\n| created_at, updated_at | timestamptz | — |\n\n**Cascade:** Deleting an agency company cascades to its workspaces.`
      },
      {
        title: "Workspace Manager",
        content: `**Component:** \`components/portal/WorkspaceManager.tsx\`\n\nProvides workspace switcher in the portal sidebar. Selecting a workspace scopes all subsequent queries (campaigns, contacts, metrics) to that workspace_id.`
      },
      {
        title: "Data Separation",
        content: `**Isolation Rules:**\n- Campaigns reference workspace_id; queries filter accordingly\n- Audiences inherit workspace via parent campaign\n- Analytics dashboards aggregate per-workspace\n- One workspace cannot see another's data even within the same agency\n- RLS policies enforce isolation at the database level`
      },
      {
        title: "Agency Onboarding",
        content: `Agencies complete an extended onboarding including:\n- Business description, services offered\n- Industries served, target regions\n- Agency size (1-10 / 11-50 / 51-200 / 200+)\n- Acceptance of agency-specific legal clause confirming responsibility for client data and end-client compliance\n- Initial workspace setup`
      }
    ]
  },
  {
    id: "demo",
    title: "Demo Environment",
    sections: [
      {
        title: "Access",
        content: `**Public route:** \`/demo\` (\`pages/DemoLogin.tsx\`)\n\n**Credentials:**\n- Email: \`demo@velocityinfluence.com\`\n- Password: \`DemoAccess123\`\n\nLinked from the homepage hero via the "Explore the Platform" button.`
      },
      {
        title: "Sample Data",
        content: `**Source:** \`src/lib/demoData.ts\` — pure client-side data, no database interaction.\n\n**Contents:**\n- **300 sample contacts** across multiple industries with realistic pipeline distribution\n- **3 campaigns:**\n  - Product Launch Outreach (email) — 2,000 sent, 42% open, 18% CTR\n  - Enterprise Outreach Program (LinkedIn) — 850 messages, 21% response\n  - Digital Growth Campaign (paid ads) — 132 leads, $27 CPL\n- **3 agency workspaces:** Alpha Technologies, Horizon Medical, Atlas Finance\n- **Analytics:** 8 total campaigns, 3 active, 420 leads/month, 14% conversion rate`
      },
      {
        title: "Sandbox Restrictions",
        content: `**Mechanism:** \`DemoContext\` (\`src/contexts/DemoContext.tsx\`) tracks demo state. The \`guardAction()\` helper intercepts write operations.\n\n**Blocked Actions:**\n- Sending real campaigns\n- Uploading marketing lists\n- Modifying billing settings\n- Changing system configuration\n- Creating real user accounts\n\n**User Feedback:** Each blocked action shows toast: *"This feature is disabled in the demo environment."*\n\n**Banner:** \`DemoBanner.tsx\` displays a sticky top banner: *"You are currently viewing the Velocity Influence Demo Environment. Data shown here is sample data for demonstration purposes."*`
      },
      {
        title: "Demo Routes",
        content: `| Route | File | Purpose |\n|-------|------|---------|\n| \`/demo\` | \`DemoLogin.tsx\` | Branded entry / login page |\n| \`/demo/crm\` | \`demo/DemoCRMDashboard.tsx\` | Demo CRM dashboard |\n| \`/demo/*\` (wrapped) | \`demo/DemoCRMLayout.tsx\` | Layout with banner & sidebar |`
      },
      {
        title: "Reset Mechanism",
        content: `Demo data is in-memory only — no database writes. Page refresh effectively resets state. There is no need for a scheduled reset since the underlying production data is never touched.`
      },
      {
        title: "CTA Inside Demo",
        content: `A persistent **"Create My Account"** button in the demo banner redirects users to \`/auth\` so they can convert from explorer to customer.`
      }
    ]
  },
  {
    id: "billing",
    title: "Billing System",
    sections: [
      {
        title: "Subscriptions",
        content: `**Table: \`subscriptions\`**\n\n| Field | Type | Notes |\n|-------|------|-------|\n| company_id | uuid | FK |\n| plan_name | text | Tier identifier |\n| monthly_price | numeric | In platform currency |\n| start_date | date | Subscription start |\n| renewal_date | date | Next renewal |\n| status | text | active / paused / cancelled |\n| created_by, timestamps | — | Audit |\n\nOne company → many subscriptions (history retained).`
      },
      {
        title: "Invoices",
        content: `**Table: \`invoices\`**\n\n| Field | Type | Notes |\n|-------|------|-------|\n| invoice_number | text | Unique reference |\n| amount | numeric | Total |\n| status | enum | draft / sent / paid / overdue |\n| due_date | date | Payment deadline |\n| paid_date | date | When paid |\n| description | text | Line summary |\n| file_url | text | Downloadable PDF |\n\n**State Machine:** draft → sent → (paid OR overdue → paid)`
      },
      {
        title: "Payments",
        content: `**Table: \`payments\`**\n\nRecords actual payments against invoices:\n- amount, method (card/bank_transfer/other), status, notes\n- Linked to invoice_id and company_id\n- Multiple payments possible per invoice (partial payments)`
      },
      {
        title: "Billing Adjustments",
        content: `**Table: \`billing_adjustments\`**\n\nCredits/debits applied to a company:\n- type: credit / debit\n- amount, reason (audit trail)\n- Optionally linked to invoice_id\n- Used for refunds, goodwill credits, corrections`
      },
      {
        title: "Billing Dashboards",
        content: `**CRM:** \`/crm/billing\` (\`BillingPage.tsx\`) — full invoice management, payment recording, adjustments\n\n**Portal:** \`/portal/billing\` (\`PortalBilling.tsx\`) — client-side view of own invoices, download PDFs, payment history\n\n**Founder Dashboard:** Aggregates revenue, MRR, outstanding balances`
      }
    ]
  },
  {
    id: "legal-centre",
    title: "Legal Centre",
    sections: [
      {
        title: "Overview",
        content: `**Route:** \`/legal\` (\`pages/legal/LegalCentre.tsx\`)\n\nIndex page listing all nine legal documents with version and last-updated metadata. Each document has its own page at \`/legal/:slug\` rendered by \`LegalDocumentPage.tsx\` using a structured two-column layout with sticky sidebar navigation.`
      },
      {
        title: "Documents Inventory",
        content: `1. **Platform Terms of Service** — Core terms governing platform use\n2. **Client Services Agreement** — Terms for marketing services delivery\n3. **Privacy Policy** — Data collection, processing, retention practices\n4. **Acceptable Use Policy** — Prohibited conduct and content\n5. **Marketing Compliance Policy** — Advertising standards & regulations (CAN-SPAM, GDPR, PECR)\n6. **Data Processing Agreement** — GDPR-compliant data processing terms\n7. **Cookie Policy** — Cookie usage, categories, consent mechanism\n8. **Platform Security Policy** — Security measures, encryption, incident response\n9. **Service Level Agreement** — Uptime guarantees, support tiers, credits`
      },
      {
        title: "Document Structure",
        content: `Each legal document page follows the same SaaS legal layout:\n- **Two-column layout:** sticky sidebar nav (left), document content (right)\n- **Sidebar:** numbered section list with smooth-scroll anchors\n- **Content:** expandable/collapsible sections, version & last updated header\n- **Footer:** *Velocity Influence Agency — Trading name of Global Solutions Management LLC, Delaware, United States*\n- **Contact link:** for legal enquiries`
      },
      {
        title: "Version Management",
        content: `**File:** \`src/lib/legalVersions.ts\`\n\nTracks current version of each document and overall legal framework version. When any document version changes, users are prompted to re-accept on next login (compares acceptance record's \`document_versions\` JSON against current versions).`
      }
    ]
  },
  {
    id: "legal-acceptance",
    title: "Legal Acceptance System",
    sections: [
      {
        title: "Acceptance Flow",
        content: `Triggered during:\n- **Account creation** (mandatory)\n- **Subscription purchase** (re-confirm)\n- **Onboarding** (client/agency)\n- **Document version updates** (re-accept on next login)\n\n**UI:** Mandatory checkbox with the statement:\n> "I confirm that I have read and agree to the Platform Terms of Service and Client Services Agreement, and acknowledge the Privacy Policy and other applicable legal policies."\n\nLinks to all relevant documents open in new tabs. The submit button is disabled until the checkbox is checked.`
      },
      {
        title: "Audit Record",
        content: `**Table: \`legal_acceptances\`** (append-only)\n\n| Field | Type | Description |\n|-------|------|-------------|\n| id | uuid | PK |\n| user_id | uuid | Authenticated user |\n| email | text | User's email |\n| account_type | text | business / agency |\n| accepted_at | timestamptz | Server timestamp |\n| ip_address | text | Captured via ipify API |\n| legal_version | text | Framework version |\n| document_versions | jsonb | Map of doc → version |\n| created_at | timestamptz | Auto |\n\n**RLS:** Users can INSERT their own; they can SELECT their own. UPDATE and DELETE are blocked entirely (audit integrity).`
      },
      {
        title: "Admin Compliance Dashboard",
        content: `**Route:** \`/crm/legal-compliance\` (\`pages/crm/LegalCompliancePage.tsx\`)\n\n**Restricted to:** founder, admin\n\n**Features:**\n- Searchable acceptance records\n- Filter by account type, date range\n- Compliance statistics (total acceptances, by account type, by document version)\n- Export to CSV for external audit`
      }
    ]
  },
  {
    id: "founder-dashboard",
    title: "Founder Dashboard",
    sections: [
      {
        title: "Access",
        content: `**Route:** \`/crm/founder\` (\`pages/crm/FounderDashboard.tsx\`)\n\n**Restricted to:** \`founder\` and \`admin\` roles. Verified server-side via \`user_roles\` query. Unauthorised users see "Access Denied".`
      },
      {
        title: "KPI Cards",
        content: `Top-of-page metrics:\n- **Active Clients** — count of companies with status = active_client\n- **Active Campaigns** — count of campaigns with status = active\n- **Leads This Month** — leads created this calendar month\n- **Leads This Week** — leads created in last 7 days\n- **Revenue This Month** — sum of paid invoices this month\n- **Pipeline Value** — sum of (estimated_value × probability) for open opportunities`
      },
      {
        title: "Charts",
        content: `- **Revenue Growth** — 6-month area chart of monthly revenue\n- **Lead Sources** — pie chart breakdown by source\n- **Top Campaigns by Leads** — horizontal bar chart\n- **Revenue by Industry** — vertical bar chart\n- **Agency vs Business clients** — comparison\n\nAll charts use Recharts with semantic theme tokens for consistent styling.`
      },
      {
        title: "Tables & Feeds",
        content: `- **Client Activity Table** — campaigns, monthly revenue, last activity per client\n- **Activity Feed** — chronological stream of leads, campaigns, deals, invoices\n- **Quick Actions** — links to manual, QA dashboard, legal compliance`
      }
    ]
  },
  {
    id: "qa",
    title: "QA System",
    sections: [
      {
        title: "QA Dashboard",
        content: `**Route:** \`/crm/qa\` (\`pages/crm/QADashboard.tsx\`)\n\n**Purpose:** Track all platform tests across modules to validate launch readiness.\n\n**Categories Tracked:**\n1. Website\n2. Demo Environment\n3. CRM\n4. Campaign Engine\n5. Agency Workspace\n6. Billing\n7. Legal Acceptance\n8. Founder Dashboard\n9. Security\n10. Error Logging`
      },
      {
        title: "Test Records",
        content: `**Table: \`qa_test_results\`**\n\n| Field | Type |\n|-------|------|\n| test_name | text |\n| category | text |\n| description | text |\n| status | text (pass / fail / pending) |\n| last_run_at | timestamptz |\n| run_by | uuid |\n| notes | text |\n\nAdmins can populate seed tests, run them, mark pass/fail, and add notes.`
      },
      {
        title: "Error Logs",
        content: `**Table: \`error_logs\`**\n\nCaptures runtime errors:\n- category, message, details, severity, resolved (bool)\n- Surfaced in admin monitoring view\n\nUsed to track login errors, form errors, campaign processing errors, payment failures.`
      }
    ]
  },
  {
    id: "manual-system",
    title: "Operations Manual System",
    sections: [
      {
        title: "Architecture",
        content: `**Route:** \`/crm/manual\` (\`pages/crm/FounderManual.tsx\`)\n\n**Restricted to:** founder, admin\n\n**Data Sources:**\n- \`src/lib/platformManual.ts\` — chapter & section content (this document)\n- \`src/lib/buildLog.ts\` — chronological build log entries`
      },
      {
        title: "Features",
        content: `- **Sidebar navigation** — chapter list with active highlighting\n- **Tabs** — Manual / Build Log\n- **Search** — full-text across chapter titles, section titles, content\n- **Expandable sections** — click to expand/collapse\n- **Export buttons** — Markdown (.md) and Plain Text (.txt) downloads\n- **Build log timeline** — visual chronology with date, component tag, description`
      },
      {
        title: "Self-Updating Documentation",
        content: `Whenever new features, dashboards, forms, or integrations are added, the corresponding chapter in \`platformManual.ts\` and a new entry in \`buildLog.ts\` should be appended. The build log is append-only — entries should never be edited or removed.`
      }
    ]
  },
  {
    id: "security",
    title: "Security Architecture",
    sections: [
      {
        title: "Authentication Security",
        content: `- Email/password with mandatory verification\n- Passwords hashed by Supabase Auth (bcrypt)\n- JWT sessions with auto-refresh\n- No anonymous sign-ups\n- Rate limiting on auth endpoints (managed by Supabase)`
      },
      {
        title: "Row-Level Security (RLS)",
        content: `**Every table has RLS enabled.** Key patterns:\n\n- **legal_acceptances:** SELECT/INSERT only own records; UPDATE/DELETE blocked\n- **notifications:** SELECT/UPDATE only own\n- **profiles:** UPDATE only own\n- **user_roles:** Only founder/admin can manage roles\n- **client portal tables (campaigns, invoices, etc.):** Filter by company_id matching user's profile.company_id\n- **CRM tables:** Authenticated users with appropriate role\n\n**\`has_role()\` Function:** Security definer function that bypasses RLS recursion when checking roles in policies.`
      },
      {
        title: "Roles Storage",
        content: `**CRITICAL:** Roles are stored in the dedicated \`user_roles\` table, NOT on profiles. Storing roles on profiles enables privilege escalation attacks where users could update their own role. The dedicated table with restrictive RLS prevents this.`
      },
      {
        title: "Demo Environment Security",
        content: `- Fully sandboxed; uses client-side mock data only (\`src/lib/demoData.ts\`)\n- No database reads or writes from demo routes\n- All write operations intercepted by \`guardAction()\`\n- Session-based state, resets on refresh\n- Cannot access production data or live systems`
      },
      {
        title: "Data Protection",
        content: `- HTTPS enforced for all traffic\n- Encrypted at rest (Supabase managed)\n- Encrypted in transit (TLS 1.2+)\n- Secrets stored in environment variables, never committed\n- File uploads scoped to authenticated users via storage RLS\n- IP addresses captured for legal acceptance audit only`
      },
      {
        title: "Access Control Summary",
        content: `| Surface | Who Can Access |\n|---------|---------------|\n| Public website | Everyone |\n| Demo environment | Everyone |\n| Auth pages | Unauthenticated only |\n| Client portal | client role + own company data |\n| CRM | sales / marketing / admin / founder |\n| Founder dashboard | founder / admin |\n| Operations manual | founder / admin |\n| Legal compliance | founder / admin |\n| QA dashboard | founder / admin |`
      }
    ]
  },
  {
    id: "integrations",
    title: "System Integrations",
    sections: [
      {
        title: "Lovable Cloud (Backend)",
        content: `Provides the entire backend stack:\n- **PostgreSQL database** with Row-Level Security\n- **Supabase Auth** for authentication\n- **Edge Functions** for server-side logic\n- **Storage** for file uploads (\`client-documents\` bucket)\n- **Realtime** for live subscriptions\n- **Auto-generated TypeScript types** in \`src/integrations/supabase/types.ts\``
      },
      {
        title: "External Services",
        content: `| Service | Purpose | Where Used |\n|---------|---------|-----------|\n| **ipify API** | Captures user IP for legal acceptance audit | Signup flow |\n| **Recharts** | All chart rendering | Dashboards |\n| **Framer Motion** | Animations & transitions | App-wide |\n| **date-fns** | Date formatting & manipulation | App-wide |\n| **Lucide React** | Icon library | App-wide |`
      },
      {
        title: "Key Data Flows",
        content: `1. **Lead capture:** Contact/Demo form → \`leads\` + \`contacts\` tables → CRM pipeline → Opportunity → Closed Won → Active Client\n2. **Campaign metrics:** Daily metric entries → aggregation → Campaign Dashboard → Founder Dashboard\n3. **Billing:** Subscription start → invoice creation → payment recording → revenue analytics → Founder Dashboard\n4. **Legal:** Signup acceptance → audit log → compliance dashboard → exportable trail\n5. **Client portal:** Campaign request → marketing review → approval → live campaign → metrics visible to client`
      },
      {
        title: "File Structure Reference",
        content: `\`\`\`\nsrc/\n├── components/        # Reusable components\n│   ├── ui/            # shadcn/ui primitives\n│   ├── crm/           # CRM-specific components\n│   ├── portal/        # Portal-specific components\n│   └── *.tsx          # Website sections\n├── contexts/          # React contexts (Auth, Demo)\n├── hooks/             # Custom hooks\n├── integrations/\n│   └── supabase/      # Auto-generated client + types\n├── lib/               # Utilities, demo data, manual content\n├── pages/             # Route components\n│   ├── crm/           # CRM pages\n│   ├── portal/        # Client portal pages\n│   ├── demo/          # Demo environment pages\n│   └── legal/         # Legal Centre pages\n└── App.tsx            # Root router\n\`\`\``
      }
    ]
  }
];
