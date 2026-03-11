import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const PortalCampaigns = () => {
  const { companyId } = useClientCompany();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: campaigns } = useQuery({
    queryKey: ["portal-campaigns", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("campaigns").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const selected = campaigns?.find((c) => c.id === selectedId);

  const { data: metrics } = useQuery({
    queryKey: ["campaign-metrics", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data } = await supabase.from("campaign_metrics").select("*").eq("campaign_id", selectedId).order("date", { ascending: true });
      return data ?? [];
    },
    enabled: !!selectedId,
  });

  const statusColors: Record<string, string> = {
    active: "bg-accent/10 text-accent",
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    paused: "bg-muted text-muted-foreground",
  };

  if (selectedId && selected) {
    const totals = (metrics ?? []).reduce(
      (acc, m) => ({
        emails_sent: acc.emails_sent + (m.emails_sent ?? 0),
        leads_generated: acc.leads_generated + (m.leads_generated ?? 0),
        impressions: acc.impressions + (m.impressions ?? 0),
        ad_spend: acc.ad_spend + Number(m.ad_spend ?? 0),
      }),
      { emails_sent: 0, leads_generated: 0, impressions: 0, ad_spend: 0 }
    );

    const latestMetric = metrics?.length ? metrics[metrics.length - 1] : null;

    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedId(null)} className="gap-2 text-muted-foreground">
          <ArrowLeft size={16} /> Back to Campaigns
        </Button>

        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{selected.name}</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{selected.type.replace("_", " ")} Campaign · {selected.status}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Emails Sent", value: totals.emails_sent.toLocaleString() },
            { label: "Leads Generated", value: totals.leads_generated },
            { label: "Impressions", value: totals.impressions.toLocaleString() },
            { label: "Ad Spend", value: `£${totals.ad_spend.toLocaleString()}` },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <p className="text-xl font-display font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {latestMetric && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Open Rate", value: `${latestMetric.open_rate ?? 0}%` },
              { label: "Click-Through Rate", value: `${latestMetric.click_through_rate ?? 0}%` },
              { label: "Conversion Rate", value: `${latestMetric.conversion_rate ?? 0}%` },
              { label: "Cost Per Lead", value: `£${Number(latestMetric.cost_per_lead ?? 0).toFixed(2)}` },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <p className="text-xl font-display font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Performance Over Time</h3>
          {(metrics ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads_generated" stroke="hsl(12, 90%, 58%)" strokeWidth={2} name="Leads" />
                <Line type="monotone" dataKey="engagement" stroke="hsl(220, 60%, 50%)" strokeWidth={2} name="Engagement" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No metrics data yet</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">View all campaigns running for your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(campaigns ?? []).map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedId(c.id)}
            className="bg-card border border-border/50 rounded-xl p-5 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <Megaphone size={20} className="text-accent" />
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[c.status] || ""}`}>
                {c.status}
              </span>
            </div>
            <h3 className="font-display font-semibold text-foreground mb-1">{c.name}</h3>
            <p className="text-xs text-muted-foreground capitalize mb-2">{c.type.replace("_", " ")}</p>
            <p className="text-xs text-muted-foreground">
              {c.start_date ? format(new Date(c.start_date), "MMM d, yyyy") : "TBD"}
              {c.end_date ? ` — ${format(new Date(c.end_date), "MMM d, yyyy")}` : ""}
            </p>
          </motion.div>
        ))}
        {(!campaigns || campaigns.length === 0) && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-12">No campaigns yet</p>
        )}
      </div>
    </div>
  );
};

export default PortalCampaigns;
