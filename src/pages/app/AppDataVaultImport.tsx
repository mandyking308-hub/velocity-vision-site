import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ImportReport, { ImportSummary } from "@/components/app/datavault/ImportReport";
import FeedbackPrompt from "@/components/support/FeedbackPrompt";
import PreviewStep, { PreviewRow } from "@/components/app/datavault/PreviewStep";
import { format } from "date-fns";

export default function AppDataVaultImport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["vault-import", id],
    queryFn: async () => {
      const [upload, rows] = await Promise.all([
        supabase.from("data_uploads").select("*").eq("id", id!).maybeSingle(),
        supabase.from("data_upload_rows").select("*").eq("upload_id", id!).order("row_number").limit(500),
      ]);
      return { upload: upload.data, rows: (rows.data || []) as any[] };
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading…</div>;
  if (!data?.upload) return <div className="p-6 text-muted-foreground">Import not found.</div>;

  const u = data.upload as any;
  const previewRows: PreviewRow[] = data.rows.map((r) => ({
    row_number: r.row_number,
    mapped_fields: r.mapped_fields,
    validation_status: r.validation_status,
    duplicate_status: r.duplicate_status,
    issues: r.issues || [],
  }));

  const totals = previewRows.reduce(
    (acc, r) => {
      acc[r.validation_status]++;
      if (r.duplicate_status !== "none") acc.duplicates++;
      acc.total++;
      return acc;
    },
    { valid: 0, needs_review: 0, risky: 0, blocked: 0, duplicates: 0, total: 0 } as any
  );

  const s: ImportSummary = {
    rows: u.row_count,
    created: u.summary?.created ?? 0,
    companies_created: u.summary?.companies_created ?? 0,
    duplicates: u.summary?.duplicates ?? totals.duplicates,
    risky: u.summary?.risky ?? totals.risky,
    needs_review: u.summary?.needs_review ?? totals.needs_review,
    blocked: u.summary?.blocked ?? totals.blocked,
    safe_to_send: u.summary?.safe_to_send ?? 0,
    recommended: u.summary?.recommended ?? [],
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/data-vault")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Data Vault
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mt-2">{u.file_name}</h1>
        <p className="text-muted-foreground">Uploaded {format(new Date(u.created_at), "d MMM yyyy, HH:mm")} · {u.row_count} rows · status {u.status}</p>
      </div>

      <ImportReport s={s} />

      <Card>
        <CardHeader><CardTitle className="text-base">Rows in this import</CardTitle></CardHeader>
        <CardContent>
          <PreviewStep rows={previewRows} totals={totals} />
        </CardContent>
      </Card>
    </div>
  );
}
