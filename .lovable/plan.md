# Data Vault → Activate → Outreach: gap fix plan

## Current state (verified)

- Upload wizard (`AppDataVaultUpload.tsx`) already: parses CSV/paste/manual, detects mapping, validates rows, deduplicates against workspace, writes `data_uploads`, `data_upload_mappings`, `data_upload_rows`, and inserts into `contacts` + `companies` with `quality_status`, `duplicate_flag`, `blocked`. Default include is `{valid: true, needs_review: true, risky: false, blocked: false}`, `skipDuplicates: true`.
- `validateRow` in `src/lib/dataVault/validate.ts` classifies valid / needs_review / risky / blocked with reasonable rules.
- `buildDuplicateChecker` in `src/lib/dataVault/duplicates.ts` implements existing / likely / possible / none.
- `AppDataVault.tsx` totals are real; but all "recommended action" buttons point back to `/app/data-vault` or generic `/app/campaigns/new`.
- `AppActivation.tsx` counts contacts by `quality_status`, computes safety, but `runActivation()` **only writes an audit row and navigates** — it does NOT create leads.
- Campaign Emails tab (`EmailSequenceSender`) sends to `leads` rows keyed by `campaign_id`. Nothing currently converts safe contacts into campaign leads.

**The critical missing bridge: Activate does not populate `leads`.** Everything else is in decent shape.

## Fixes

### 1. Classification (`src/lib/dataVault/validate.ts`)
Tighten so "valid" truly means safe-to-send:
- Require a real email present AND a name-or-company for `valid`. Missing name+company with a good email → `needs_review` (not valid).
- Free-mail domain with no company → keep as `needs_review`.
- Role-based address → `risky` (unchanged).
- Effectively empty → `blocked` (unchanged).
- Add `disposable`/typo-domain quick list to `risky`.

### 2. Duplicates
Rules are already correct. No functional change; ensure imported duplicates cannot silently become safe activation leads (see step 4 — activation filter excludes `duplicate_flag = true` by default).

### 3. Data Vault dashboard actions (`src/pages/app/AppDataVault.tsx`)
Point recommended actions at usable destinations:
- "Review N risky contacts" → `/app/data-vault?quality=risky`
- "Clean N needs_review" → `/app/data-vault?quality=needs_review`
- "Resolve N duplicates" → `/app/data-vault?quality=duplicates`
- "Move safe contacts into outreach" → `/app/activate`

Add a lightweight filtered **Contacts panel** on `/app/data-vault` when `?quality=` is present: table of contacts filtered by `quality_status` (or `duplicate_flag`) with columns email/name/company/status/notes and links back to the import detail.

### 4. Activate → leads bridge (`src/pages/app/AppActivation.tsx`) — critical
- Add a **Campaign** selector (existing draft/scheduled campaigns in this workspace) plus "Create new campaign" that reuses `/app/campaigns/new` and returns via `?campaign=<id>`.
- Rewrite `runActivation()` to:
  1. Query contacts in current workspace filtered by chosen quality (`valid` always; `needs_review` if `includeReview`; up to `riskyClamped` risky, chosen deterministically by `created_at asc`).
  2. Exclude `blocked = true`, `suppressed = true`, `quality_status in ('blocked','suppressed')`, and (by default) `duplicate_flag = true`.
  3. Skip contacts already linked to the target campaign as a lead (`leads.contact_id + campaign_id` uniqueness enforced in code).
  4. Insert `leads` rows (`source: 'activation'`, `contact_id`, `company_id`, `workspace_id`, `campaign_id`, `email`, `name`, `status: 'new'`, `created_by`, `owner_id`). Use chunked inserts.
  5. Write audit rows to `send_audit_log` (`activation_completed` with counts and lead ids sample).
  6. Toast + navigate to `/app/campaigns/:id` Emails tab.
- No emails sent from Activate. The existing SendDialog remains the only send path and still enforces its own gates.

### 5. Campaign Emails tab
Already reads `leads` by `campaign_id`; will now show activated leads. Confirm the `SendDialog` still requires deliberate selection (already fixed last turn).

### 6. QA test CSV
Create `docs/qa/velocity-qa-100-contacts.csv` containing 100 rows covering: valid business contacts, missing email, invalid email, missing name, missing company, role emails (info@/admin@/sales@/support@), free-mail without company, in-file duplicate emails, name+company duplicates, effectively empty rows, risky and blocked rows. For repeat use in Mandy's QA workspace only. Not auto-imported.

### 7. Typecheck + return report
Run `tsgo --noEmit`. Report every item requested in the task's RETURN block.

## Out of scope (explicitly not touched)
- Public site, Stripe, pricing, legal document content, campaign generation, email engine internals, sender readiness.
- No automatic email sending anywhere.
- No changes to `data_upload_rows`, `data_uploads`, `contacts`, `leads` schema.

## Technical notes
- No DB migration needed: `leads` already has the columns required.
- Filtered vault table piggybacks on existing `contacts` query, adding `?quality=` reading with `useSearchParams`.
- Duplicate-lead guard implemented by fetching existing `leads.contact_id` for the chosen campaign and set-differencing in code (small volumes, warm-up cap ≤ 100/day).
- Files expected to change:
  - `src/lib/dataVault/validate.ts` (tighten)
  - `src/pages/app/AppDataVault.tsx` (action links, filtered contacts panel)
  - `src/pages/app/AppActivation.tsx` (campaign picker + real lead creation)
  - new `docs/qa/velocity-qa-100-contacts.csv`
