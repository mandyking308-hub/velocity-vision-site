# Optional pre-submission polish (Dodo merchant application)

The read-only audit found no blockers. These are the only two optional improvements. Approve if you want them applied; otherwise submit as-is.

## 1. Name Dodo Payments explicitly on /pricing
Current copy says the "payment provider" is confirmed before purchase but never names one, so a reviewer sees prices with no checkout and no provider attribution.

Change: add one sentence under the pricing billing/delivery block, e.g. "Card checkout is being enabled through our payment provider. Until it is live, paid plans are activated manually after an onboarding request." Same sentence in the Legal Centre billing summary.

## 2. Currency display consistency on /pricing
The currency chips list GBP first while plan prices render in USD, which reads as a mismatch on first load.

Change: make the active currency chip visually unambiguous (selected state) so the displayed currency always matches the highlighted chip.

## Files
- `src/pages/Pricing.tsx` (copy + chip active state)
- `src/pages/legal/LegalCentre.tsx` (billing summary sentence)

No backend, pricing values, legal text, routing or email behaviour changes.
