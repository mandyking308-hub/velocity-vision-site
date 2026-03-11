import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-destructive/10 text-destructive",
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

  const totalOutstanding = invoices?.filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.amount), 0) ?? 0;
  const totalPaid = invoices?.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0) ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Billing & Invoices</h1>
        <p className="text-muted-foreground text-sm mt-1">View your invoices and payment history</p>
      </div>

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

      <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
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
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.description || "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">£{Number(inv.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.due_date ? format(new Date(inv.due_date), "MMM d, yyyy") : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[inv.status] || ""}`}>
                    {inv.status}
                  </span>
                </td>
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
        {(!invoices || invoices.length === 0) && (
          <p className="text-muted-foreground text-sm text-center py-12">No invoices yet</p>
        )}
      </div>
    </div>
  );
};

export default PortalBilling;
