// ===== DEMO DATA — realistic sample data for the demo environment =====

// Helper to generate UUIDs
const id = (n: number) => `demo-${n.toString().padStart(4, "0")}`;

// Industries & companies for realistic names
const industries = ["Technology", "Healthcare", "Finance", "SaaS", "Retail", "Manufacturing", "Education", "Real Estate", "Energy", "Logistics"];
const firstNames = ["James","Sarah","Michael","Emma","David","Sophie","Robert","Laura","Daniel","Rachel","Thomas","Jessica","William","Megan","Alexander","Olivia","Benjamin","Charlotte","Henry","Amelia","George","Hannah","Charles","Lucy","Matthew","Emily","Jack","Grace","Sam","Alice"];
const lastNames = ["Johnson","Williams","Brown","Jones","Wilson","Davis","Martinez","Anderson","Thomas","Taylor","White","Harris","Clark","Lewis","Robinson","Walker","Hall","Young","King","Wright","Baker","Adams","Nelson","Carter","Mitchell","Parker","Collins","Edwards","Stewart","Morris"];
const companies = ["Apex Digital","Summit Labs","Nova Dynamics","Vertex Solutions","Meridian Group","Quantum Tech","Horizon Medical","Atlas Finance","Catalyst Systems","Prime Analytics","Nexus Software","Pinnacle Growth","Orion Partners","Vanguard Corp","Stellar Industries","Forge Creative","Helix Bio","Stratus Cloud","Cypher Data","Lunar Ventures"];
const statuses = ["new","contacted","demo_scheduled","proposal_sent","closed_won","closed_lost"] as const;
const sources = ["website","linkedin","referral","event","outbound","paid_ads"];

// Generate 300 contacts
export const demoContacts = Array.from({ length: 300 }, (_, i) => ({
  id: id(i),
  first_name: firstNames[i % firstNames.length],
  last_name: lastNames[i % lastNames.length],
  email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/\s/g, "")}.com`,
  company_name: companies[i % companies.length],
  industry: industries[i % industries.length],
  job_title: ["CEO", "CMO", "VP Marketing", "Marketing Director", "Head of Growth", "CTO", "COO", "Founder", "Managing Director", "Sales Director"][i % 10],
  lead_status: statuses[i % statuses.length],
  created_at: new Date(2026, 0, 1 + (i % 90)).toISOString(),
}));

// Lead pipeline counts
export const demoPipeline = [
  { name: "New Lead", value: 85 },
  { name: "Contacted", value: 62 },
  { name: "Demo Booked", value: 48 },
  { name: "Proposal Sent", value: 35 },
  { name: "Won", value: 52 },
  { name: "Lost", value: 18 },
];

// Lead sources
export const demoLeadSources = [
  { name: "Website", value: 95 },
  { name: "LinkedIn", value: 72 },
  { name: "Referral", value: 54 },
  { name: "Events", value: 38 },
  { name: "Outbound", value: 28 },
  { name: "Paid Ads", value: 13 },
];

// 3 campaigns
export const demoCampaigns = [
  {
    id: "demo-campaign-1",
    name: "Product Launch Outreach",
    type: "email",
    status: "completed",
    budget: 4500,
    start_date: "2026-01-15",
    end_date: "2026-02-15",
    metrics: { emails_sent: 2000, open_rate: 42, click_rate: 18, leads_generated: 86, conversions: 24 },
  },
  {
    id: "demo-campaign-2",
    name: "Enterprise Outreach Program",
    type: "linkedin_outreach",
    status: "active",
    budget: 3200,
    start_date: "2026-02-01",
    end_date: "2026-04-01",
    metrics: { messages_sent: 850, response_rate: 21, meetings_booked: 42, leads_generated: 67, conversions: 14 },
  },
  {
    id: "demo-campaign-3",
    name: "Digital Growth Campaign",
    type: "paid_advertising",
    status: "active",
    budget: 8500,
    start_date: "2026-02-10",
    end_date: "2026-05-10",
    metrics: { impressions: 245000, clicks: 8200, leads_generated: 132, cost_per_lead: 27, conversions: 38 },
  },
];

// Agency workspaces
export const demoWorkspaces = [
  {
    id: "demo-ws-1",
    name: "Alpha Technologies",
    industry: "Technology",
    contact_name: "James Wilson",
    contact_email: "james@alphatech.com",
    campaigns: 3,
    contacts: 85,
    leads_generated: 142,
  },
  {
    id: "demo-ws-2",
    name: "Horizon Medical",
    industry: "Healthcare",
    contact_name: "Sarah Adams",
    contact_email: "sarah@horizonmedical.com",
    campaigns: 2,
    contacts: 64,
    leads_generated: 98,
  },
  {
    id: "demo-ws-3",
    name: "Atlas Finance",
    industry: "Finance",
    contact_name: "Robert Clark",
    contact_email: "robert@atlasfinance.com",
    campaigns: 3,
    contacts: 112,
    leads_generated: 180,
  },
];

// Performance chart data (14 days)
export const demoChartData = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 2, i + 1);
  return {
    date: `Mar ${i + 1}`,
    leads: Math.floor(20 + Math.random() * 30),
    engagement: Math.floor(50 + Math.random() * 80),
    impressions: Math.floor(5000 + Math.random() * 15000),
  };
});

// Dashboard stats
export const demoDashboardStats = {
  totalCampaigns: 8,
  activeCampaigns: 3,
  leadsThisMonth: 420,
  conversionRate: 14,
  totalContacts: 300,
  totalCompanies: 20,
  pipelineValue: 285000,
  dealsWon: 52,
};
