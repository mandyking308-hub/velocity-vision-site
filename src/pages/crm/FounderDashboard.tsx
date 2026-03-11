import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, Target, TrendingUp, DollarSign, Megaphone,
  Activity, AlertTriangle, ArrowRight, BarChart3, Globe, CreditCard
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfMonth, startOfWeek } from "date-fns";

const COLORS = [
  "hsl(12, 90%, 58%)", "hsl(220, 60%, 50%)", "hsl(160, 50%, 50%)",
  "hsl(28, 90%, 55%)", "hsl(280, 50%, 55%)", "hsl(45, 90%, 50%)", "hsl(340, 60%, 50%)"
];

const FounderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check role access
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["founder-roles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      return data?.map((r) => r.role) ?? [];
    },
    enabled: !!user,
  });

  const { data: companies } = useQuery({
    queryKey: ["founder-companies"],
    queryFn: async () => { const { data } = await supabase.from("companies").select("*"); return data ?? []; },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["founder-campaigns"],
    queryFn: async () => { const { data } = await supabase.from("campaigns").select("*, companies(name)"); return data ?? []; },
  });

  const { data: leads } = useQuery({
    queryKey: ["founder-leads"],
    queryFn: async () => { const { data } = await supabase.from("leads").select("*, contacts(first_name, last_name), companies(name)"); return data ?? []; },
  });

  const { data: opportunities } = useQuery({
    queryKey: ["founder-opportunities"],
    queryFn: async () => { const { data } = await supabase.from("opportunities").select("*, companies(name)"); return data ?? []; },
  });

  const { data: invoices } = useQuery({
    queryKey: ["founder-invoices"],
    queryFn: async () => { const { data } = await supabase.from("invoices").select("*, companies(name)"); return data ?? []; },
  });

  const { data: metrics } = useQuery({
    queryKey: ["founder-metrics"],
    queryFn: async () => { const { data } = await supabase.from("campaign_metrics").select("*"); return data ?? []; },
  });

  const { data: activities } = useQuery({
    queryKey: ["founder-activities"],
    queryFn: async () => { const { data } = await supabase.from("activities").select("*, contacts(first_name, last_name)").order("created_at", { ascending: false }).limit(20); return data ?? []; },
  });

  const { data: workspaces } = useQuery({
    queryKey: ["founder-workspaces"],
    queryFn: async () => { const { data } = await supabase.from("client_workspaces").select("*"); return data ?? []; },
  });

  const { data: notifications } = useQuery({
    queryKey: ["founder-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).eq("read", false).order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Access check
  const hasAccess = roles?.some((r) => r === "founder" || r === "admin") ?? false;
  if (rolesLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!hasAccess) return (
    <div className="p-8 text-center">
      <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted-foreground">This dashboard is restricted to founders and administrators.</p>
    </div>
  );

  // KPI calculations
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);

  const agencyAccounts = companies?.filter((c) => (c as any).account_type === "agency") ?? [];
  const totalWorkspaces = workspaces?.length ?? 0;
  const agencyCampaigns = campaigns?.filter((c) => agencyAccounts.some((a) => a.id === c.company_id)) ?? [];

  const activeClients = companies?.filter((c) => c.status === "active_client") ?? [];
  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];
  const leadsThisMonth = leads?.filter((l) => new Date(l.created_at) >= monthStart) ?? [];
  const leadsThisWeek = leads?.filter((l) => new Date(l.created_at) >= weekStart) ?? [];
  const pipelineValue = opportunities?.filter((o) => !["won", "lost"].includes(o.stage)).reduce((s, o) => s + Number(o.estimated_value ?? 0), 0) ?? 0;

  const paidInvoices = invoices?.filter((i) => i.status === "paid") ?? [];
  const revenueThisMonth = paidInvoices.filter((i) => new Date(i.created_at) >= monthStart).reduce((s, i) => s + Number(i.amount), 0);
  const totalRevenueYear = paidInvoices.filter((i) => new Date(i.created_at).getFullYear() === now.getFullYear()).reduce((s, i) => s + Number(i.amount), 0);
  const avgClientValue = activeClients.length > 0 ? totalRevenueYear / activeClients.length : 0;

  const totalLeads = leads?.length ?? 0;
  const wonOpps = opportunities?.filter((o) => o.stage === "won") ?? [];
  const conversionRate = totalLeads > 0 ? ((wonOpps.length / totalLeads) * 100).toFixed(1) : "0";

  const totalAdSpend = metrics?.reduce((s, m) => s + Number(m.ad_spend ?? 0), 0) ?? 0;
  const totalLeadsGenerated = metrics?.reduce((s, m) => s + (m.leads_generated ?? 0), 0) ?? 0;

  // KPI cards
  const kpis = [
    { label: "Active Clients", value: activeClients.length, icon: Building2, color: "text-accent" },
    { label: "Active Campaigns", value: activeCampaigns.length, icon: Megaphone, color: "text-accent" },
    { label: "Leads This Month", value: leadsThisMonth.length, icon: Target, color: "text-accent" },
    { label: "Revenue This Month", value: `£${revenueThisMonth.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Pipeline Value", value: `£${(pipelineValue / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-accent" },
    { label: "New Leads This Week", value: leadsThisWeek.length, icon: Users, color: "text-accent" },
  ];

  // Revenue by month (last 6 months)
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = format(d, "MMM yyyy");
    revenueByMonth[key] = 0;
  }
  paidInvoices.forEach((inv) => {
    const key = format(new Date(inv.created_at), "MMM yyyy");
    if (key in revenueByMonth) revenueByMonth[key] += Number(inv.amount);
  });
  const revenueChartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  // Lead sources
  const sourceMap: Record<string, number> = {};
  (leads ?? []).forEach((l) => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Industry breakdown
  const industryRevenue: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const company = companies?.find((c) => c.id === inv.company_id);
    const industry = company?.industry || "Other";
    industryRevenue[industry] = (industryRevenue[industry] || 0) + Number(inv.amount);
  });
  const industryData = Object.entries(industryRevenue).map(([name, value]) => ({ name, value }));

  // Campaign performance - top by leads
  const campaignLeads: Record<string, { name: string; leads: number; spend: number }> = {};
  (metrics ?? []).forEach((m) => {
    const camp = campaigns?.find((c) => c.id === m.campaign_id);
    if (!camp) return;
    if (!campaignLeads[m.campaign_id]) campaignLeads[m.campaign_id] = { name: camp.name, leads: 0, spend: 0 };
    campaignLeads[m.campaign_id].leads += m.leads_generated ?? 0;
    campaignLeads[m.campaign_id].spend += Number(m.ad_spend ?? 0);
  });
  const topCampaigns = Object.values(campaignLeads).sort((a, b) => b.leads - a.leads).slice(0, 5);

  // Client activity table
  const clientActivity = (activeClients).map((company) => {
    const companyCampaigns = campaigns?.filter((c) => c.company_id === company.id && c.status === "active") ?? [];
    const companyInvoices = paidInvoices.filter((i) => i.company_id === company.id);
    const monthlyRevenue = companyInvoices.filter((i) => new Date(i.created_at) >= monthStart).reduce((s, i) => s + Number(i.amount), 0);
    const lastActivity = companyInvoices.length > 0 ? companyInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : company.updated_at;
    return { name: company.name, campaigns: companyCampaigns.length, revenue: monthlyRevenue, lastActivity };
  }).sort((a, b) => b.revenue - a.revenue);

  // Activity feed
  const feedItems: { type: string; text: string; time: string }[] = [];
  (leads ?? []).slice(0, 5).forEach((l) => {
    const name = (l as any).contacts ? `${(l as any).contacts.first_name} ${(l as any).contacts.last_name}` : "Unknown";
    feedItems.push({ type: "lead", text: `New lead: ${name} from ${(l as any).companies?.name || l.source}`, time: l.created_at });
  });
  (campaigns ?? []).filter((c) => c.status === "active").slice(0, 3).forEach((c) => {
    feedItems.push({ type: "campaign", text: `Campaign active: ${c.name}`, time: c.updated_at });
  });
  wonOpps.slice(0, 3).forEach((o) => {
    feedItems.push({ type: "deal", text: `Deal won: ${(o as any).companies?.name || "—"} — £${Number(o.estimated_value ?? 0).toLocaleString()}`, time: o.updated_at });
  });
  (invoices ?? []).filter((i) => i.status === "sent").slice(0, 3).forEach((i) => {
    feedItems.push({ type: "invoice", text: `Invoice issued: ${i.invoice_number} — £${Number(i.amount).toLocaleString()}`, time: i.created_at });
  });
  feedItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const feedIcons: Record<string, string> = { lead: "🎯", campaign: "📢", deal: "🏆", invoice: "💳" };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Founder Command Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Executive overview of agency performance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate("/crm/leads")} className="gap-1.5"><Target size={14} /> Pipeline</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/crm/campaigns")} className="gap-1.5"><Megaphone size={14} /> Campaigns</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/crm/companies")} className="gap-1.5"><Building2 size={14} /> Clients</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Agency Analytics */}
      {agencyAccounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Agency Accounts</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{agencyAccounts.length}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Total Client Workspaces</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{totalWorkspaces}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Agency-Managed Campaigns</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{agencyCampaigns.length}</p>
          </div>
        </div>
      )}

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Growth</h3>
          {revenueChartData.some((d) => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(12, 90%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(12, 90%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(12, 90%, 58%)" fill="url(#revGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">No revenue data yet</p>}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Total Revenue (Year)</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">£{totalRevenueYear.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Avg Client Value</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">£{avgClientValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Lead Conversion Rate</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">{conversionRate}%</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-card">
            <span className="text-xs text-muted-foreground">Total Ad Spend</span>
            <p className="text-2xl font-display font-bold text-foreground mt-1">£{totalAdSpend.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Lead & Campaign Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Sources</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">No lead data</p>}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Top Campaigns by Leads</h3>
          {topCampaigns.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCampaigns} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(220, 60%, 50%)" radius={[0, 6, 6, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">No campaign data</p>}
        </div>
      </div>

      {/* Industry Performance */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Revenue by Industry</h3>
        {industryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={industryData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
              <Bar dataKey="value" fill="hsl(12, 90%, 58%)" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-sm text-center py-12">No industry data yet</p>}
      </div>

      {/* Client Activity + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client table */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-display font-semibold text-foreground">Client Activity</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Campaigns</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Monthly Rev</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {clientActivity.slice(0, 10).map((c) => (
                <tr key={c.name} className="border-b border-border/20 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.campaigns}</td>
                  <td className="px-4 py-2.5 text-foreground">£{c.revenue.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{format(new Date(c.lastActivity), "MMM d, yyyy")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientActivity.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No active clients</p>}
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border/50 rounded-xl shadow-card">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-display font-semibold text-foreground">Activity Feed</h3>
          </div>
          <div className="p-3 space-y-2 max-h-[400px] overflow-auto">
            {feedItems.slice(0, 15).map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-lg">{feedIcons[item.type] || "📋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(item.time), "MMM d, h:mm a")}</p>
                </div>
              </motion.div>
            ))}
            {feedItems.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(notifications ?? []).length > 0 && (
        <div className="bg-card border border-accent/30 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" /> Alerts
          </h3>
          <div className="space-y-2">
            {notifications!.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10">
                <Activity size={14} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderDashboard;
