# Launch-night conversion sprint — Velocity Vision

Objective: maximise the chance of the first legitimate paying customer immediately after Dodo goes live. Five changes only. No price changes, no new features, no invented proof, no dark patterns. All existing legal, anti-spam and compliance content is preserved.

## What the audit found (verified in current source)

- The homepage hero (`src/components/HeroSection.tsx`) leads with a long compliance-heavy sentence. It states what the product *is* but not who it is for, the outcome, or time-to-value. Two disclaimer paragraphs sit above the CTA.
- The primary CTA is consistent (`Start Free Preview` / `Start your workspace` → `/auth`) on desktop and mobile (`src/components/Navbar.tsx` renders the same two buttons in the mobile menu).
- A working product preview already exists at `/demo` (`src/pages/DemoLogin.tsx` → `/demo/crm`, `/demo/data-vault`), but it is **not linked from the hero or the navbar**. It is only reachable from `MidPageCTA` and `ROICalculator` far down the page. Prospects cannot see the product before paying unless they scroll.
- Pricing (`src/pages/Pricing.tsx`) shows three equal cards. Growth has `highlight: true` but the badge only reads "Recurring plan" — no default/best-fit recommendation. Every plan CTA routes to `/contact` (correct while Stripe is parked).
- Trust content is strong and already present: footer carries Terms, Privacy, Acceptable Use & Anti-Spam, Refund & Cancellation, Security, Cookies, Subprocessors; pricing FAQ covers cancellation; entity disclosure is in place.
- High-intent capture exists at `/contact` with a topic selector, but there is no "Starter/Growth/Agency onboarding" prefill, so plan intent is lost between pricing and the form.
- No abandoned-signup capture exists. That is out of scope tonight.

## The five changes

### P0-1 — Hero: lead with audience, outcome and time-to-value
File: `src/components/HeroSection.tsx`
Rewrite the eyebrow, H1 and first paragraph so the first screen answers who it is for, what they get and how fast. Move the two disclaimer paragraphs to a single condensed line below the CTAs (keeping every substantive claim: no scraping, no list sales, no automatic sending, customer approves activation). No claim is removed or weakened.
Expected effect: reduces first-screen bounce; the strongest single lever on a cold homepage.

### P0-2 — Surface the existing demo as a secondary hero CTA
Files: `src/components/HeroSection.tsx`, `src/components/Navbar.tsx`
Add "See the product (no signup)" → `/demo` as the third hero action, and add a `Demo` link to the desktop and mobile nav. This ships an already-built, compliant, read-only preview — no new product surface.
Expected effect: lets a prospect evaluate before paying, the biggest gap in the current funnel.

### P0-3 — Pricing: name a default plan and remove choice paralysis
File: `src/pages/Pricing.tsx`
Change the Growth card badge from "Recurring plan" to "Recommended for most teams", add a one-line "Not sure? Start with Growth — Starter is a one-off trial run, Agency is for multi-client work" above the grid. No price, currency, tax, SKU or refund copy changes.
Expected effect: fewer stalled decisions at the highest-intent page.

### P0-4 — Carry plan intent into the contact form
Files: `src/pages/Pricing.tsx`, `src/components/PricingTeaser.tsx`, `src/pages/Contact.tsx`
Plan CTAs link to `/contact?plan=growth` (etc.). Contact reads the param, preselects the topic and prefills the message with "I'd like onboarding for the Growth plan." Purely presentational; no changes to submission, validation or the `lead-submit` path.
Expected effect: reduces friction on the only conversion path currently live, and tells you which plan each enquiry wants.

### P1-5 — Founder-led launch benefit, stated factually
Files: `src/pages/Pricing.tsx`, `src/components/FinalCTA.tsx`
Add one honest line: complimentary founder-led onboarding and a first-campaign review for early customers, with a stated support response expectation you can actually meet. No countdown, no seat counter, no scarcity language, no testimonials, no results claims.
Expected effect: raises perceived value of the first purchase without any unverifiable claim.

## Publish tonight vs. blocked

- P0-1 through P0-4 and P1-5 are copy/UI only. Safe to build, test and publish tonight; none touch billing, auth, edge functions, RLS or the Stripe/Dodo paths.
- Blocked on Dodo credentials and real payment testing: switching pricing CTAs from `/contact` to live checkout, and any end-to-end purchase verification. Not attempted in this sprint.

## Explicitly not doing

Abandoned-signup/checkout recovery, exit-intent capture, testimonial or logo sections, redesign, signup-field reduction (signup already asks only name/email/password), and any change to legal, refund, anti-spam or activation-governance content.

## Verification before publish

Production build, full test suite, and a Playwright pass over `/`, `/pricing`, `/contact`, `/demo` at 390px and 1280px checking CTA visibility, link integrity and no console errors.
