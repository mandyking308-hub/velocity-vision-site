import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload, Trash2, Download, Plus, Users, FileText, BarChart3, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ASSET_TYPES = ["email_template", "ad_creative", "image", "video", "messaging_script", "landing_page", "campaign_brief", "other"];

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [assetType, setAssetType] = useState("other");
  const [taskDialog, setTaskDialog] = useState(false);
  const [audienceDialog, setAudienceDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "" });
  const [audienceForm, setAudienceForm] = useState({ name: "", company_name: "", email: "", job_title: "", industry: "" });

  const { data: campaign } = useQuery({
    queryKey: ["campaign-detail", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaigns").select("*, companies(name)").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: metrics } = useQuery({
    queryKey: ["campaign-metrics-detail", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_metrics").select("*").eq("campaign_id", id!).order("date", { ascending: true });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: assets } = useQuery({
    queryKey: ["campaign-assets", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_assets").select("*").eq("campaign_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: audiences } = useQuery({
    queryKey: ["campaign-audiences", id],
    queryFn: async () => {
      const { data } = await supabase.from("campaign_audiences").select("*").eq("campaign_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: tasks } = useQuery({
    queryKey: ["campaign-tasks", id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").eq("entity_type", "campaign").eq("entity_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("campaigns").update({ status: status as any }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-detail", id] });
      toast.success("Campaign status updated");
    },
  });

  // Upload asset
  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;
    setUploading(true);
    const filePath = `campaigns/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(filePath);
    const { error } = await supabase.from("campaign_assets").insert({
      campaign_id: id, name: file.name, asset_type: assetType,
      file_url: urlData.publicUrl, file_size: file.size, uploaded_by: user.id,
    });
    if (error) toast.error("Failed to save asset"); else {
      toast.success("Asset uploaded");
      queryClient.invalidateQueries({ queryKey: ["campaign-assets", id] });
    }
    setUploading(false);
    e.target.value = "";
  };

  // Delete asset
  const deleteAsset = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase.from("campaign_assets").delete().eq("id", assetId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaign-assets", id] }),
  });

  // Create task
  const createTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        title: taskForm.title, description: taskForm.description,
        due_date: taskForm.due_date || null, entity_type: "campaign",
        entity_id: id, created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-tasks", id] });
      setTaskDialog(false);
      setTaskForm({ title: "", description: "", due_date: "" });
      toast.success("Task created");
    },
  });

  // Add audience
  const addAudience = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaign_audiences").insert({
        campaign_id: id!, ...audienceForm,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-audiences", id] });
      setAudienceDialog(false);
      setAudienceForm({ name: "", company_name: "", email: "", job_title: "", industry: "" });
      toast.success("Audience member added");
    },
  });

  // CSV audience upload
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) { toast.error("CSV must have header + data rows"); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ""; });
      return {
        campaign_id: id,
        name: row.name || row.first_name || "",
        company_name: row.company || row.company_name || "",
        email: row.email || "",
        job_title: row.job_title || row.title || "",
        industry: row.industry || "",
      };
    }).filter((r) => r.name);

    const { error } = await supabase.from("campaign_audiences").insert(rows);
    if (error) toast.error("CSV import failed"); else {
      toast.success(`${rows.length} contacts imported`);
      queryClient.invalidateQueries({ queryKey: ["campaign-audiences", id] });
    }
    e.target.value = "";
  };

  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase.from("tasks").update({ status: status as any }).eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaign-tasks", id] }),
  });

  if (!campaign) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Aggregate metrics
  const totals = (metrics ?? []).reduce((acc, m) => ({
    emails_sent: acc.emails_sent + (m.emails_sent ?? 0),
    leads_generated: acc.leads_generated + (m.leads_generated ?? 0),
    impressions: acc.impressions + (m.impressions ?? 0),
    ad_spend: acc.ad_spend + Number(m.ad_spend ?? 0),
    clicks: acc.clicks + (m.clicks ?? 0),
    conversions: acc.conversions + (m.conversions ?? 0),
    reach: acc.reach + (m.reach ?? 0),
    replies: acc.replies + (m.replies ?? 0),
  }), { emails_sent: 0, leads_generated: 0, impressions: 0, ad_spend: 0, clicks: 0, conversions: 0, reach: 0, replies: 0 });

  const latestMetric = metrics?.length ? metrics[metrics.length - 1] : null;

  const STATUS_OPTIONS = ["draft", "scheduled", "active", "paused", "completed"];
  const TASK_STATUSES = ["pending", "in_progress", "completed"];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/crm/campaigns")} className="gap-2 text-muted-foreground">
        <ArrowLeft size={16} /> Back
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{campaign.name}</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">
            {campaign.type.replace(/_/g, " ")} · {(campaign as any).companies?.name} · £{Number(campaign.budget ?? 0).toLocaleString()}
          </p>
        </div>
        <Select value={campaign.status} onValueChange={(v) => statusMutation.mutate(v)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Objective */}
      {campaign.objective && (
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Objective</span>
          <p className="text-sm text-foreground mt-1">{campaign.objective}</p>
        </div>
      )}

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance" className="gap-1.5"><BarChart3 size={14} /> Performance</TabsTrigger>
          <TabsTrigger value="assets" className="gap-1.5"><FileText size={14} /> Assets</TabsTrigger>
          <TabsTrigger value="audience" className="gap-1.5"><Users size={14} /> Audience</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5"><CheckSquare size={14} /> Tasks</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Emails Sent", value: totals.emails_sent.toLocaleString() },
              { label: "Leads Generated", value: totals.leads_generated },
              { label: "Impressions", value: totals.impressions.toLocaleString() },
              { label: "Ad Spend", value: `£${totals.ad_spend.toLocaleString()}` },
              { label: "Clicks", value: totals.clicks.toLocaleString() },
              { label: "Conversions", value: totals.conversions },
              { label: "Reach", value: totals.reach.toLocaleString() },
              { label: "Replies", value: totals.replies },
            ].map((stat) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-4">Leads Over Time</h3>
              {(metrics ?? []).length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="leads_generated" fill="hsl(12, 90%, 58%)" radius={[6, 6, 0, 0]} name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>}
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-4">Engagement Trends</h3>
              {(metrics ?? []).length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="hsl(220, 60%, 50%)" strokeWidth={2} name="Engagement" />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(12, 90%, 58%)" strokeWidth={2} name="Clicks" />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>}
            </div>
          </div>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <label className="cursor-pointer">
              <Button variant="cta" disabled={uploading} className="gap-2" asChild>
                <span><Upload size={16} />{uploading ? "Uploading..." : "Upload Asset"}</span>
              </Button>
              <input type="file" className="hidden" onChange={handleAssetUpload} disabled={uploading} />
            </label>
          </div>
          <div className="space-y-2">
            {(assets ?? []).map((a) => (
              <div key={a.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{a.asset_type.replace(/_/g, " ")} · {format(new Date(a.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm"><Download size={14} /></Button></a>
                  <Button variant="ghost" size="sm" onClick={() => deleteAsset.mutate(a.id)}><Trash2 size={14} className="text-destructive" /></Button>
                </div>
              </div>
            ))}
            {(!assets || assets.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No assets uploaded yet</p>}
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="flex gap-3">
            <Dialog open={audienceDialog} onOpenChange={setAudienceDialog}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus size={14} /> Add Contact</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Audience Member</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <Input placeholder="Name *" value={audienceForm.name} onChange={(e) => setAudienceForm({ ...audienceForm, name: e.target.value })} />
                  <Input placeholder="Company" value={audienceForm.company_name} onChange={(e) => setAudienceForm({ ...audienceForm, company_name: e.target.value })} />
                  <Input placeholder="Email" value={audienceForm.email} onChange={(e) => setAudienceForm({ ...audienceForm, email: e.target.value })} />
                  <Input placeholder="Job Title" value={audienceForm.job_title} onChange={(e) => setAudienceForm({ ...audienceForm, job_title: e.target.value })} />
                  <Input placeholder="Industry" value={audienceForm.industry} onChange={(e) => setAudienceForm({ ...audienceForm, industry: e.target.value })} />
                  <Button variant="cta" className="w-full" disabled={!audienceForm.name} onClick={() => addAudience.mutate()}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
            <label className="cursor-pointer">
              <Button variant="outline" className="gap-2" asChild>
                <span><Upload size={14} /> Import CSV</span>
              </Button>
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            </label>
          </div>
          <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Industry</th>
                </tr>
              </thead>
              <tbody>
                {(audiences ?? []).map((a) => (
                  <tr key={a.id} className="border-b border-border/30 last:border-0">
                    <td className="px-4 py-3 text-foreground">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.company_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.job_title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.industry || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!audiences || audiences.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No audience members yet</p>}
          </div>
          <p className="text-xs text-muted-foreground">{audiences?.length ?? 0} audience members</p>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus size={14} /> Add Task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Campaign Task</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Task title *" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                <Textarea placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                <Button variant="cta" className="w-full" disabled={!taskForm.title} onClick={() => createTask.mutate()}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="space-y-2">
            {(tasks ?? []).map((t) => (
              <div key={t.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                  {t.due_date && <p className="text-xs text-muted-foreground mt-0.5">Due: {format(new Date(t.due_date), "MMM d, yyyy")}</p>}
                </div>
                <Select value={t.status} onValueChange={(v) => updateTaskStatus.mutate({ taskId: t.id, status: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {(!tasks || tasks.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No tasks yet</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetailPage;
