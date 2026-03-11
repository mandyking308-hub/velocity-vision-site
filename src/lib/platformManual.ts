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
        content: `Velocity Influence is a full-stack marketing operations platform designed to serve as the marketing engine for the organisation group. It provides end-to-end campaign management, client relationship management, and analytics capabilities.\n\nThe platform serves three core functions:\n- **Internal marketing engine** — powering campaigns across the organisation's portfolio\n- **External client services** — managing marketing campaigns for external business clients\n- **Agency capability** — enabling marketing agencies to manage multiple client workspaces under a single account\n\nVelocity Influence connects to the broader AI infrastructure strategy, positioning the platform to integrate intelligent automation, predictive analytics, and AI-driven campaign optimisation as the technology matures.`
      },
      {
        title: "Platform Architecture",
        content: `The platform is built on a modern React + TypeScript stack with Lovable Cloud providing the backend infrastructure.\n\n**Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui component library\n**Backend:** Lovable Cloud (database, auth, edge functions, storage)\n**Charts:** Recharts for data visualisation\n**Routing:** React Router v6 with role-based access control\n**State:** TanStack React Query for server state management`
      },
      {
        title: "User Roles",
        content: `The platform uses role-based access control with five defined roles:\n\n| Role | Access Level |\n|------|-------------|\n| **Founder** | Full platform access, executive dashboard, operations manual |\n| **Admin** | Full CRM access, user management, legal compliance |\n| **Sales** | CRM, leads, opportunities, contacts |\n| **Marketing** | Campaigns, analytics, content management |\n| **Client** | Client portal with limited access to own data |`
      }
    ]
  },
  {
    id: "website",
    title: "Website Architecture",
    sections: [
      {
        title: "Public Pages",
        content: `The public website serves as the platform's marketing presence and lead generation tool.\n\n| Page | Route | Purpose |\n|------|-------|---------|\n| **Homepage** | \`/\` | Hero section, value proposition, featured work, CTA |\n| **Services** | \`/services\` | Marketing services offered by the platform |\n| **Industries** | \`/industries\` | Industry-specific marketing solutions |\n| **For Agencies** | \`/for-agencies\` | Agency partnership programme and workspace features |\n| **About** | \`/about\` | Company story, team, mission |\n| **Contact** | \`/contact\` | Contact form with lead capture integration |\n| **Book a Demo** | \`/book-demo\` | Demo booking form |\n| **Legal Centre** | \`/legal\` | All legal documents and policies |\n| **Demo Login** | \`/demo\` | Public demo environment access |`
      },
      {
        title: "Navigation & Design System",
        content: `The website uses a consistent design system built on Tailwind CSS semantic tokens.\n\n- **Typography:** Custom display and body font pairing\n- **Colour palette:** HSL-based tokens for primary, accent, muted, and foreground colours\n- **Components:** shadcn/ui library with custom variants\n- **Animations:** Framer Motion for page transitions and micro-interactions\n- **Responsive:** Mobile-first design with breakpoints at sm, md, lg, xl`
      }
    ]
  },
  {
    id: "crm",
    title: "CRM System",
    sections: [
      {
        title: "Lead Capture",
        content: `Leads enter the system through multiple channels:\n\n- **Contact form** (\`/contact\`) — captures name, email, company, message\n- **Book a Demo form** (\`/book-demo\`) — captures demo request details\n- **Manual entry** — CRM users can create leads directly\n\nEach lead is stored in the \`leads\` table with source tracking and status management.`
      },
      {
        title: "Contact Database",
        content: `The contacts system stores all prospect and client contact information.\n\n**Fields:**\n- First name, Last name\n- Email, Phone\n- Company (linked to companies table)\n- Job title\n- Decision maker level\n- LinkedIn URL\n- Created by, Created at, Updated at`
      },
      {
        title: "Pipeline Management",
        content: `Leads progress through a defined pipeline:\n\n1. **New** — Fresh lead, not yet contacted\n2. **Contacted** — Initial outreach made\n3. **Demo Scheduled** — Discovery call or demo booked\n4. **Proposal Sent** — Formal proposal delivered\n5. **Closed Won** — Deal converted to client\n6. **Closed Lost** — Lead did not convert\n\nOpportunities track estimated value, probability, expected close date, and associated service.`
      },
      {
        title: "Companies",
        content: `Companies are categorised by:\n\n- **Account type:** business or agency\n- **Status:** prospect, active_client, past_client\n- **Industry, Country, Company size, Website**\n\nCompanies link to contacts, leads, opportunities, campaigns, invoices, and workspaces.`
      }
    ]
  },
  {
    id: "campaigns",
    title: "Campaign Engine",
    sections: [
      {
        title: "Campaign Types",
        content: `The platform supports seven campaign types:\n\n1. **Email** — Direct email marketing campaigns\n2. **Social Media** — Social platform content campaigns\n3. **Paid Advertising** — PPC, display, and programmatic ads\n4. **Influencer** — Influencer partnership campaigns\n5. **PR** — Public relations and media outreach\n6. **LinkedIn Outreach** — B2B LinkedIn prospecting\n7. **Newsletter** — Recurring newsletter campaigns`
      },
      {
        title: "Campaign Lifecycle",
        content: `Campaigns follow a defined lifecycle:\n\n- **Draft** — Campaign being configured\n- **Scheduled** — Ready to launch at a future date\n- **Active** — Currently running\n- **Paused** — Temporarily suspended\n- **Completed** — Campaign finished\n\nEach campaign tracks budget, start/end dates, objective, target audience, and owner.`
      },
      {
        title: "Performance Metrics",
        content: `Campaign metrics tracked per day:\n\n| Metric | Description |\n|--------|-------------|\n| Emails sent | Total outbound emails |\n| Open rate | Percentage of emails opened |\n| Click-through rate | Percentage of clicks |\n| Leads generated | New leads attributed |\n| Conversion rate | Lead-to-opportunity rate |\n| Ad spend | Total advertising expenditure |\n| Cost per lead | Ad spend / leads generated |\n| Impressions | Total ad impressions |\n| Reach | Unique audience reached |\n| Engagement | Total engagement actions |`
      },
      {
        title: "Analytics Dashboard",
        content: `The Campaign Performance Dashboard (\`/crm/campaign-dashboard\`) provides:\n\n- Campaign status breakdown\n- Performance comparison charts\n- Lead generation trends\n- ROI and cost-per-lead analysis\n- Individual campaign drill-down views`
      }
    ]
  },
  {
    id: "agency",
    title: "Agency Workspace System",
    sections: [
      {
        title: "Workspace Structure",
        content: `Agencies operate under a single account with multiple client workspaces.\n\n**Workspace fields:**\n- Name\n- Agency company ID (parent)\n- Contact name & email\n- Industry\n- Website\n\nEach workspace acts as an isolated environment for a specific client.`
      },
      {
        title: "Client Separation",
        content: `Workspaces ensure data isolation:\n\n- Campaigns are scoped to workspaces via \`workspace_id\`\n- Each workspace has its own contacts, campaigns, and analytics\n- Agency users can switch between workspaces\n- Client portal users only see their own workspace data`
      },
      {
        title: "Agency Onboarding",
        content: `Agency accounts complete an extended onboarding flow that includes:\n\n- Business description and services offered\n- Industries served and target regions\n- Agency size\n- Legal acceptance (including agency responsibility clause)\n- Client workspace setup`
      }
    ]
  },
  {
    id: "demo",
    title: "Demo Environment",
    sections: [
      {
        title: "Demo Access",
        content: `The public demo environment is accessible at \`/demo\`.\n\n**Credentials:**\n- Email: demo@velocityinfluence.com\n- Password: DemoAccess123\n\nThe demo login page is linked from the homepage via the "Explore the Platform" button.`
      },
      {
        title: "Sample Data",
        content: `The demo environment is populated with:\n\n- **300 sample contacts** across multiple industries\n- **3 campaigns:** Product Launch Outreach (email), Enterprise Outreach Program (LinkedIn), Digital Growth Campaign (ads)\n- **3 agency workspaces:** Alpha Technologies, Horizon Medical, Atlas Finance\n- **Analytics data:** 8 total campaigns, 420 leads/month, 14% conversion rate`
      },
      {
        title: "Sandbox Restrictions",
        content: `Demo users cannot:\n\n- Send real campaigns\n- Upload marketing lists\n- Modify billing settings\n- Change system configuration\n- Create real user accounts\n\nAll restricted actions display: "This feature is disabled in the demo environment."\n\nA persistent banner indicates the demo state at the top of the screen.`
      }
    ]
  },
  {
    id: "billing",
    title: "Billing System",
    sections: [
      {
        title: "Subscription Plans",
        content: `The platform supports tiered subscription plans stored in the \`subscriptions\` table.\n\nEach subscription tracks:\n- Plan name\n- Monthly price\n- Start date and renewal date\n- Status (active, paused, cancelled)\n- Associated company`
      },
      {
        title: "Invoice Management",
        content: `Invoices are generated per company and track:\n\n- Invoice number\n- Amount\n- Status: draft → sent → paid / overdue\n- Due date and paid date\n- Description\n- File URL (downloadable PDF)\n\nThe billing dashboard displays invoice history, payment status, and outstanding balances.`
      },
      {
        title: "Payments & Adjustments",
        content: `Payments are recorded against invoices with method tracking (card, bank transfer, etc.).\n\nBilling adjustments (credits/debits) can be applied to companies with reason documentation for audit purposes.`
      }
    ]
  },
  {
    id: "legal-centre",
    title: "Legal Centre",
    sections: [
      {
        title: "Legal Documents",
        content: `The Legal Centre (\`/legal\`) contains nine policies:\n\n1. **Platform Terms of Service** — Core terms governing platform use\n2. **Client Services Agreement** — Terms for marketing services\n3. **Privacy Policy** — Data collection and processing practices\n4. **Acceptable Use Policy** — Prohibited conduct and content\n5. **Marketing Compliance Policy** — Advertising standards and regulations\n6. **Data Processing Agreement** — GDPR-compliant data processing terms\n7. **Cookie Policy** — Cookie usage and consent\n8. **Platform Security Policy** — Security measures and incident response\n9. **Service Level Agreement** — Uptime guarantees and support commitments\n\nEach document includes a version number and last updated date.`
      },
      {
        title: "Version Management",
        content: `Document versions are managed in \`src/lib/legalVersions.ts\`.\n\nWhen a document version is updated, users are required to re-accept the terms on their next login. The system compares the user's last accepted version against the current version.`
      }
    ]
  },
  {
    id: "legal-acceptance",
    title: "Legal Acceptance System",
    sections: [
      {
        title: "Acceptance Flow",
        content: `During account creation, users must check a mandatory checkbox confirming:\n\n> "I confirm that I have read and agree to the Platform Terms of Service and Client Services Agreement, and acknowledge the Privacy Policy and other applicable legal policies."\n\nThe checkbox links to all relevant legal documents, which open in new tabs.`
      },
      {
        title: "Acceptance Record",
        content: `Each acceptance creates an audit record containing:\n\n| Field | Description |\n|-------|-------------|\n| User ID | Authenticated user identifier |\n| Email | User's email address |\n| Account type | business or agency |\n| Accepted at | Timestamp of acceptance |\n| IP address | User's IP (via external API) |\n| Legal version | Current legal framework version |\n| Document versions | JSON object mapping each document to its version |\n\nRecords are stored in the \`legal_acceptances\` table and cannot be updated or deleted (enforced by RLS).`
      },
      {
        title: "Admin Compliance Dashboard",
        content: `The Legal Compliance page (\`/crm/legal-compliance\`) displays:\n\n- All acceptance records with search and filtering\n- Account type breakdown\n- Compliance statistics\n- Exportable audit trail`
      }
    ]
  },
  {
    id: "founder-dashboard",
    title: "Founder Dashboard",
    sections: [
      {
        title: "Executive Analytics",
        content: `The Founder Command Dashboard (\`/crm/founder\`) provides real-time executive metrics:\n\n**KPI Cards:**\n- Active Clients\n- Active Campaigns\n- Leads This Month / Week\n- Revenue This Month\n- Pipeline Value\n\n**Charts:**\n- Revenue Growth (6-month area chart)\n- Lead Sources (pie chart)\n- Top Campaigns by Leads (horizontal bar)\n- Revenue by Industry (bar chart)\n\n**Tables:**\n- Client Activity (campaigns, monthly revenue, last activity)\n- Activity Feed (leads, campaigns, deals, invoices)`
      },
      {
        title: "Access Control",
        content: `The Founder Dashboard is restricted to users with the \`founder\` or \`admin\` role.\n\nAccess is verified server-side by querying the \`user_roles\` table. Unauthorised users see an "Access Denied" message.`
      }
    ]
  },
  {
    id: "security",
    title: "Security Architecture",
    sections: [
      {
        title: "Authentication",
        content: `The platform uses Lovable Cloud authentication with:\n\n- Email/password signup with email verification\n- Persistent sessions with automatic token refresh\n- Protected routes that redirect unauthenticated users to \`/auth\`\n- Legal acceptance required during registration`
      },
      {
        title: "Row-Level Security",
        content: `All database tables enforce Row-Level Security (RLS) policies:\n\n- **Legal acceptances:** Users can only view/insert their own records\n- **Notifications:** Users can only view/update their own notifications\n- **Profiles:** Users can only update their own profile\n- **User roles:** Only founders and admins can manage roles\n- **All other tables:** Authenticated users have appropriate CRUD access\n\nThe \`has_role()\` security definer function prevents recursive RLS evaluation.`
      },
      {
        title: "Demo Environment Security",
        content: `The demo environment is fully sandboxed:\n\n- Uses client-side mock data only — no database interaction\n- All write operations are intercepted by \`guardAction()\`\n- Session-based state that resets on page refresh\n- No access to production data or live systems`
      }
    ]
  },
  {
    id: "integrations",
    title: "System Integrations",
    sections: [
      {
        title: "Backend Infrastructure",
        content: `**Lovable Cloud** provides:\n- PostgreSQL database with RLS\n- Authentication system\n- Edge functions for server-side logic\n- File storage (client-documents bucket)\n- Realtime subscriptions`
      },
      {
        title: "External Services",
        content: `| Service | Purpose |\n|---------|----------|\n| **ipify API** | Captures user IP address during legal acceptance |\n| **Recharts** | Client-side data visualisation library |\n| **Framer Motion** | Animation and transition framework |`
      },
      {
        title: "Data Flow",
        content: `1. **Lead capture** → Contact form → Database → CRM pipeline\n2. **Campaign metrics** → Daily metric entries → Analytics dashboard\n3. **Billing** → Invoice creation → Payment recording → Revenue analytics\n4. **Legal** → Acceptance → Audit log → Compliance dashboard`
      }
    ]
  }
];
