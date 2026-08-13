import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Info, ExternalLink, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700",
  active: "bg-accent/10 text-accent",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  expired: "bg-muted text-muted-foreground",
};

const SocialMediaPage = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["crm-social-campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const social = (campaigns ?? []).filter((c) => c.type === "social_media");

  const count = (status: string) => social.filter((c) => c.status === status).length;

  const stats = [
    { label: "Social Campaigns", value: social.length },
    { label: "Active", value: count("active") },
    { label: "Scheduled", value: count("scheduled") },
    { label: "Draft", value: count("draft") },
    { label: "Completed", value: count("completed") },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-start gap-3">
        <Share2 className="text-accent mt-1" size={22} />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Social Media</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Internal overview of social campaign records stored in the CRM.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <Megaphone size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-accent mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm">
            <h2 className="font-display font-semibold text-foreground text-base">Buffer publishing</h2>
            <p className="text-muted-foreground">
              Customer social drafts are handed to the customer's own Buffer account. Publishing remains
              customer-controlled and Velocity does not auto-publish anything.
            </p>
            <p className="text-muted-foreground">
              This CRM page monitors social campaign records only. Buffer connection and publishing controls
              live in the customer app, and are operated by the customer. No customer tokens or accounts are
              accessible from here.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-1">
              <Link to="/app/settings">
                Open app settings <ExternalLink size={14} className="ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-display font-semibold text-foreground">Recent social campaigns</h2>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground text-sm p-6">Loading…</p>
        ) : social.length === 0 ? (
          <p className="text-muted-foreground text-sm p-6">No social campaigns recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Campaign</th>
                  <th className="text-left font-medium px-4 py-2">Company</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                  <th className="text-left font-medium px-4 py-2">Start</th>
                  <th className="text-left font-medium px-4 py-2">End</th>
                </tr>
              </thead>
              <tbody>
                {social.slice(0, 25).map((c) => (
                  <tr key={c.id} className="border-t border-border/40">
                    <td className="px-4 py-2">
                      <Link to={`/crm/campaigns/${c.id}`} className="text-accent hover:underline font-medium">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {(c as { companies?: { name?: string } }).companies?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[c.status] ?? "bg-muted text-muted-foreground"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {c.start_date ? format(new Date(c.start_date), "d MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {c.end_date ? format(new Date(c.end_date), "d MMM yyyy") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaPage;
