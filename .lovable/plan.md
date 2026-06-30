## Sprint A — i18n framework + EN/ES (public site + /app shell)

### Dependencies
- `bun add i18next react-i18next i18next-browser-languagedetector`

### Database
Single migration adds:
- `profiles.preferred_language` text default `'en'`
- `profiles.timezone` text (IANA, nullable; UI default from browser)
- `client_workspaces.default_language` text default `'en'`
- `campaigns.output_language` text default `'en'`
- `campaign_assets.language` text default `'en'`

No RLS changes (columns inherit existing policies).

### i18n scaffold
- `src/i18n/index.ts` — initializes i18next with `en` + `es` resources, browser detector, localStorage persistence under key `vv_lang`, fallback `en`.
- `src/i18n/locales/en/{common,marketing,app,auth,billing}.json`
- `src/i18n/locales/es/{common,marketing,app,auth,billing}.json`
- Init imported in `src/main.tsx` before `<App/>` mounts.
- `src/lib/format.ts` — `formatCurrency`, `formatDate`, `formatNumber`, `formatRelativeTime` driven by current `i18n.language` + user timezone.

### Language sync
- `src/hooks/useLanguageSync.ts` — on auth load, reads `profiles.preferred_language`, calls `i18n.changeLanguage`. On manual change, writes back to profile.
- `src/components/LanguageSwitcher.tsx` — EN / ES dropdown, used in:
  - public `Navbar.tsx`
  - `AppLayout.tsx` (top bar)

### Translated surfaces (this sprint)
- Public: `Navbar`, `Footer`, `HeroSection`, `MidPageCTA`, `PricingTeaser`, `FinalCTA`, `HomeFAQ` (keys only, EN+ES copy).
- App shell: `AppLayout` sidebar items, dashboard section titles, empty-state CTAs in `AppDashboard`.
- Auth: `AuthPage` labels/buttons.
- Billing shell: page title, plan card labels in `AppBilling`.
- Deep CRM/founder pages remain English (out of scope per decision).

Hard-coded English strings inside the targeted files get replaced with `t('namespace.key')` — other files keep current strings to limit blast radius.

---

## Sprint B — International payments (GBP/USD/EUR)

### Stripe prices (via `payments--batch_create_product`)
Add GBP + EUR prices to existing products. Price IDs follow `<existing>_gbp` / `<existing>_eur` naming:
- `vv_starter_oneoff_gbp`, `_eur`
- `vv_growth_monthly_gbp`, `_eur`
- `vv_agency_monthly_gbp`, `_eur`
- `vv_human_review_oneoff_gbp`, `_eur`
- `vv_topup_small_gbp/_eur`, `vv_topup_medium_gbp/_eur`, `vv_topup_large_gbp/_eur`

Amounts mirror current USD with rounded local conversions (GBP ~0.80x, EUR ~0.95x of GBP base — I'll confirm exact numbers from the Pricing page before creating).

### Currency model
- `src/lib/currency.ts`:
  - `SUPPORTED = ['GBP','USD','EUR']`
  - `resolveCurrency({ explicit, billingCountry, locale })` — order: explicit selection → billing country (GB→GBP, EU set→EUR, fallback USD) → browser locale → USD.
  - `priceIdFor(baseId, currency)` — appends `_gbp`/`_eur`, returns base for USD.
- Persisted user choice in `localStorage` key `vv_currency`, mirrored to `profiles.preferred_currency` (added in Sprint B migration).

### Migration B
- `profiles.preferred_currency` text default `'USD'`
- `profiles.billing_country` text nullable
- `user_plans.currency` text default `'USD'` (so billing UI can show what was charged)

### Checkout integration
- `useStripeCheckout` accepts an optional `currency`; resolves the localized priceId via `priceIdFor` before invoking `create-checkout`.
- `TopUpModal` + `Pricing.tsx` + `PricingTeaser.tsx` read selected currency and render localized amounts using `formatCurrency`.
- Add `CurrencySelector` component next to `LanguageSwitcher` in public Navbar and `AppBilling`.

### Tax / compliance
Already `managed_payments: { enabled: true }` on checkout sessions — keeps end-to-end compliance handling. No code change needed; verify in `create-checkout/index.ts`.

### Billing UX
- `AppBilling` shows: charged currency, billing country (from `user_plans.currency` and `profiles.billing_country`), tax line where webhook provides it.
- Webhook (`payments-webhook`) updates `user_plans.currency` from the session's `currency` field on plan provisioning (small additive change).

---

## Out of scope (explicit)
- Translating CRM/founder dashboards, demo data text, legal docs.
- Multilingual AI generation (campaigns store `output_language` but generators stay EN).
- Currencies beyond GBP/USD/EUR.
- Auto-geolocation via IP (browser locale + manual override only).

## Final QA
After both sprints, the previously-queued connected QA prompt must be re-run — I'll flag this in the closing message, not execute it here.

## Risk notes
- Stripe price creation is irreversible (prices are immutable). I'll double-check amounts against current `Pricing.tsx` before calling `batch_create_product`.
- i18n key replacement is wide; I'll keep edits surgical to the listed files to avoid regressions in untranslated areas.
- Two DB migrations (one per sprint) so each can be reviewed independently.
