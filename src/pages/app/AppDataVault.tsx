import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import VaultSummaryCards from "@/components/app/datavault/VaultSummaryCards";
import RecentImportsTable from "@/components/app/datavault/RecentImportsTable";
import DataHealthPanel from "@/components/app/datavault/DataHealthPanel";
import RecommendedActions from "@/components/app/datavault/RecommendedActions";
import { Users, Building2, FolderUp, CheckCircle2, AlertTriangle, AlertOctagon, Ban, Copy, Upload, ShieldAlert, ListChecks, Send } from "lucide-react";

export default function AppDataVault() {
  const { user } = useAuth();
  const { currentId } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ["vault-dashboard", user?.id, currentId],
    queryFn: async () => {
      // NOTE: contacts/companies do not yet have workspace_id — scoping is company-wide.
      const importsQ = supabase.from("data_uploads").select("id, file_name, created_at, row_count, status, summary").order("created_at", { ascending: false }).limit(10);
      const [contactsRes, companiesRes, importsRes, qualityRes] = await Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }).not("source_upload_id", "is", null),
        supabase.from("companies").select("*", { count: "exact", head: true }).not("source_upload_id", "is", null),
        currentId ? importsQ.eq("workspace_id", currentId) : importsQ,
        supabase.from("contacts").select("quality_status, duplicate_flag, blocked").not("source_upload_id", "is", null).limit(5000),
      ]);
      const all = (qualityRes.data || []) as any[];
      const clean = all.filter((c) => c.quality_status === "valid" && !c.blocked).length;
      const needs = all.filter((c) => c.quality_status === "needs_review").length;
      const risky = all.filter((c) => c.quality_status === "risky").length;
      const blocked = all.filter((c) => c.quality_status === "blocked" || c.blocked).length;
      const dupes = all.filter((c) => c.duplicate_flag).length;
      return {
        contacts: contactsRes.count ?? 0,
        companies: companiesRes.count ?? 0,
        imports: importsRes.data || [],
        clean, needs, risky, blocked, dupes,
      };
    },
    enabled: !!user,
  });

  const stats = [
    { label: "Total contacts", value: data?.contacts ?? 0, icon: Users },
    { label: "Total companies", value: data?.companies ?? 0, icon: Building2 },
    { label: "Imported lists", value: data?.imports.length ?? 0, icon: FolderUp },
    { label: "Clean", value: data?.clean ?? 0, icon: CheckCircle2, tone: "good" as const },
    { label: "Needs review", value: data?.needs ?? 0, icon: AlertTriangle, tone: "warn" as const },
    { label: "Risky", value: data?.risky ?? 0, icon: AlertOctagon, tone: "warn" as const },
    { label: "Blocked", value: data?.blocked ?? 0, icon: Ban, tone: "danger" as const },
    { label: "Duplicates", value: data?.dupes ?? 0, icon: Copy },
  ];

  const actions: any[] = [];
  if ((data?.risky ?? 0) > 0) actions.push({ icon: ShieldAlert, title: `Review ${data!.risky} risky contacts`, description: "Decide whether to keep, suppress, or remove.", to: "/app/data-vault", cta: "Review" });
  if ((data?.dupes ?? 0) > 0) actions.push({ icon: Copy, title: `Resolve ${data!.dupes} duplicates`, description: "Merge or skip — your call.", to: "/app/data-vault", cta: "Resolve" });
  if ((data?.needs ?? 0) > 0) actions.push({ icon: ListChecks, title: `Clean ${data!.needs} contacts that need review`, description: "Missing names or companies.", to: "/app/data-vault", cta: "Clean" });
  if ((data?.clean ?? 0) > 0) actions.push({ icon: Send, title: "Move safe contacts into outreach", description: "Start a campaign with your clean list.", to: "/app/campaigns/new", cta: "Use" });
  actions.push({ icon: Upload, title: "Import your next list", description: "CSV, paste, or manual entry.", to: "/app/data-vault/upload", cta: "Upload" });

  const empty = !isLoading && (data?.contacts ?? 0) === 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Vault</h1>
          <p className="text-muted-foreground mt-1">Bring your commercial data in. We'll show you what's usable, what needs work, and what's safe to activate.</p>
        </div>
        <Button asChild size="lg"><Link to="/app/data-vault/upload"><Upload className="h-4 w-4 mr-2" />Upload contacts</Link></Button>
      </div>

      {empty ? (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">No contacts yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Upload is storage. Activation is action. Bring your contacts in first — we'll flag quality, duplicates and risky records before anything is sent.
              </p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              <Button asChild><Link to="/app/data-vault/upload"><Upload className="h-4 w-4 mr-2" />Upload contacts</Link></Button>
              <Button asChild variant="outline"><Link to="/demo/data-vault">View demo data flow</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <VaultSummaryCards stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Recent imports</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : <RecentImportsTable imports={(data?.imports as any) || []} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Data health</CardTitle></CardHeader>
              <CardContent>
                <DataHealthPanel clean={data?.clean ?? 0} needs_review={data?.needs ?? 0} risky={data?.risky ?? 0} blocked={data?.blocked ?? 0} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Recommended next actions</CardTitle></CardHeader>
            <CardContent><RecommendedActions actions={actions} /></CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
