import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import VaultSummaryCards from "@/components/app/datavault/VaultSummaryCards";
import RecentImportsTable from "@/components/app/datavault/RecentImportsTable";
import DataHealthPanel from "@/components/app/datavault/DataHealthPanel";
import RecommendedActions from "@/components/app/datavault/RecommendedActions";
import { Users, Building2, FolderUp, CheckCircle2, AlertTriangle, AlertOctagon, Ban, Copy, Upload, ShieldAlert, ListChecks, Send, X } from "lucide-react";

type QualityFilter = "valid" | "needs_review" | "risky" | "blocked" | "duplicates";
const FILTER_LABEL: Record<QualityFilter, string> = { valid: "Eligible under checks", needs_review: "Needs review", risky: "Risky", blocked: "Blocked", duplicates: "Duplicates" };

export default function AppDataVault() {
  const { user } = useAuth();
  const { currentId } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const quality = (params.get("quality") as QualityFilter | null) || null;

  const { data, isLoading } = useQuery({
    queryKey: ["vault-dashboard", user?.id, currentId],
    queryFn: async () => {
      const importsQ = supabase.from("data_uploads").select("id, file_name, created_at, row_count, status, summary").order("created_at", { ascending: false }).limit(10);
      const contactsQ = supabase.from("contacts").select("*", { count: "exact", head: true });
      const companiesQ = supabase.from("companies").select("*", { count: "exact", head: true });
      const qualityQ = supabase.from("contacts").select("quality_status, duplicate_flag, blocked").limit(5000);
      const [contactsRes, companiesRes, importsRes, qualityRes] = await Promise.all([
        currentId ? contactsQ.eq("workspace_id", currentId) : contactsQ.not("source_upload_id", "is", null),
        currentId ? companiesQ.eq("workspace_id", currentId) : companiesQ.not("source_upload_id", "is", null),
        currentId ? importsQ.eq("workspace_id", currentId) : importsQ,
        currentId ? qualityQ.eq("workspace_id", currentId) : qualityQ.not("source_upload_id", "is", null),
      ]);
      const all = (qualityRes.data || []) as any[];
      const eligible = all.filter((c) => c.quality_status === "valid" && !c.blocked && !c.duplicate_flag).length;
      const needs = all.filter((c) => c.quality_status === "needs_review").length;
      const risky = all.filter((c) => c.quality_status === "risky").length;
      const blocked = all.filter((c) => c.quality_status === "blocked" || c.blocked).length;
      const dupes = all.filter((c) => c.duplicate_flag).length;
      return { contacts: contactsRes.count ?? 0, companies: companiesRes.count ?? 0, imports: importsRes.data || [], eligible, needs, risky, blocked, dupes };
    },
    enabled: !!user,
  });

  const { data: filtered, isLoading: filteredLoading } = useQuery({
    queryKey: ["vault-contacts", user?.id, currentId, quality],
    enabled: !!user && !!quality,
    queryFn: async () => {
      let q = supabase.from("contacts").select("id, email, first_name, last_name, job_title, quality_status, duplicate_flag, blocked, created_at, source_upload_id, company_id").order("created_at", { ascending: false }).limit(200);
      if (currentId) q = q.eq("workspace_id", currentId);
      if (quality === "duplicates") q = q.eq("duplicate_flag", true);
      else if (quality === "blocked") q = q.or("quality_status.eq.blocked,blocked.eq.true");
      else q = q.eq("quality_status", quality);
      const { data: rows } = await q;
      const companyIds = Array.from(new Set((rows || []).map((r: any) => r.company_id).filter(Boolean)));
      const companies: Record<string, string> = {};
      if (companyIds.length) {
        const { data: cs } = await supabase.from("companies").select("id, name").in("id", companyIds);
        for (const c of cs || []) companies[(c as any).id] = (c as any).name;
      }
      return (rows || []).map((r: any) => ({ ...r, company_name: r.company_id ? companies[r.company_id] || null : null }));
    },
  });

  const stats = [
    { label: "Total contacts", value: data?.contacts ?? 0, icon: Users },
    { label: "Total companies", value: data?.companies ?? 0, icon: Building2 },
    { label: "Imported lists", value: data?.imports.length ?? 0, icon: FolderUp },
    { label: "Eligible under checks", value: data?.eligible ?? 0, icon: CheckCircle2, tone: "good" as const },
    { label: "Needs review", value: data?.needs ?? 0, icon: AlertTriangle, tone: "warn" as const },
    { label: "Risky", value: data?.risky ?? 0, icon: AlertOctagon, tone: "warn" as const },
    { label: "Blocked", value: data?.blocked ?? 0, icon: Ban, tone: "danger" as const },
    { label: "Duplicates", value: data?.dupes ?? 0, icon: Copy },
  ];

  const actions: any[] = [];
  if ((data?.risky ?? 0) > 0) actions.push({ icon: ShieldAlert, title: `Review ${data!.risky} risky contacts`, description: "Decide whether to keep, suppress or remove them.", to: "/app/data-vault?quality=risky", cta: "Review" });
  if ((data?.dupes ?? 0) > 0) actions.push({ icon: Copy, title: `Resolve ${data!.dupes} duplicates`, description: "Merge or skip them based on your records.", to: "/app/data-vault?quality=duplicates", cta: "Resolve" });
  if ((data?.needs ?? 0) > 0) actions.push({ icon: ListChecks, title: `Review ${data!.needs} incomplete contacts`, description: "Check missing or ambiguous fields.", to: "/app/data-vault?quality=needs_review", cta: "Review" });
  if ((data?.eligible ?? 0) > 0) actions.push({ icon: Send, title: "Prepare eligible records for a campaign", description: "Activation preparation creates campaign leads; it does not send email.", to: "/app/activate", cta: "Prepare" });
  actions.push({ icon: Upload, title: "Import your next list", description: "Upload another authorized CSV or spreadsheet.", to: "/app/data-vault/upload", cta: "Upload" });

  const empty = !isLoading && (data?.contacts ?? 0) === 0;
  const clearFilter = () => { const next = new URLSearchParams(params); next.delete("quality"); setParams(next, { replace: true }); };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div><h1 className="text-3xl font-bold tracking-tight">Data Vault</h1><p className="text-muted-foreground mt-1">Review customer-authorized business data, quality flags, duplicates and exclusions before deciding what to use.</p></div>
        <Button asChild size="lg"><Link to="/app/data-vault/upload"><Upload className="h-4 w-4 mr-2" />Upload contacts</Link></Button>
      </div>
      <p className="text-xs text-muted-foreground">A “valid” record has passed current workspace-format and quality checks only. It does not establish lawful basis, consent, recipient suitability, deliverability or legal compliance.</p>

      {empty ? (
        <Card><CardContent className="p-10 text-center space-y-4"><Upload className="h-12 w-12 mx-auto text-muted-foreground" /><div><h2 className="text-xl font-semibold">No contacts yet</h2><p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Upload is storage. Activation preparation is a separate customer decision. Bring authorized records in first; the workspace will flag quality, duplicates and risky records before you decide what to use.</p></div><div className="flex justify-center gap-2 flex-wrap"><Button asChild><Link to="/app/data-vault/upload"><Upload className="h-4 w-4 mr-2" />Upload contacts</Link></Button><Button asChild variant="outline"><Link to="/demo/data-vault">View demo data flow</Link></Button></div></CardContent></Card>
      ) : (
        <>
          <VaultSummaryCards stats={stats} />
          {quality && <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3"><div><CardTitle className="text-base flex items-center gap-2">Filtered: {FILTER_LABEL[quality]} <Badge variant="outline">{filtered?.length ?? 0}</Badge></CardTitle><p className="text-xs text-muted-foreground mt-1">Showing up to 200 recent records. Blocked records remain excluded by current workspace rules.</p></div><div className="flex gap-2 flex-wrap">{(["valid","needs_review","risky","blocked","duplicates"] as QualityFilter[]).map((q) => <Button key={q} size="sm" variant={q === quality ? "default" : "outline"} onClick={() => { const n = new URLSearchParams(params); n.set("quality", q); setParams(n, { replace: true }); }}>{FILTER_LABEL[q]}</Button>)}<Button size="sm" variant="ghost" onClick={clearFilter}><X className="h-3 w-3 mr-1" /> Clear</Button></div></CardHeader><CardContent>{filteredLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : (filtered || []).length === 0 ? <div className="text-sm text-muted-foreground">No records in this filter.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-muted-foreground text-left"><tr><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Company</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Import</th></tr></thead><tbody>{(filtered as any[]).map((c) => <tr key={c.id} className="border-t border-border"><td className="py-2 pr-3 font-mono text-xs">{c.email || "—"}</td><td className="py-2 pr-3">{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</td><td className="py-2 pr-3">{c.company_name || "—"}</td><td className="py-2 pr-3"><StatusPill status={c.quality_status} blocked={c.blocked} duplicate={c.duplicate_flag} /></td><td className="py-2 pr-3">{c.source_upload_id ? <Link to={`/app/data-vault/imports/${c.source_upload_id}`} className="text-primary hover:underline text-xs">View</Link> : "—"}</td></tr>)}</tbody></table></div>}</CardContent></Card>}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">Recent imports</CardTitle></CardHeader><CardContent>{isLoading ? <div className="text-sm text-muted-foreground">Loading…</div> : <RecentImportsTable imports={(data?.imports as any) || []} />}</CardContent></Card><Card><CardHeader><CardTitle className="text-base">Data health</CardTitle></CardHeader><CardContent><DataHealthPanel clean={data?.eligible ?? 0} needs_review={data?.needs ?? 0} risky={data?.risky ?? 0} blocked={data?.blocked ?? 0} /></CardContent></Card></div>
          <Card><CardHeader><CardTitle className="text-base">Recommended next actions</CardTitle></CardHeader><CardContent><RecommendedActions actions={actions} /></CardContent></Card>
        </>
      )}
    </div>
  );
}

function StatusPill({ status, blocked, duplicate }: { status: string | null; blocked: boolean; duplicate: boolean }) {
  const tone = blocked || status === "blocked" ? "bg-rose-100 text-rose-700" : status === "risky" ? "bg-amber-100 text-amber-800" : status === "needs_review" ? "bg-blue-100 text-blue-800" : status === "valid" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground";
  const label = blocked || status === "blocked" ? "blocked" : status === "valid" ? "eligible under checks" : status || "unknown";
  return <><span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>{label}</span>{duplicate && <span className="ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">duplicate</span>}</>;
}
