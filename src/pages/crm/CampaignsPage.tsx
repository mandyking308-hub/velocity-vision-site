import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CAMPAIGN_TYPES = [
  { value: "email", label: "Email" },
  { value: "linkedin_outreach", label: "LinkedIn Outreach" },
  { value: "paid_advertising", label: "Paid Advertising" },
  { value: "pr", label: "PR Distribution" },
  { value: "influencer", label: "Influencer Marketing" },
  { value: "newsletter", label: "Newsletter" },
  { value: "social_media", label: "Social Media" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-700",
  active: "bg-accent/10 text-accent",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

const CampaignsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", company_id: "", type: "email" as string, objective: "",
    target_audience_description: "", budget: "", start_date: "", end_date: "",
  });

  const { data: campaigns } = useQuery({
    queryKey: ["engine-campaigns"],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, companies(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["engine-companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name");
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert({
        name: form.name,
        company_id: form.company_id,
        type: form.type as any,
        objective: form.objective,
        target_audience_description: form.target_audience_description,
        budget: form.budget ? parseFloat(form.budget) : 0,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: "draft" as any,
        created_by: user?.id,
        owner_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engine-campaigns"] });
      toast.success("Campaign created");
      setDialogOpen(false);
      setForm({ name: "", company_id: "", type: "email", objective: "", target_audience_description: "", budget: "", start_date: "", end_date: "" });
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const filtered = (campaigns ?? []).filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchType = filterType === "all" || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Campaign Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, manage, and track all marketing campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="cta" className="gap-2"><Plus size={16} /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Campaign Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Q2 Email Campaign" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Client Company *</label>
                <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {(companies ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Campaign Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Objective</label>
                <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="What is the goal?" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Target Audience</label>
                <Input value={form.target_audience_description} onChange={(e) => setForm({ ...form, target_audience_description: e.target.value })} placeholder="CMOs at SaaS companies" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Budget (£)</label>
                  <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="5000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Start Date</label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">End Date</label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <Button variant="cta" className="w-full" disabled={!form.name || !form.company_id || createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CAMPAIGN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={`/crm/campaigns/${c.id}`} className="block bg-card border border-border/50 rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Megaphone size={20} className="text-accent" />
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[c.status] || ""}`}>{c.status}</span>
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{c.name}</h3>
              <p className="text-xs text-muted-foreground capitalize mb-1">{c.type.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground">{(c as any).companies?.name || "—"}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                <span>{c.start_date ? format(new Date(c.start_date), "MMM d") : "TBD"}{c.end_date ? ` — ${format(new Date(c.end_date), "MMM d")}` : ""}</span>
                {c.budget ? <span className="font-medium text-foreground">£{Number(c.budget).toLocaleString()}</span> : null}
              </div>
            </Link>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-12">No campaigns found</p>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
