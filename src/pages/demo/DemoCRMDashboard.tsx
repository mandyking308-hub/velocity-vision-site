import { Building2, Users, Target, TrendingUp, DollarSign, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { demoPipeline, demoLeadSources, demoCampaigns, demoDashboardStats, demoChartData, demoWorkspaces } from "@/lib/demoData";
import { useDemo } from "@/contexts/DemoContext";

const COLORS = ["hsl(14, 90%, 58%)", "hsl(14, 80%, 65%)", "hsl(220, 60%, 50%)", "hsl(220, 50%, 60%)", "hsl(220, 40%, 70%)", "hsl(160, 50%, 50%)"];

const DemoCRMDashboard = () => {
  const { guardAction } = useDemo();
  const s = demoDashboardStats;

  const stats = [
    { label: "Leads This Month", value: s.leadsThisMonth, icon: Target, color: "text-accent" },
    { label: "Active Campaigns", value: s.activeCampaigns, icon: Megaphone, color: "text-accent" },
    { label: "Deals Won", value: s.dealsWon, icon: DollarSign, color: "text-green-500" },
    { label: "Pipeline Value", value: `£${(s.pipelineValue / 1000).toFixed(0)}k`, icon: Building2, color: "text-accent" },
    { label: "Companies", value: s.totalCompanies, icon: Building2, color: "text-muted-foreground" },
    { label: "Contacts", value: s.totalContacts, icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">CRM Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your sales pipeline and performance</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Pipeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demoPipeline}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(14, 90%, 58%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={demoLeadSources} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {demoLeadSources.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Demo Campaigns</h3>
        <div className="space-y-3">
          {demoCampaigns.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <p className="font-medium text-foreground text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{c.type.replace("_", " ")} · Budget: £{c.budget.toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${c.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance chart */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Lead Generation Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={demoChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="leads" stroke="hsl(14, 90%, 58%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="engagement" stroke="hsl(220, 60%, 50%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Agency Workspaces */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Agency Client Workspaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoWorkspaces.map((ws) => (
            <div key={ws.id} className="p-4 rounded-lg bg-muted/30 border border-border/30">
              <p className="font-semibold text-foreground text-sm">{ws.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{ws.industry} · {ws.contact_name}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{ws.campaigns}</p>
                  <p className="text-[10px] text-muted-foreground">Campaigns</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{ws.contacts}</p>
                  <p className="text-[10px] text-muted-foreground">Contacts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-accent">{ws.leads_generated}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoCRMDashboard;
