# Velocity Vision — Launch-Gap Analysis & Dodo Cutover Plan

Audit performed against the current working tree, the live database/functions, and the live site at https://velocity-outreach.com (HTTP 200, bundle `index-DfSI8jgO.js`).

## Headline finding

The billing engine already exists and is good — but it is **Stripe-shaped end to end**. There is **zero Dodo code in the tree** (no match for "dodo" anywhere). Paid CTAs on `/pricing` and the pricing teaser currently route to `/contact` ("Request Starter/Growth/Agency onboarding"), so the site is safely in manual-onboarding mode today.

What already works and is reusable for Dodo with no schema change:

| Capability | Status | Where |
|---|---|---|
| Checkout initiation | Exists (Stripe only) | `supabase/functions/create-checkout/index.ts` |
| Webhook + idempotency | Exists and is genuinely solid | `supabase/functions/payments-webhook/index.ts` — dedupe keys `session:`, `sub_initial:`, `invoice:`; unique `stripe_session_id`; unique `credit_ledger.dedupe_key` |
| Payment/subscription status | Exists | tables `payment_intents`, `stripe_subscriptions`, `user_plans`, `credit_topups`, `human_reviews` (all confirmed present) |
| Entitlements / credits | Exists | `src/contexts/CreditsContext.tsx`, `src/lib/credits.ts`, RPCs `reserve_campaign_credits`, `finalise_campaign_credits`, `refund_campaign_credits` |
| Failed payment handling | Exists | `handleInvoicePaymentFailed` → `status='past_due'` |
| Cancellation | Partial | `handleSubscriptionDeleted` exists; customer-facing cancel is via Stripe portal only |
| Customer billing management | Stripe-only | `create-billing-portal-session` + `AppBilling.tsx` |
| Success/cancel pages | Partial | `/app/billing?checkout=…` handler in `AppBilling.tsx`; **no dedicated cancel route** |
| Onboarding / first run | Exists | `SetupWizard.tsx`, `OnboardingChecklist.tsx`, free-preview provisioning |
| Email sending | Live and verified | platform sender + queue worker, cron returning 200 |
| Support escalation | Exists | `support-chat`, `support-notify`, `/contact` |
| Analytics / error monitoring | **Missing** | no Sentry/PostHog/GA anywhere in `src/` or `index.html` |

## 1. P0 — safe work to do NOW (before Dodo approval)

These do not touch live money, secrets, or positioning.

1. **Provider-agnostic payment adapter.** New `supabase/functions/_shared/payments.ts` exporting `PRODUCT_CATALOG` (moved verbatim from `_shared/stripe.ts` `PRICE_CATALOG`, keyed by the same `vv_*` ids) plus `type PaymentProvider = 'stripe' | 'dodo'`. Do not delete the Stripe path.
2. **Dodo checkout function skeleton.** New `supabase/functions/dodo-create-checkout/index.ts`: auth via `Authorization` bearer → `supabase.auth.getUser`, validate `priceId` against `PRODUCT_CATALOG`, reuse the existing `sanitiseReturnPath` / `buildReturnUrl` allow-list logic from `create-checkout/index.ts`, then POST to the Dodo checkout API. It reads `DODO_API_KEY` and `DODO_ENV` from env and returns `{ error: 'payments_not_configured' }` when unset — so it is deployable today and inert until credentials land.
3. **Dodo webhook skeleton.** New `supabase/functions/dodo-webhook/index.ts` mirroring `payments-webhook`'s structure: signature verification helper (`verifyDodoWebhook`, standardwebhooks HMAC over `webhook-id.webhook-timestamp.body`, 5-min tolerance), then the *same* idempotent handlers writing to the *same* tables. Reuse `grantCreditsOnce` and `ensurePlan` by extracting them into `_shared/payments.ts`. Store Dodo ids in the existing columns (`stripe_session_id` ← Dodo payment id, `stripe_subscription_id` ← Dodo subscription id) and set `environment` accordingly — a `provider` column is optional and can be added later without blocking.
4. **Cancel/failure route.** Add `/app/billing?checkout=cancelled` handling in `src/pages/app/AppBilling.tsx` (currently every `?checkout=` value shows a success toast — a cancelled return would wrongly say "payment received"). This is a real defect today.
5. **Failed-payment banner.** In `AppBilling.tsx` and `src/components/app/UpgradeNudge.tsx`, surface `stripe_subscriptions.status === 'past_due'` as a dunning notice instead of silent degradation.
6. **Error monitoring.** Add a lightweight client error reporter (window `error` + `unhandledrejection` → existing `support-notify` function or a new `client-error` log table). No third-party SDK, no cookie/consent impact. This is the largest genuine observability gap for launch day.
7. **Fix the 4 mutable-search_path functions** (see section 4).
8. **Keep pricing CTAs exactly as they are** until approval — no edits to `Pricing.tsx` / `PricingTeaser.tsx` in this phase.

## 2. P0 — cutover steps that require written Dodo approval + credentials

Nothing here can be started without Mandy's inputs.

1. Store secrets: `DODO_API_KEY` (live), `DODO_WEBHOOK_SECRET`, `DODO_ENV=live` in Project Settings → Secrets.
2. Map Dodo product/price ids to the `vv_*` catalog keys in `_shared/payments.ts`.
3. Register the webhook endpoint in the Dodo dashboard pointing at the deployed `dodo-webhook` URL; subscribe to payment succeeded/failed, subscription active/renewed/cancelled/on-hold.
4. Flip a single feature flag (`VITE_PAYMENTS_PROVIDER=dodo`) consumed by `src/lib/stripe.ts` → renamed usage in `src/hooks/useStripeCheckout.tsx`, so paid CTAs on `/pricing`, `PricingTeaser.tsx`, `TopUpModal.tsx` and `HumanReviewButton.tsx` switch from `/contact` to real checkout.
5. Sandbox end-to-end test in this order: one-off Starter → credits land in `credit_ledger` with `dedupe_key='session:…'`; top-up pack; Growth subscription → `stripe_subscriptions` row + `user_plans.plan='growth'`; replay the same webhook twice to prove no double grant; cancel → status flips.
6. Only after a clean sandbox run, publish and switch live.

## 3. P1 — useful, must not delay launch

- `provider` column on `payment_intents` / `stripe_subscriptions`, and eventual table renames away from the `stripe_` prefix.
- Dodo customer portal / self-serve cancellation inside `/app/billing` (interim: cancellation via `/contact` + support ticket, which is compliant and already live).
- Invoice/receipt surfacing in `AppBilling.tsx` (Dodo emails receipts itself, so this is cosmetic on day one).
- Product analytics (PostHog/Plausible) behind the existing `CookieBanner` consent.
- Mobile polish pass on `/app/billing` and the checkout dialog.

## 4. Is `SUPA_function_search_path_mutable` a launch risk?

**No — not a launch blocker, but worth a 5-minute fix.** The four affected functions are exactly the pgmq email-queue wrappers: `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`. They are `SECURITY DEFINER` without a pinned `search_path`. Exploitation requires an attacker who can already create objects in a schema on the role's search path, which RLS and current grants do not permit. Fix by adding `SET search_path = public, pgmq` to each — a no-behaviour-change migration. The linter also reports Extension-in-Public and several signed-in-executable SECURITY DEFINER warnings; those are pre-existing and deliberate (RPCs the app calls) and should not be churned the day before launch.

## What I need from Mandy

1. Written Dodo approval confirmation (yes/no) and whether the account is live or test-mode only.
2. Dodo **API key** and **webhook signing secret** — added by her in Project Settings → Secrets, never pasted in chat.
3. The **Dodo product ids** for: Starter one-off, Growth monthly, Agency monthly, three top-up packs, Human Review — mapped to our `vv_starter_oneoff`, `vv_growth_monthly`, `vv_agency_monthly`, `vv_topup_small/medium/large`, `vv_human_review_oneoff`.
4. Confirmation of the **billing currency** Dodo will settle in (our catalog carries USD/GBP/EUR variants).
5. Decision: launch subscriptions on day one, or **one-off Starter + top-ups only** on day one and add recurring next week (lower risk, and my recommendation).

## Explicitly preserved

No changes proposed to: compliant self-serve SaaS positioning, anti-spam/anti-scraping copy, pricing values, legal pages, existing routes, the contact form, the email architecture, or any production data. The Stripe code path stays in place and unused rather than being deleted.
