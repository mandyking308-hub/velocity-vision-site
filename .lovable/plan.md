
# Sprint: Data Vault + Upload + Mapping + Import Preview

Purely additive. No existing pages, routes, billing, credits, workspace, pipeline, demo, or founder flows are removed or restructured.

---

## 1. Database changes (one migration)

New tables, all workspace-scoped via `workspace_id` (using existing `client_workspaces.id`) plus `owner_id = auth.uid()`.

- `data_uploads` — one row per file/paste upload
  - `file_name`, `file_type` (`csv|paste|manual|xlsx`), `source` (storage path, nullable), `row_count`, `status` (`uploaded|mapped|previewed|imported|failed`), `workspace_id`, `owner_id`, `uploaded_by`, `summary jsonb` (final import report)
- `data_upload_rows` — staging rows
  - `upload_id`, `row_number`, `raw_fields jsonb`, `mapped_fields jsonb`, `validation_status` (`valid|needs_review|risky|blocked`), `duplicate_status` (`none|possible|likely|existing`), `duplicate_of_contact_id` (nullable), `issues jsonb`, `imported_contact_id` (nullable), `import_status` (`pending|imported|skipped|failed`)
- `data_upload_mappings` — saved column→field mapping per upload
  - `upload_id`, `source_column`, `destination_field` (enum-like text), `ignored bool`

Extend existing tables (nullable adds only — no breaking changes):

- `contacts`: add `source_upload_id`, `quality_status`, `duplicate_flag bool`, `blocked bool`, `suppressed bool`, `country`, `language`, `last_verified_at`, `last_contacted_at`, `last_interaction_at`
- `companies`: add `source_upload_id`, `country`, `region`, `language`

Storage: reuse `client-documents` bucket under prefix `data-uploads/<workspace_id>/<upload_id>/raw.csv`. Add UPDATE/DELETE policies scoped to owner.

RLS: standard workspace + owner scoping. GRANTs to `authenticated` + `service_role`. No `anon`.

---

## 2. Routes (added to `App.tsx`, under `/app`)

- `/app/data-vault` — Vault dashboard
- `/app/data-vault/upload` — 5-step wizard (Upload → Map → Preview → Confirm → Report)
- `/app/data-vault/imports/:id` — past import detail + report

Sidebar (`AppLayout.tsx`): insert "Data Vault" (Database icon) directly above Campaigns.

---

## 3. Files to create

```
src/pages/app/AppDataVault.tsx          # dashboard
src/pages/app/AppDataVaultUpload.tsx    # wizard shell
src/pages/app/AppDataVaultImport.tsx    # import detail / report
src/components/app/datavault/
  UploadStep.tsx          # CSV file / paste textarea / manual rows
  MappingStep.tsx         # two-column source→destination dropdowns
  PreviewStep.tsx         # sample rows, statuses, duplicates summary
  ConfirmStep.tsx         # final confirm + create active records
  ImportReport.tsx        # rows uploaded, created, dupes, etc.
  VaultSummaryCards.tsx   # top stat cards
  RecentImportsTable.tsx
  DataHealthPanel.tsx
  RecommendedActions.tsx
  DataVaultDashboardWidget.tsx  # reused on Launch Dashboard
src/lib/dataVault/
  parseCsv.ts             # tiny CSV parser (no new dep — handles quoted fields)
  detectFields.ts         # header → destination_field guesser
  validate.ts             # email regex, role-account detect, missing-field checks → quality_status
  duplicates.ts           # match against existing contacts + within-batch
  destinationFields.ts    # canonical field list + labels
```

## 4. Files to edit

- `src/App.tsx` — register 3 new routes inside the `/app` layout
- `src/pages/app/AppLayout.tsx` — add Data Vault nav entry (Database icon)
- `src/pages/app/AppDashboard.tsx` — mount `DataVaultDashboardWidget`
- `src/pages/demo/DemoCRMDashboard.tsx` (and add `src/pages/demo/DemoDataVault.tsx`) — show seeded demo upload, mapping preview, duplicates, report; CTA "Upload your own data" → `/auth`
- `src/integrations/supabase/types.ts` regenerates after migration

## 5. Upload flow detail

1. **Upload**: CSV via file input, paste textarea (tab/comma auto-detect), or manual-row entry table. Parse client-side, insert `data_uploads` row + `data_upload_rows` rows with `raw_fields`. For CSV files <5MB, upload raw to storage in parallel; skip for paste/manual.
2. **Map**: `detectFields` pre-fills mapping; user adjusts via dropdowns; saved to `data_upload_mappings`. "Ignore" option supported.
3. **Preview**: Compute `mapped_fields`, run `validate` → quality_status, run `duplicates` against existing `contacts` in workspace + within batch. Persist back to `data_upload_rows`. Show 25-row sample, totals, top issues.
4. **Confirm**: User chooses what to import (valid / needs_review / risky / blocked toggles; default = valid + needs_review). On confirm, insert into `contacts`/`companies` with `source_upload_id`, `quality_status`, etc. Update `data_upload_rows.imported_contact_id` and `import_status`.
5. **Report**: Render `ImportReport` with rows uploaded, contacts created, companies created, duplicates, risky, blocked, safe-to-send estimate, recommended next actions, link to pipeline.

## 6. Quality status rules (initial, conservative)

- `blocked`: malformed email AND no name AND no company; or matches suppressed list
- `risky`: role-account pattern (info@, admin@, sales@, noreply@), or free-email + no company, or email TLD obviously off
- `needs_review`: missing key field (name OR company), suspicious typos, name in email field
- `valid`: everything else

All checks return `issues: string[]` stored on the row for transparency.

## 7. Duplicate detection rules

Within batch + against existing workspace contacts:
- same normalized email → `likely`
- same full_name + same company_name → `possible`
- email already in `contacts` table → `existing`
Otherwise `none`. User can override per-row in preview (import as new / skip).

## 8. Vault dashboard widgets

- 8 summary cards: total contacts, total companies, imports, clean, needs review, risky, blocked, duplicates — counts pulled from `contacts` + latest `data_uploads.summary`.
- Recent imports table (10 most recent).
- Data health donut (clean/needs review/risky/blocked).
- Recommended actions list — derived from current vault state.
- Primary CTA: "Upload contacts" → wizard.

## 9. Launch Dashboard addition

`DataVaultDashboardWidget` shows: contacts uploaded, valid, needs review, safe-to-send estimate, latest import row, CTA "Open Data Vault".

## 10. Demo

Add `/demo/data-vault` route showing seeded `clients_q4_outreach.csv` upload: 247 rows, 12 duplicates, 18 risky, 9 blocked, 208 safe-to-send. Mapping preview, sample preview rows, report. CTA "Upload your own data" → `/auth`. No DB writes — pure read-only seeded constants.

## 11. Out of scope (called out for next sprint)

- Enrichment / verification provider integration
- Merge UI for duplicates (status flag + filter only this sprint)
- XLSX parsing (UI shows "Coming soon" tile; CSV/paste/manual ship now)
- Bulk suppression/segment builder
- Credit charging for activation (model in place via `source_upload_id`; pricing hooks added next sprint)

---

## Founder decisions needed before Prompt 2

1. **Storage tier**: confirm reusing `client-documents` bucket for raw uploads, or do you want a separate `data-vault-raw` bucket so you can apply a cheaper lifecycle policy later?
2. **Default import policy**: should `needs_review` rows be imported by default (current plan) or held in staging until reviewed?
3. **Free upload caps**: any per-workspace row limit for Starter (e.g. 5,000 staged rows) to protect cost before activation pricing lands in Prompt 2?
4. **XLSX**: ship now (adds `xlsx` dep ~400KB) or defer to Prompt 2?

Answer those and I'll execute. If you want me to proceed with sensible defaults (reuse bucket, import valid+needs_review, 10k staged-row cap, defer XLSX), say "go".
