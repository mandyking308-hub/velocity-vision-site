import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { CreditCard, Download, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

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

const PortalBilling = () => {
  const { companyId } = useClientCompany();

  const { data: invoices } = useQuery({
    queryKey: ["portal-invoices", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["portal-subscriptions", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("subscriptions" as any).select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const { data: payments } = useQuery({
    queryKey: ["portal-payments", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("payments" as any).select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
    enabled: !!companyId,
  });

  const totalOutstanding = invoices?.filter((i) => i.status !== "paid" && i.status !== "draft").reduce((sum, i) => sum + Number(i.amount), 0) ?? 0;
  const totalPaid = invoices?.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0) ?? 0;
  const activeSub = (subscriptions ?? []).find((s: any) => s.status === "active");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your subscription, invoices, and payment history</p>
      </div>

      {/* Current Subscription */}
      {activeSub && (
        <div className="bg-card border border-accent/20 rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw size={16} className="text-accent" />
            <h3 className="font-display font-semibold text-foreground">Current Subscription</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><span className="text-xs text-muted-foreground">Plan</span><p className="font-medium text-foreground capitalize">{activeSub.plan_name}</p></div>
            <div><span className="text-xs text-muted-foreground">Monthly Price</span><p className="font-medium text-foreground">£{Number(activeSub.monthly_price).toLocaleString()}</p></div>
            <div><span className="text-xs text-muted-foreground">Start Date</span><p className="font-medium text-foreground">{activeSub.start_date ? format(new Date(activeSub.start_date), "MMM d, yyyy") : "—"}</p></div>
            <div><span className="text-xs text-muted-foreground">Next Renewal</span><p className="font-medium text-foreground">{activeSub.renewal_date ? format(new Date(activeSub.renewal_date), "MMM d, yyyy") : "—"}</p></div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <span className="text-xs text-muted-foreground">Total Invoices</span>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{invoices?.length ?? 0}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <span className="text-xs text-muted-foreground">Outstanding</span>
          <p className="text-2xl font-display font-bold text-destructive mt-1">£{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
          <span className="text-xs text-muted-foreground">Total Paid</span>
          <p className="text-2xl font-display font-bold text-green-600 mt-1">£{totalPaid.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border/30 flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">Invoices</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice #</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {(invoices ?? []).map((inv, i) => (
              <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.description || "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">£{Number(inv.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[inv.status] || ""}`}>{inv.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {inv.file_url && (
                    <a href={inv.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </a>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {(!invoices || invoices.length === 0) && <p className="text-muted-foreground text-sm text-center py-12">No invoices yet</p>}
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border/30 flex items-center gap-2">
          <CreditCard size={16} className="text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">Payment History</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border/30 bg-muted/30">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
          </tr></thead>
          <tbody>
            {(payments ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-border/20 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">£{Number(p.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{p.method}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium capitalize bg-green-100 text-green-700">{p.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!payments || payments.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No payments recorded</p>}
      </div>
    </div>
  );
};

export default PortalBilling;
