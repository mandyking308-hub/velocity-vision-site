import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Target, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(14, 90%, 58%)", "hsl(14, 80%, 65%)", "hsl(220, 60%, 50%)", "hsl(220, 50%, 60%)", "hsl(220, 40%, 70%)", "hsl(160, 50%, 50%)"];

const CRMDashboard = () => {
  const { data: leads } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*");
      return data ?? [];
    },
  });

  const { data: opportunities } = useQuery({
    queryKey: ["crm-opportunities"],
    queryFn: async () => {
      const { data } = await supabase.from("opportunities").select("*");
      return data ?? [];
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("*");
      return data ?? [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["crm-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*");
      return data ?? [];
    },
  });

  const now = new Date();
  const thisMonth = leads?.filter((l) => new Date(l.created_at).getMonth() === now.getMonth()) ?? [];
  const activeOpps = opportunities?.filter((o) => !["won", "lost"].includes(o.stage)) ?? [];
  const wonDeals = opportunities?.filter((o) => o.stage === "won") ?? [];
  const pipelineValue = activeOpps.reduce((sum, o) => sum + Number(o.estimated_value || 0), 0);

  // Lead source breakdown
  const sourceMap: Record<string, number> = {};
  (leads ?? []).forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Lead status breakdown
  const statusMap: Record<string, number> = {};
  (leads ?? []).forEach((l) => {
    statusMap[l.status] = (statusMap[l.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  const stats = [
    { label: "Leads This Month", value: thisMonth.length, icon: Target, color: "text-accent" },
    { label: "Active Opportunities", value: activeOpps.length, icon: TrendingUp, color: "text-accent" },
    { label: "Deals Won", value: wonDeals.length, icon: DollarSign, color: "text-green-500" },
    { label: "Pipeline Value", value: `£${(pipelineValue / 1000).toFixed(0)}k`, icon: Building2, color: "text-accent" },
    { label: "Companies", value: companies?.length ?? 0, icon: Building2, color: "text-muted-foreground" },
    { label: "Contacts", value: contacts?.length ?? 0, icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">CRM Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your sales pipeline and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(14, 90%, 58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No leads yet</p>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Sources</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No lead source data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
