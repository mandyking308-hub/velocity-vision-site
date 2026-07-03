# Free Preview / Points Model + Guided Setup Wizard

This is a large, multi-layer change (DB, edge functions, credit engine, UI, wizard, training pages, Liftor, QA safety). Presenting the plan first so we can execute it in a controlled order without breaking existing paid customers.

## 1. Database migrations

Single migration adds:

- `free_preview` value to whatever enum/text column drives `user_plans.plan` (currently free-form text — confirm and add CHECK or leave permissive).
- `credit_ledger.reason` new values used implicitly (no enum change needed — column is text): `free_welcome_grant`, `free_daily_grant`, `free_preview_spend`, `stripe_topup`.
- New table `public.free_preview_accounts` (one row per user) tracking: `user_id PK`, `granted_welcome_at`, `last_daily_grant_at`, `preview_started_at`, `preview_expires_at` (start + 14d), `contact_limit`, `campaign_pack_limit`, `signup_email_hash`, `signup_ip_hash`. Grants for anon read denied; authenticated read own; service_role all.
- Function `public.grant_free_preview_welcome()` (SECURITY DEFINER) — idempotent: if row exists, no-op; otherwise inserts free_preview_accounts row, ledger row `free_welcome_grant` +10, and upgrades `user_plans` to `free_preview` if user has no plan.
- Function `public.grant_free_daily_credits()` (SECURITY DEFINER, cron-safe) — for each free_preview user whose `preview_expires_at > now()` and `last_daily_grant_at < today`, compute current free-credit balance (sum of `free_welcome_grant` + `free_daily_grant` minus `free_preview_spend`), grant `min(2, 10 - balance)` as `free_daily_grant`, update `last_daily_grant_at`. Cap enforced by clamp.
- Update `provision_first_workspace`: free_preview treated like starter (1-workspace limit already applies).
- Existing `reserve_campaign_credits` continues to work — it treats all positive ledger entries as balance. We add: if plan is `free_preview` AND `preview_expires_at < now()`, raise `free_preview_expired` (mirroring `starter_expired`). Spend reason for free users becomes `free_preview_spend` (frontend maps).
- Schedule daily grant via pg_cron once, calling `grant_free_daily_credits()` at 06:00 UTC.

## 2. Credit engine (frontend)

`src/lib/credits.ts`:

- Add `PlanId = "free_preview" | "starter" | "growth" | "agency"`.
- Add PLANS.free_preview config (£0, 10 welcome + 2/day capped 10, 14-day, 1 workspace, 25 contacts, 1 pack).
- Expose `FREE_LIMITS = { contacts: 25, campaignPacks: 1, dailyCap: 10 }`.

`src/contexts/CreditsContext.tsx`:

- Recognise `free_welcome_grant` / `free_daily_grant` as positive balance; `free_preview_spend` as usage.
- Add `isFreePreview`, `freeExpired`, `freeDaysLeft`, `contactsUsed`, `packsUsed` (queried from `contacts` / `campaigns` count-scoped to user's workspace).
- `consume()` picks reason `free_preview_spend` when plan is free_preview, otherwise unchanged.
- On first load after signup, call new RPC `grant_free_preview_welcome`.

## 3. Free user gates (UI)

Enforce via `useCredits().isFreePreview`:

- `AppDataVault*Upload/Import`: block above 25 contacts, show upgrade CTA.
- `AppCampaigns / AppCampaignNew`: block second full campaign pack.
- `AppActivation` and `EmailSequenceSender`: hard-block "send now" — show "Live sending is available on Growth. Upgrade or buy top-up credits to prepare and preview." (top-up alone does NOT unlock sending.)
- `AppEmailConnections`: disable Nylas OAuth start button for free users with tooltip.
- Preview/watermarked exports: `campaignPackExport.ts` — for free users, append "FREE PREVIEW — VELOCITY VISION" watermark to PDF/DOCX header and cap CSV rows.

## 4. Top-ups for free users

Already work through existing `create-checkout` → webhook path. Two changes:

- `payments-webhook`: for top-up purchases by free_preview users, insert ledger with reason `stripe_topup` (was `topup`) and `meta.customer_tier = "free_topup"`. Do NOT change plan.
- `TopUpModal`: enable for free users (currently already available via `AppBilling`).

## 5. Pricing page copy

`src/pages/Pricing.tsx` + `src/components/PricingTeaser.tsx`:

- Add Free Preview card as first tile (£0, "Start free").
- Update headline, add FAQ items (Is it really free? What happens when credits run out? Can I buy credits without subscribing? Can I send on Free Preview? Do free credits expire? Are AI outputs drafts?).
- Explicit "No surprise bills. No auto-upgrade. Sending stays under your control."

## 6. Guided Setup Wizard

New `src/components/app/SetupWizard.tsx` — dialog that appears on first `/app` visit until localStorage `vv_setup_wizard_done` is set or user clicks "Skip".

10 steps as specified; each step links to the relevant existing page (workspace manager, data vault upload, campaign new, etc.) and marks itself complete when the underlying data condition is met (e.g. contacts > 0).

Mount in `AppLayout` alongside `OnboardingChecklist` (don't replace it).

## 7. Training centre

New pages under `/help/`:

- `/help/getting-started` (index)
- `/help/credits`, `/help/first-campaign`, `/help/upload-data`, `/help/review-ai`, `/help/why-sending-is-gated`, `/help/upgrade`.

Add "Training" link in `PortalSidebar` / app nav. Add explainer cards near the wizard.

## 8. Stripe QA safety

- New `src/components/app/PaymentEnvBadge.tsx`: reads `getStripeEnvironment()`; if `live` AND current user has `admin` role, shows red banner "LIVE MODE — do not self-pay for QA. Use sandbox."
- Mount at top of `AppBilling`, `TopUpModal` header, and CRM `BillingPage`.
- No key changes.

## 9. Liftor metrics

`supabase/functions/liftor-status/index.ts` — add these external+free buckets alongside existing ones:

- `free_users_total`, `free_preview_workspaces_total`, `free_preview_campaigns_created`, `free_preview_credits_granted`, `free_preview_credits_used`
- `external_paid_topup_customers_total`, `external_topup_revenue_by_currency`
- `external_growth_customers_total`, `external_agency_customers_total`

Free users NOT counted in `external_*`. Legacy fields preserved.

## 10. Legal

- `AuthPage` signup already requires legal acceptance — keep unchanged; extend the recorded acceptance to include Free Preview scope.
- Add FAQ block on Pricing (above).

## 11. QA/data hygiene

- Prevent duplicate free previews: `grant_free_preview_welcome` short-circuits if row exists for user_id. Best-effort email/IP hashing recorded but not enforced (would need auth trigger; noted in follow-ups).

## Execution order

1. DB migration (plan + functions + table + cron).
2. Edge function updates (`payments-webhook`, `liftor-status`).
3. Frontend: credits lib + context + gates.
4. Pricing page + Free Preview card + FAQ.
5. Wizard component + mount.
6. Training pages + nav link.
7. Payment env badge.
8. Typecheck / smoke test.
9. Report.

## Files (est. 25-30)

Migration; `payments-webhook/index.ts`; `liftor-status/index.ts`; `src/lib/credits.ts`; `src/contexts/CreditsContext.tsx`; `src/lib/campaignPackExport.ts`; `src/components/PricingTeaser.tsx`; `src/pages/Pricing.tsx`; `src/pages/AuthPage.tsx` (welcome grant call); `src/pages/app/AppLayout.tsx`; `src/components/app/SetupWizard.tsx`; `src/components/app/PaymentEnvBadge.tsx`; `src/pages/app/AppBilling.tsx`; `src/components/app/TopUpModal.tsx`; `src/pages/app/AppDataVaultUpload.tsx`; `src/pages/app/AppDataVaultImport.tsx`; `src/pages/app/AppCampaigns.tsx`; `src/pages/app/AppCampaignNew.tsx`; `src/pages/app/AppActivation.tsx`; `src/components/app/EmailSequenceSender.tsx`; `src/pages/app/AppEmailConnections.tsx`; `src/pages/Help.tsx` + new getting-started pages; `src/App.tsx` route additions; `src/components/portal/PortalSidebar.tsx` (or app sidebar); `src/pages/crm/BillingPage.tsx`.

## Confirm before I build

Because this is broad, I want to confirm two things:

1. **Keep Starter as-is (£149 one-off)** or reposition it as "Launch Pack"? I'll keep as-is unless told otherwise.
2. **Watermarked exports for free users** — accept a simple text header watermark on PDF/DOCX + CSV row cap of 25? Or leave exports fully blocked instead?

Approving this plan means I proceed with the whole scope (migration + wizard + training + Liftor). Reply "go" to execute, or edit any step.
