import { Shield, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

const LegalCompliancePage = () => {
  const [search, setSearch] = useState("");

  const { data: acceptances, isLoading } = useQuery({
    queryKey: ["legal-acceptances-admin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("legal_acceptances")
        .select("*")
        .order("accepted_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = acceptances?.filter((a) =>
    (a.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.user_id ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield size={24} className="text-accent" /> Legal Compliance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Audit trail of legal acceptance records across all accounts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Acceptances</p>
          <p className="text-2xl font-bold text-foreground mt-1">{acceptances?.length ?? 0}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Business Accounts</p>
          <p className="text-2xl font-bold text-foreground mt-1">{acceptances?.filter(a => a.account_type === "business").length ?? 0}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Agency Accounts</p>
          <p className="text-2xl font-bold text-foreground mt-1">{acceptances?.filter(a => a.account_type === "agency").length ?? 0}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Latest Version</p>
          <p className="text-2xl font-bold text-accent mt-1">1.0</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Account Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date Accepted</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Version</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No acceptance records found.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-foreground">{a.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent capitalize">
                        {a.account_type ?? "business"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(a.accepted_at), "d MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{a.ip_address ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.legal_version ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LegalCompliancePage;
