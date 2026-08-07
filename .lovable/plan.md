# Pre-Dodo truth corrections

Audit-derived corrections only. No new features, no price changes, no Dodo/Stripe logic changes.

## P0 — must fix before enabling Dodo

1. **Free Preview cannot send — enforce server-side.** `supabase/functions/email-send/index.ts:47,234-235`: `WARMUP_DAILY_CAP` has no `free_preview` entry, so a free-preview account with an existing enabled connection falls back to 20/day. Add an explicit `free_preview: 0` and reject before the cap check.
2. **Reconcile the two daily-cap sources.** UI shows 80/250/1000 (`src/lib/sendSafety.ts:8-13`); the server enforces 20/50/100 (`email-send/index.ts:47`). Pick one truth and make the UI display the enforced value, so no customer sees a number the system will refuse.
3. **Remove the unimplemented "Preview / watermarked exports" bullet** (`src/lib/credits.ts:48`) — no watermark code exists.
4. **Free Preview "1 full campaign pack"**: either enforce it in `AppCampaignNew.tsx:251` (`blocked` currently ignores `existingPackCount`) or reword the public/in-app claim to "1 pack included in your welcome credits".
5. **Confirm top-up pricing is final.** `src/lib/credits.ts:138` marks 25/£49, 75/£119, 200/£279 as placeholders, but `TopUpModal.tsx` sells them live.

## P1 — tier-accuracy corrections

6. **`Pricing.tsx:73,75`** — "Recurring cadence (weekly/monthly)" and "Reusable templates & segments" are listed as Growth-only but are not gated anywhere. Either gate them or move to shared-across-tiers language.
7. **`Pricing.tsx:91`** — "Pooled sending governance across client workspaces": `agency_pooled_sends_today()` is advisory and never blocks a send. Reword to "pooled send visibility" unless enforcement is added.
8. **`PricingTeaser.tsx`** — add the same credit counts as `/pricing` (25 / 80 / 250) so homepage and pricing agree.
9. **`AppBilling.tsx:78`** — replace the user-visible "No Stripe billing profile yet." toast with provider-neutral wording.

## P2 — publicly explain what already ships

None of these appear on `/features`, `/how-it-works`, `CampaignCapabilities` or `/help/getting-started` today:
First-Campaign Copilot, Launchpad, Preflight scorecard, Reply Intent Command Centre, deterministic compliance precedence, referral extraction, out-of-office return dates, 24h hot-reply SLA, meeting handoff and booking link, Outcome Funnel.

Add a single factual capability section covering these, using existing design tokens and existing disclaimer style. State meeting booking as *recorded*, not calendar-synced, and never claim A/B testing (deliberately deferred, `src/lib/outcomeFunnel.ts:6-10`).

## P3 — demo completeness

Add the Outcome Funnel panel to the `/demo/crm` reporting tab; it is the only major new capability the no-signup demo does not show. Referral, OOO date, 24h waiting reply, meeting booked, Launchpad and Preflight are already demonstrated.

## Deliberately out of scope

Prices, Dodo/Stripe checkout logic, legal pages, secrets, credit costs, and the client-side credit ledger integrity issue (`CreditsContext.consume` is bypassable) — the latter is a revenue-integrity item to schedule separately, not a launch blocker for the public site.
