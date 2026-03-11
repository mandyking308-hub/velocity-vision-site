import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { Megaphone, Users, FileText, CreditCard, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import WorkspaceManager from "@/components/portal/WorkspaceManager";

const PortalDashboard = () => {
  const { companyId, profile } = useClientCompany();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  // Check if agency account
  const { data: company } = useQuery({
    queryKey: ["portal-company", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data } = await supabase.from("companies").select("*").eq("id", companyId).single();
      return data;
    },
    enabled: !!companyId,
  });

  const isAgency = (company as any)?.account_type === "agency";

  const { data: campaigns } = useQuery({
    queryKey: ["portal-campaigns", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("campaigns").select("*").eq("company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: leads } = useQuery({
    queryKey: ["portal-leads", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("leads").select("*").eq("company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: invoices } = useQuery({
    queryKey: ["portal-invoices", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("invoices").select("*").eq("company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: documents } = useQuery({
    queryKey: ["portal-documents", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("client_documents").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: metrics } = useQuery({
    queryKey: ["portal-metrics", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const campaignIds = campaigns?.map((c) => c.id) ?? [];
      if (!campaignIds.length) return [];
      const { data } = await supabase.from("campaign_metrics").select("*").in("campaign_id", campaignIds).order("date", { ascending: true });
      return data ?? [];
    },
    enabled: !!companyId && !!campaigns?.length,
  });

  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];
  const now = new Date();
  const leadsThisMonth = leads?.filter((l) => new Date(l.created_at).getMonth() === now.getMonth()) ?? [];
  const outstandingInvoices = invoices?.filter((i) => i.status !== "paid") ?? [];

  // Aggregate metrics by date for chart
  const metricsChart = (metrics ?? []).reduce((acc: Record<string, { date: string; leads: number; engagement: number }>, m) => {
    const key = m.date;
    if (!acc[key]) acc[key] = { date: key, leads: 0, engagement: 0 };
    acc[key].leads += m.leads_generated ?? 0;
    acc[key].engagement += m.engagement ?? 0;
    return acc;
  }, {});
  const chartData = Object.values(metricsChart).slice(-14);

  const stats = [
    { label: "Active Campaigns", value: activeCampaigns.length, icon: Megaphone, color: "text-accent" },
    { label: "Leads This Month", value: leadsThisMonth.length, icon: Users, color: "text-accent" },
    { label: "Recent Documents", value: documents?.length ?? 0, icon: FileText, color: "text-muted-foreground" },
    { label: "Outstanding Invoices", value: outstandingInvoices.length, icon: CreditCard, color: "text-destructive" },
  ];

  if (!companyId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Welcome to the Client Portal</h1>
        <p className="text-muted-foreground">Your account has not been linked to a company yet. Please contact the Velocity team.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}</h1>
        <p className="text-muted-foreground text-sm mt-1">Your campaign overview and performance summary</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Generation</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(12, 90%, 58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No lead data yet</p>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Campaign Engagement</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="hsl(220, 60%, 50%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No engagement data yet</p>
          )}
        </div>
      </div>

      {/* Active Campaigns List */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Active Campaigns</h3>
        {activeCampaigns.length > 0 ? (
          <div className="space-y-3">
            {activeCampaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div>
                  <p className="font-medium text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.type.replace("_", " ")} · Started {c.start_date ? format(new Date(c.start_date), "MMM d, yyyy") : "TBD"}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium capitalize">{c.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-6">No active campaigns</p>
        )}
      </div>
    </div>
  );
};

export default PortalDashboard;
