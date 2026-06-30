import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function DataVaultDashboardWidget() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["vault-widget", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [{ count: total }, { count: valid }, { count: needs }, { data: latest }] = await Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }).not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "valid").not("source_upload_id", "is", null),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("quality_status", "needs_review").not("source_upload_id", "is", null),
        supabase.from("data_uploads").select("id, file_name, created_at, summary").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        total: total ?? 0,
        valid: valid ?? 0,
        needs: needs ?? 0,
        safe_to_send: (latest as any)?.summary?.safe_to_send ?? valid ?? 0,
        latest,
      };
    },
    enabled: !!user,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Data Vault</CardTitle>
        <Button asChild size="sm" variant="ghost">
          <Link to="/app/data-vault">Open <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat label="Uploaded" value={data?.total ?? 0} />
          <Stat label="Valid" value={data?.valid ?? 0} tone="good" />
          <Stat label="Needs review" value={data?.needs ?? 0} tone="warn" />
          <Stat label="Safe to send" value={data?.safe_to_send ?? 0} />
        </div>
        {data?.latest && (
          <div className="text-xs text-muted-foreground mt-3">
            Latest: <span className="text-foreground font-medium">{(data.latest as any).file_name}</span>
          </div>
        )}
        {!data?.latest && (
          <div className="mt-3">
            <Button asChild size="sm"><Link to="/app/data-vault/upload">Upload contacts</Link></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "good" | "warn" }) {
  const c = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-foreground";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${c}`}>{value}</div>
    </div>
  );
}
