# Dodo Launch Manifest (USD, canonical public catalogue)

Internal reference for the live Dodo hookup. Product IDs are NEVER committed —
they live only in the `DODO_PRODUCT_MAP` server secret. This manifest is
asserted by `src/test/dodo-activation-bridge.test.ts`; if the public USD
catalogue (`src/lib/currency.ts`) or fulfilment credits
(`supabase/functions/_shared/dodo.ts`) drift, tests fail.

## The six live products to create in the Dodo dashboard (USD)

| Internal key (`DODO_PRODUCT_MAP`) | Product | USD price | Billing | Fulfils |
|---|---|---|---|---|
| `vv_starter_oneoff` | Velocity Vision — Starter | $189 | one-off | Starter plan + 25 Campaign Credits |
| `vv_growth_monthly` | Velocity Vision — Growth | $315 | monthly | Growth plan + 80 Campaign Credits per cycle |
| `vv_agency_monthly` | Velocity Vision — Agency | $629 | monthly | Agency plan + 250 pooled Campaign Credits per cycle |
| `vv_topup_small` | 25 Campaign Credits | $59 | one-off | +25 credits |
| `vv_topup_medium` | 75 Campaign Credits | $149 | one-off | +75 credits |
| `vv_topup_large` | 200 Campaign Credits | $349 | one-off | +200 credits |

Human Review (`vv_human_review_oneoff`) is cancelled as a product: it is not
part of the live Dodo catalogue, readiness contract or any purchase CTA.
Historical `human_reviews` data and legacy Stripe compatibility remain intact.

## Webhook endpoint to register

`https://fdubhpzthtfzrzkjkalw.supabase.co/functions/v1/dodo-webhook`

Events to enable (exactly these ten):
`payment.succeeded`, `payment.failed`, `subscription.active`,
`subscription.updated`, `subscription.on_hold`, `subscription.renewed`,
`subscription.plan_changed`, `subscription.cancelled`, `subscription.failed`,
`subscription.expired`

## Server secrets (Project Settings → Secrets)

- `DODO_API_KEY` — live API key from the Dodo dashboard
- `DODO_WEBHOOK_SECRET` — signing secret shown when the webhook is created
- `DODO_ENVIRONMENT` — `live_mode` only when going live (absent = test_mode)
- `DODO_PRODUCT_MAP` — JSON: the six internal keys above → Dodo product IDs

No `VITE_` variants may ever exist; the browser only ever sees booleans.

## Launch semantics (enforced in code + tests)

- Readiness `ready` is true ONLY when live_mode + API key + ALL SIX products
  mapped. Per-product booleans remain safe to display.
- Fulfilment happens ONLY from verified Standard-Webhook signatures
  (300 s tolerance), never from `?checkout=success` return copy.
- Credit grants are deduped twice: event-level (`payment_webhook_events`) and
  financial (`credit_ledger.dedupe_key`, unique payment ids).
- Credits grant on `subscription.active` / `subscription.renewed` only —
  never on `updated` / `plan_changed`.
