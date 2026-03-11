import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, TrendingUp, DollarSign, Users, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(12, 90%, 58%)", "hsl(220, 60%, 50%)", "hsl(160, 50%, 50%)", "hsl(28, 90%, 55%)", "hsl(280, 50%, 55%)", "hsl(45, 90%, 50%)", "hsl(340, 60%, 50%)"];

const CampaignDashboard = () => {
  const { data: campaigns } = useQuery({
    queryKey: ["dash-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, companies(name)");
      return data ?? [];
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["dash-all-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_metrics").select("*");
      return data ?? [];
    },
  });

  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];
  const completedCampaigns = campaigns?.filter((c) => c.status === "completed") ?? [];
  const totalBudget = campaigns?.reduce((s, c) => s + Number(c.budget ?? 0), 0) ?? 0;
  const totalLeads = metrics?.reduce((s, m) => s + (m.leads_generated ?? 0), 0) ?? 0;
  const totalSpend = metrics?.reduce((s, m) => s + Number(m.ad_spend ?? 0), 0) ?? 0;
  const totalImpressions = metrics?.reduce((s, m) => s + (m.impressions ?? 0), 0) ?? 0;

  // Campaign type breakdown
  const typeMap: Record<string, number> = {};
  (campaigns ?? []).forEach((c) => { typeMap[c.type] = (typeMap[c.type] || 0) + 1; });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));

  // Status breakdown
  const statusMap: Record<string, number> = {};
  (campaigns ?? []).forEach((c) => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Top campaigns by leads
  const campaignLeads: Record<string, { name: string; leads: number }> = {};
  (metrics ?? []).forEach((m) => {
    const camp = campaigns?.find((c) => c.id === m.campaign_id);
    if (!camp) return;
    if (!campaignLeads[m.campaign_id]) campaignLeads[m.campaign_id] = { name: camp.name, leads: 0 };
    campaignLeads[m.campaign_id].leads += m.leads_generated ?? 0;
  });
  const topCampaigns = Object.values(campaignLeads).sort((a, b) => b.leads - a.leads).slice(0, 5);

  const roi = totalSpend > 0 ? ((totalLeads * 500 - totalSpend) / totalSpend * 100).toFixed(0) : "—";

  const stats = [
    { label: "Total Campaigns", value: campaigns?.length ?? 0, icon: Megaphone, color: "text-accent" },
    { label: "Active", value: activeCampaigns.length, icon: TrendingUp, color: "text-accent" },
    { label: "Total Leads", value: totalLeads, icon: Target, color: "text-accent" },
    { label: "Total Spend", value: `£${totalSpend.toLocaleString()}`, icon: DollarSign, color: "text-muted-foreground" },
    { label: "Impressions", value: totalImpressions.toLocaleString(), icon: Users, color: "text-muted-foreground" },
    { label: "Est. ROI", value: roi === "—" ? roi : `${roi}%`, icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Campaign Performance</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all marketing campaign performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Campaign Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(12, 90%, 58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">No data</p>}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Campaign Types</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-sm text-center py-12">No data</p>}
        </div>
      </div>

      {/* Top performing campaigns */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Performing Campaigns</h3>
        {topCampaigns.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCampaigns} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="leads" fill="hsl(220, 60%, 50%)" radius={[0, 6, 6, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-sm text-center py-12">No campaign data yet</p>}
      </div>
    </div>
  );
};

export default CampaignDashboard;
