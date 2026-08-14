# Dodo Payments audit — 13 August 2026 (read-only, no changes made)

## 1. What the successful transaction actually was

One payment exists in production, and it was **not a plan**:

| Field | Value |
|---|---|
| Product key | `vv_topup_small` (25 Campaign Credits, one-off) |
| Amount | 5241 minor units, GBP (£52.41 incl. tax) |
| Provider / environment | dodo / live |
| Status | paid |
| Webhook | `payment.succeeded`, received 13:41:47 UTC, processed 13:41:49 UTC |
| Credit grant | exactly one +25 ledger row, one `credit_topups` row |

The only other paid record in the system is a **Stripe** Growth Monthly from 2 July 2026 — legacy, not Dodo.

So: no Dodo subscription (Growth or Agency) has ever been created in live mode.

## 2. Live product ID status

All six keys are mapped, but "mapped" only means a string exists in code — nothing in the project has ever verified those strings against Dodo.

| Product key | Live ID present | Proven to exist in Dodo |
|---|---|---|
| `vv_starter_oneoff` | yes | no |
| `vv_growth_monthly` | yes | no |
| `vv_agency_monthly` | yes | no |
| `vv_topup_small` | yes | **yes** (real paid checkout) |
| `vv_topup_medium` | yes | no |
| `vv_topup_large` | yes | no |

The mapping is compiled into `DODO_LIVE_PRODUCT_MAP` in `supabase/functions/_shared/dodo.ts`, with the `DODO_PRODUCT_MAP` secret as an optional override. `DODO_API_KEY`, `DODO_WEBHOOK_SECRET` and `DODO_ENVIRONMENT` are all present as secrets. The `dodo-readiness` endpoint reports `ready` purely from map presence — it makes **no** call to Dodo, so it will report "ready" even for a product ID that does not exist. That is the core blind spot behind the alert.

Additional risk signal: the Growth and Agency IDs were hand-corrected in an earlier pass after transcription errors, so they are the two most likely to be wrong — exactly the two the monitoring alert names.

## 3. Checkout attempts / failures from 13 August

**No evidence is retrievable.** `dodo-create-checkout` returns `provider_error` to the browser and writes the provider's message only to `console.error`; edge logs for that function are already outside the retention window and return nothing. Nothing is persisted: `error_logs` has zero rows since 12 August, and no failed `payment_intents` row is written on a create-checkout failure. The "product does not exist" text cannot be confirmed or refuted from project data — but it is fully consistent with a wrong `pdt_...` ID reaching Dodo's `POST /checkouts`.

## 4. Does the successful payment prove recurring plans work?

**No.** It proves exactly four things: the live API key works, one one-off product ID is correct, hosted checkout is reachable, and the webhook signature/fulfilment path works for `payment.succeeded`. It proves nothing about the other five product IDs, and nothing about the subscription path — Growth/Agency are recurring products whose fulfilment runs through `subscription.active` / `subscription.renewed` handlers that have never fired in live mode.

## 5. Exact fix required

Three items, smallest first.

1. **Verify all six live product IDs against Dodo** (`GET /products/{id}` on `https://live.dodopayments.com` with the live key), founder/admin-gated and read-only. This turns the audit's "unknown" column into fact and names any bad ID.
2. **Correct any invalid ID.** Preferred route is setting the `DODO_PRODUCT_MAP` secret with the correct IDs — it overrides the compiled map with no code deploy — then fold the corrected values into `DODO_LIVE_PRODUCT_MAP` in the same pass so code and secret agree.
3. **Close the two blind spots that let this reach production:**
   - Make readiness honest: have `dodo-readiness` reflect a cached live-existence check per product, not just map presence, so a non-existent product shows as not purchasable rather than "ready".
   - Persist checkout failures: write provider errors from `dodo-create-checkout` into `error_logs` (status + provider message, no keys or PII) so the next failure leaves evidence.

Also worth noting, out of scope until you say otherwise: the live top-up was charged in **GBP** while the canonical catalogue and manifest are USD.

## Proposed next step

Say the word and I will run item 1 as a temporary, founder-gated, read-only probe against the live Dodo API — no purchases, no secret changes, no customer-facing change — and report the exact per-product result. Items 2 and 3 follow from what it finds.
