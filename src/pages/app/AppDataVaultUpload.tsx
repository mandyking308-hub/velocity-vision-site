import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "@/components/ui/use-toast";
import UploadStep from "@/components/app/datavault/UploadStep";
import MappingStep from "@/components/app/datavault/MappingStep";
import PreviewStep, { PreviewRow } from "@/components/app/datavault/PreviewStep";
import ConfirmStep from "@/components/app/datavault/ConfirmStep";
import ImportReport, { ImportSummary } from "@/components/app/datavault/ImportReport";
import { ParsedTable } from "@/lib/dataVault/parseCsv";
import { detectMapping } from "@/lib/dataVault/detectFields";
import { DestinationField } from "@/lib/dataVault/destinationFields";
import { validateRow, MappedRow, QualityStatus } from "@/lib/dataVault/validate";
import { buildDuplicateChecker, ExistingContact } from "@/lib/dataVault/duplicates";

type Step = "upload" | "map" | "preview" | "confirm" | "report";
const STEPS: { id: Step; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "map", label: "Map fields" },
  { id: "preview", label: "Preview" },
  { id: "confirm", label: "Confirm" },
  { id: "report", label: "Report" },
];

export default function AppDataVaultUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentId: workspaceId } = useWorkspace();
  const [step, setStep] = useState<Step>("upload");
  const [busy, setBusy] = useState(false);

  const [table, setTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"csv" | "paste" | "manual">("csv");
  const [mapping, setMapping] = useState<Record<string, DestinationField>>({});

  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const [include, setInclude] = useState({ valid: true, needs_review: true, risky: false, blocked: false });
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const [report, setReport] = useState<ImportSummary | null>(null);

  const totals = useMemo(() => {
    const t = { valid: 0, needs_review: 0, risky: 0, blocked: 0, duplicates: 0, total: previewRows.length };
    for (const r of previewRows) {
      t[r.validation_status]++;
      if (r.duplicate_status !== "none") t.duplicates++;
    }
    return t;
  }, [previewRows]);

  const goNext = async () => {
    if (step === "upload" && table) {
      const m = detectMapping(table.headers);
      setMapping(m);
      setStep("map");
      return;
    }
    if (step === "map" && table) {
      await buildPreview();
      setStep("preview");
      return;
    }
    if (step === "preview") {
      setStep("confirm");
      return;
    }
    if (step === "confirm") {
      await runImport();
    }
  };

  const goBack = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  function mapRowToFields(raw: Record<string, string>): MappedRow {
    const out: MappedRow = {};
    for (const [src, dest] of Object.entries(mapping)) {
      if (dest === "ignore" || !dest) continue;
      const v = (raw[src] || "").trim();
      if (!v) continue;
      (out as any)[dest] = v;
    }
    return out;
  }

  async function buildPreview() {
    if (!table || !user) return;
    setBusy(true);
    try {
      // Fetch existing contacts (this workspace only) for duplicate checks
      const dupQ = supabase
        .from("contacts")
        .select("id, email, first_name, last_name, company_id")
        .limit(5000);
      const { data: existing } = workspaceId ? await dupQ.eq("workspace_id", workspaceId) : await dupQ;
      const existingForCheck: ExistingContact[] = (existing || []).map((c: any) => ({
        id: c.id, email: c.email, first_name: c.first_name, last_name: c.last_name,
      }));
      const checkDup = buildDuplicateChecker(existingForCheck);

      const rows: PreviewRow[] = table.rows.map((raw, idx) => {
        const mapped = mapRowToFields(raw);
        const v = validateRow(mapped);
        const d = checkDup(mapped, idx);
        return {
          row_number: idx + 1,
          mapped_fields: mapped as any,
          validation_status: v.status,
          duplicate_status: d.status,
          issues: v.issues,
        };
      });
      setPreviewRows(rows);

      // Create the data_uploads + staging rows now (so we have an id)
      const summary = {
        rows: rows.length,
        valid: rows.filter((r) => r.validation_status === "valid").length,
        needs_review: rows.filter((r) => r.validation_status === "needs_review").length,
        risky: rows.filter((r) => r.validation_status === "risky").length,
        blocked: rows.filter((r) => r.validation_status === "blocked").length,
        duplicates: rows.filter((r) => r.duplicate_status !== "none").length,
      };
      const { data: upload, error } = await supabase
        .from("data_uploads")
        .insert({
          owner_id: user.id,
          workspace_id: workspaceId,
          file_name: fileName,
          file_type: fileType,
          row_count: rows.length,
          status: "previewed",
          summary,
        })
        .select("id")
        .single();
      if (error) throw error;
      setUploadId(upload.id);

      // mappings
      const mappingRows = Object.entries(mapping).map(([src, dest]) => ({
        upload_id: upload.id,
        owner_id: user.id,
        source_column: src,
        destination_field: dest === "ignore" ? null : dest,
        ignored: dest === "ignore",
      }));
      if (mappingRows.length) await supabase.from("data_upload_mappings").insert(mappingRows);

      // staging rows in chunks
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize).map((r, j) => ({
          upload_id: upload.id,
          owner_id: user!.id,
          row_number: r.row_number,
          raw_fields: table.rows[i + j],
          mapped_fields: r.mapped_fields,
          validation_status: r.validation_status,
          duplicate_status: r.duplicate_status,
          issues: r.issues,
          import_status: "pending",
        }));
        await supabase.from("data_upload_rows").insert(chunk);
      }
    } catch (e: any) {
      toast({ title: "Couldn't prepare preview", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function runImport() {
    if (!user || !uploadId) return;
    setBusy(true);
    try {
      const toImport = previewRows.filter((r) => {
        if (skipDuplicates && r.duplicate_status !== "none") return false;
        return include[r.validation_status];
      });

      let created = 0;
      let companiesCreated = 0;
      const companyCache = new Map<string, string>();

      for (const row of toImport) {
        const m = row.mapped_fields;
        let companyId: string | null = null;
        const companyName = m.company_name?.trim();
        if (companyName) {
          const key = companyName.toLowerCase();
          if (companyCache.has(key)) {
            companyId = companyCache.get(key)!;
          } else {
            // Scope company lookup to this workspace so we don't merge into another workspace's company
            const companyLookup = supabase
              .from("companies")
              .select("id")
              .ilike("name", companyName);
            const { data: existing } = workspaceId
              ? await companyLookup.eq("workspace_id", workspaceId).maybeSingle()
              : await companyLookup.maybeSingle();
            if (existing?.id) {
              companyId = existing.id;
            } else {
              const { data: newC } = await supabase
                .from("companies")
                .insert({
                  name: companyName,
                  website: m.website || null,
                  country: m.country || null,
                  language: m.language || null,
                  source_upload_id: uploadId,
                  workspace_id: workspaceId,
                  created_by: user.id,
                })
                .select("id")
                .single();
              if (newC) {
                companyId = newC.id;
                companiesCreated++;
              }
            }
            if (companyId) companyCache.set(key, companyId);
          }
        }

        const first = m.first_name || (m.full_name ? m.full_name.split(" ")[0] : null);
        const last = m.last_name || (m.full_name ? m.full_name.split(" ").slice(1).join(" ") || null : null);

        const { data: contact, error: cErr } = await supabase
          .from("contacts")
          .insert({
            company_id: companyId,
            first_name: first || null,
            last_name: last || null,
            email: m.email || null,
            phone: m.phone || null,
            job_title: m.job_title || null,
            country: m.country || null,
            language: m.language || null,
            source_upload_id: uploadId,
            workspace_id: workspaceId,
            quality_status: row.validation_status,
            duplicate_flag: row.duplicate_status !== "none",
            blocked: row.validation_status === "blocked",
            created_by: user.id,
          })
          .select("id")
          .single();

        if (cErr) {
          const msg = String(cErr.message || "");
          if (msg.includes("free_preview_contact_limit_reached")) {
            // Server-side Free Preview 25-contact limit hit. Stop the loop,
            // report partial import, keep upgrade nudge behaviour.
            try {
              const { trackUpgradeEvent } = await import("@/lib/upgradeEvents");
              trackUpgradeEvent("free_preview_contact_gate_hit", { reason: "contact_limit", plan: "free_preview" });
            } catch { /* non-blocking */ }
            toast({
              title: "Free Preview limit reached",
              description: `Imported ${created} of ${toImport.length}. Free Preview supports up to 25 contacts. Upgrade to Growth to work with larger audiences.`,
              variant: "destructive",
            });
            break;
          }
          continue;
        }
        if (contact) {
          created++;
          await supabase
            .from("data_upload_rows")
            .update({ imported_contact_id: contact.id, import_status: "imported" })
            .eq("upload_id", uploadId)
            .eq("row_number", row.row_number);
        }
      }

      const safeToSend = previewRows.filter((r) => r.validation_status === "valid" && r.duplicate_status === "none").length;

      const summary: ImportSummary = {
        rows: previewRows.length,
        created,
        companies_created: companiesCreated,
        duplicates: totals.duplicates,
        risky: totals.risky,
        needs_review: totals.needs_review,
        blocked: totals.blocked,
        safe_to_send: safeToSend,
        recommended: [
          ...(totals.risky > 0 ? [{ title: `Review ${totals.risky} risky contacts`, to: "/app/data-vault" }] : []),
          ...(totals.needs_review > 0 ? [{ title: `Clean ${totals.needs_review} contacts that need review`, to: "/app/data-vault" }] : []),
          { title: "Start an outreach campaign with your safe contacts", to: "/app/campaigns/new" },
        ],
      };
      await supabase
        .from("data_uploads")
        .update({ status: "imported", summary: summary as any })
        .eq("id", uploadId);

      setReport(summary);
      setStep("report");
      toast({ title: "Import complete", description: `${created} contacts added.` });
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("free_preview_contact_limit_reached")) {
        toast({
          title: "Free Preview limit reached",
          description: "Free Preview supports up to 25 contacts. Upgrade to Growth to work with larger audiences.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Import failed", description: e.message, variant: "destructive" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/data-vault")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Data Vault
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Import contacts</h1>
        <p className="text-muted-foreground">Upload, map, preview, then bring it into your active workspace.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = STEPS.findIndex((x) => x.id === step) > i;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <div className={`text-sm ${active ? "font-medium" : "text-muted-foreground"}`}>{s.label}</div>
              {i < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === "upload" && (
            <UploadStep
              onParsed={(t, fn, ft) => {
                setTable(t);
                setFileName(fn);
                setFileType(ft);
                const m = detectMapping(t.headers);
                setMapping(m);
                setStep("map");
              }}
            />
          )}
          {step === "map" && table && (
            <MappingStep
              headers={table.headers}
              sampleRow={table.rows[0] || {}}
              mapping={mapping}
              onChange={(h, d) => setMapping((prev) => ({ ...prev, [h]: d }))}
            />
          )}
          {step === "preview" && <PreviewStep rows={previewRows} totals={totals} />}
          {step === "confirm" && (
            <ConfirmStep
              totals={totals}
              include={include}
              skipDuplicates={skipDuplicates}
              onToggle={(k, v) => setInclude((prev) => ({ ...prev, [k]: v }))}
              onSkipDuplicates={setSkipDuplicates}
            />
          )}
          {step === "report" && report && <ImportReport s={report} />}
        </CardContent>
      </Card>

      {step !== "report" && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={goBack} disabled={step === "upload" || busy}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={goNext} disabled={busy || (step === "upload" && !table)}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {step === "confirm" ? "Run import" : "Continue"}
            {!busy && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      )}
      {step === "report" && (
        <div className="flex justify-end gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate("/app/data-vault")}>Back to Data Vault</Button>
          <Button variant="outline" onClick={() => navigate(`/app/data-vault/imports/${uploadId}`)}>View import detail</Button>
          <Button onClick={() => navigate("/app/activate")}>Activate safe contacts <ArrowRight className="h-4 w-4 ml-1" /></Button>
        </div>
      )}
    </div>
  );
}
