import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CreditCard, Plus, DollarSign, FileText, TrendingUp, Users,
  Search, RefreshCw, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, startOfMonth, addMonths } from "date-fns";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from "recharts";

const COLORS = ["hsl(12, 90%, 58%)", "hsl(220, 60%, 50%)", "hsl(160, 50%, 50%)", "hsl(28, 90%, 55%)", "hsl(280, 50%, 55%)"];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-destructive/10 text-destructive",
};

const subStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const BillingPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "invoices" | "subscriptions">("overview");
  const [search, setSearch] = useState("");
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showSubDialog, setShowSubDialog] = useState(false);

  // Invoice form
  const [invForm, setInvForm] = useState({ company_id: "", description: "", amount: "", due_date: "" });
  // Sub form
  const [subForm, setSubForm] = useState({ company_id: "", plan_name: "starter", monthly_price: "" });

  const { data: companies } = useQuery({
    queryKey: ["billing-companies"],
    queryFn: async () => { const { data } = await supabase.from("companies").select("id, name"); return data ?? []; },
  });

  const { data: invoices } = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: async () => { const { data } = await supabase.from("invoices").select("*, companies(name)").order("created_at", { ascending: false }); return data ?? []; },
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["billing-subscriptions"],
    queryFn: async () => { const { data } = await supabase.from("subscriptions" as any).select("*, companies(name)").order("created_at", { ascending: false }); return (data ?? []) as any[]; },
  });

  const { data: payments } = useQuery({
    queryKey: ["billing-payments"],
    queryFn: async () => { const { data } = await supabase.from("payments" as any).select("*, companies(name)").order("created_at", { ascending: false }).limit(20); return (data ?? []) as any[]; },
  });

  // Mutations
  const createInvoice = useMutation({
    mutationFn: async () => {
      const num = `INV-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("invoices").insert({
        invoice_number: num, company_id: invForm.company_id, description: invForm.description,
        amount: parseFloat(invForm.amount) || 0, due_date: invForm.due_date || null, status: "sent",
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["billing-invoices"] }); setShowInvoiceDialog(false); setInvForm({ company_id: "", description: "", amount: "", due_date: "" }); toast.success("Invoice created"); },
    onError: (e: any) => toast.error(e.message),
  });

  const createSubscription = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("subscriptions" as any).insert({
        company_id: subForm.company_id, plan_name: subForm.plan_name,
        monthly_price: parseFloat(subForm.monthly_price) || 0,
        renewal_date: format(addMonths(new Date(), 1), "yyyy-MM-dd"), created_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["billing-subscriptions"] }); setShowSubDialog(false); setSubForm({ company_id: "", plan_name: "starter", monthly_price: "" }); toast.success("Subscription created"); },
    onError: (e: any) => toast.error(e.message),
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const inv = invoices?.find((i) => i.id === id);
      const { error } = await supabase.from("invoices").update({ status: "paid", paid_date: format(new Date(), "yyyy-MM-dd") }).eq("id", id);
      if (error) throw error;
      if (inv) {
        await supabase.from("payments" as any).insert({ company_id: inv.company_id, invoice_id: id, amount: inv.amount, method: "manual", status: "completed" } as any);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["billing-invoices"] }); queryClient.invalidateQueries({ queryKey: ["billing-payments"] }); toast.success("Marked as paid"); },
  });

  // KPIs
  const now = new Date();
  const monthStart = startOfMonth(now);
  const paidInvoices = invoices?.filter((i) => i.status === "paid") ?? [];
  const revenueThisMonth = paidInvoices.filter((i) => new Date(i.created_at) >= monthStart).reduce((s, i) => s + Number(i.amount), 0);
  const totalOutstanding = invoices?.filter((i) => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + Number(i.amount), 0) ?? 0;
  const mrr = (subscriptions ?? []).filter((s: any) => s.status === "active").reduce((sum: number, s: any) => sum + Number(s.monthly_price ?? 0), 0);
  const totalRevenueYear = paidInvoices.filter((i) => new Date(i.created_at).getFullYear() === now.getFullYear()).reduce((s, i) => s + Number(i.amount), 0);

  // Revenue chart (last 6 months)
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); revenueByMonth[format(d, "MMM")] = 0; }
  paidInvoices.forEach((inv) => { const key = format(new Date(inv.created_at), "MMM"); if (key in revenueByMonth) revenueByMonth[key] += Number(inv.amount); });
  const revenueChart = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  // Revenue by client (top 5)
  const clientRevMap: Record<string, { name: string; revenue: number }> = {};
  paidInvoices.forEach((inv) => {
    const name = (inv as any).companies?.name || "Unknown";
    if (!clientRevMap[inv.company_id]) clientRevMap[inv.company_id] = { name, revenue: 0 };
    clientRevMap[inv.company_id].revenue += Number(inv.amount);
  });
  const clientRevenue = Object.values(clientRevMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const filteredInvoices = invoices?.filter((i) => {
    const name = (i as any).companies?.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || i.invoice_number.toLowerCase().includes(search.toLowerCase());
  }) ?? [];

  const filteredSubs = (subscriptions ?? []).filter((s: any) => {
    const name = s.companies?.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || s.plan_name.toLowerCase().includes(search.toLowerCase());
  });

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "invoices", label: "Invoices" },
    { key: "subscriptions", label: "Subscriptions" },
  ] as const;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Billing & Revenue</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage invoices, subscriptions, and track revenue</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus size={14} /> New Invoice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div><Label>Client Company</Label>
                  <Select value={invForm.company_id} onValueChange={(v) => setInvForm({ ...invForm, company_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>{companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Input value={invForm.description} onChange={(e) => setInvForm({ ...invForm, description: e.target.value })} /></div>
                <div><Label>Amount (£)</Label><Input type="number" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} /></div>
                <div><Label>Due Date</Label><Input type="date" value={invForm.due_date} onChange={(e) => setInvForm({ ...invForm, due_date: e.target.value })} /></div>
                <Button onClick={() => createInvoice.mutate()} disabled={!invForm.company_id || !invForm.amount} className="w-full">Create Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showSubDialog} onOpenChange={setShowSubDialog}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><RefreshCw size={14} /> New Subscription</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Subscription</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div><Label>Client Company</Label>
                  <Select value={subForm.company_id} onValueChange={(v) => setSubForm({ ...subForm, company_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>{companies?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Plan</Label>
                  <Select value={subForm.plan_name} onValueChange={(v) => setSubForm({ ...subForm, plan_name: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Monthly Price (£)</Label><Input type="number" value={subForm.monthly_price} onChange={(e) => setSubForm({ ...subForm, monthly_price: e.target.value })} /></div>
                <Button onClick={() => createSubscription.mutate()} disabled={!subForm.company_id || !subForm.monthly_price} className="w-full">Create Subscription</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "MRR", value: `£${mrr.toLocaleString()}`, icon: RefreshCw, color: "text-accent" },
              { label: "Revenue This Month", value: `£${revenueThisMonth.toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
              { label: "Outstanding", value: `£${totalOutstanding.toLocaleString()}`, icon: CreditCard, color: "text-destructive" },
              { label: "Total Revenue (Year)", value: `£${totalRevenueYear.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2"><kpi.icon size={16} className={kpi.color} /><span className="text-xs text-muted-foreground">{kpi.label}</span></div>
                <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-4">Revenue Trend</h3>
              {revenueChart.some((d) => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueChart}>
                    <defs><linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(12, 90%, 58%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(12, 90%, 58%)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(12, 90%, 58%)" fill="url(#revG)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No revenue data yet</p>}
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-4">Revenue by Client</h3>
              {clientRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={clientRevenue} cx="50%" cy="50%" outerRadius={90} dataKey="revenue" label={({ name, revenue }) => `${name}: £${revenue.toLocaleString()}`}>
                      {clientRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data</p>}
            </div>
          </div>

          {/* Recent payments */}
          <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border/30"><h3 className="font-display font-semibold text-foreground">Recent Payments</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/30 bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Method</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
              </tr></thead>
              <tbody>
                {(payments ?? []).slice(0, 10).map((p: any) => (
                  <tr key={p.id} className="border-b border-border/20 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">{p.companies?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-foreground">£{Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-muted-foreground capitalize">{p.method}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!payments || payments.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No payments recorded</p>}
          </div>
        </>
      )}

      {tab === "invoices" && (
        <>
          <div className="flex gap-3"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div></div>
          <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filteredInvoices.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/30 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-foreground">{(inv as any).companies?.name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{inv.description || "—"}</td>
                    <td className="px-4 py-3 font-medium text-foreground">£{Number(inv.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[inv.status] || ""}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      {inv.status !== "paid" && <Button variant="ghost" size="sm" onClick={() => markPaid.mutate(inv.id)} className="text-xs">Mark Paid</Button>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">No invoices found</p>}
          </div>
        </>
      )}

      {tab === "subscriptions" && (
        <>
          <div className="flex gap-3"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div></div>
          <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Monthly</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Start</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Renewal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {filteredSubs.map((sub: any, i: number) => (
                  <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/30 last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{sub.companies?.name || "—"}</td>
                    <td className="px-4 py-3 text-foreground capitalize">{sub.plan_name}</td>
                    <td className="px-4 py-3 font-medium text-foreground">£{Number(sub.monthly_price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{sub.start_date ? format(new Date(sub.start_date), "MMM d, yyyy") : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{sub.renewal_date ? format(new Date(sub.renewal_date), "MMM d, yyyy") : "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${subStatusColors[sub.status] || ""}`}>{sub.status}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredSubs.length === 0 && <p className="text-muted-foreground text-sm text-center py-12">No subscriptions found</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default BillingPage;
