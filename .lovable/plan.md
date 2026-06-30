# Velocity Vision — Self-Serve Repositioning Sprint

Repositioning the public site from "platform + agency" to a **self-serve campaign launchpad** with optional paid expert review. Existing visual style (navy/coral, Space Grotesk, glassmorphism) is preserved; copy, structure, CTAs and IA change.

## 1. Global rules (applies everywhere)

- **Primary CTAs:** `Start your first campaign` → `/auth` (sign-up), `See pricing` → `/pricing`
- **Secondary CTA:** `Talk to us` → `/contact` (enterprise/agency volume only)
- **Retire** `Book a Demo` as primary. Keep `/book-demo` route reachable but de-emphasised.
- **Language:** self-serve, guided, launch faster, campaign pack, workspace, lead capture, follow-up, reporting, optional expert review. Strip "full-service agency", "founder-led delivery", "bespoke", "contact us for pricing" from primary frames.

## 2. Navigation (`src/components/Navbar.tsx`)

Replace nav links with: Home · How it works · Pricing · For Businesses · For Agencies · Features · Templates · About · Help.
Top-right: `See pricing` (ghost) + `Start your first campaign` (cta).

## 3. Homepage (`src/pages/Index.tsx` + components)

Rebuild section order. Reuse existing components where copy-only swap suffices; replace where structure changes.

1. **Hero** — rewrite `HeroSection.tsx`. Two-column (copy left, dashboard visual right). New H1, subheadline, dual CTAs, microcopy.
2. **Problem/Proof** — new `ProblemProof.tsx`. 3 stats (56% / 27% / 30%) + closing statement + source line.
3. **3 Core Promises** — new `CorePromises.tsx` (Guided not blank-page / Built for revenue / Self-serve with optional review).
4. **What the platform gives you** — rewrite `CampaignCapabilities.tsx` into card grid with 11 items, each describing business value.
5. **How it works preview** — new `HowItWorksPreview.tsx` (5 step cards → link `/how-it-works`).
6. **Platform preview** — repurpose `PlatformPositioning.tsx` into two-column platform visual + bullets.
7. **For Businesses / For Agencies split** — new `AudienceSplit.tsx` (two cards).
8. **Pricing teaser** — new `PricingTeaser.tsx` (4 plan cards → `/pricing`).
9. **Not another agency / tool / founder-dependent** — new `NotAnotherX.tsx` (3 comparison blocks).
10. **FAQ preview** — new `HomeFAQ.tsx` (6 questions, accordion).
11. **Final CTA** — rewrite `FinalCTA.tsx`.

Remove from homepage: `WhatWeDo`, `IndustriesSection`, `AgencySection`, `AgencyPositioning`, `ROICalculator`, `MidPageCTA`, `FeaturedWork`, `InsightsSection` (files stay in repo for other pages but drop from Index).

## 4. Pricing page (`src/pages/Pricing.tsx` — new)

SaaS-style. Hero + 4-card plan grid (Starter £149 one-off, Growth £249/mo, Agency Workspace £499/mo, Premium Human Review £199/review as optional add-on) + pricing FAQ. Add route in `App.tsx`.

## 5. How it works (`src/pages/HowItWorks.tsx` — new)

Hero + 5-step flow + "What you get" list (11 outputs) + optional human help section + CTA. Add route.

## 6. Supporting pages

- **For Businesses** — new `src/pages/ForBusinesses.tsx` + route.
- **For Agencies** — rewrite existing `src/pages/ForAgencies.tsx` copy + CTAs.
- **Features** — new `src/pages/Features.tsx` + route (grouped feature blocks).
- **Templates** — new `src/pages/Templates.tsx` + route (5 campaign template cards).
- **Help** — new `src/pages/Help.tsx` + route (KB-style sections).
- **About** — rewrite `src/pages/About.tsx` to product-architect framing, less founder-heavy.

## 7. Routing & SEO

- Add routes in `src/App.tsx`: `/pricing`, `/how-it-works`, `/for-businesses`, `/features`, `/templates`, `/help`.
- `<SEO>` on every new/changed page with self-serve positioning titles/descriptions.
- Update `public/sitemap.xml` with new URLs.

## 8. Out of scope this sprint

- Stripe wiring (pricing CTAs route to `/auth` sign-up for now; payment flow is a later sprint).
- CRM/Portal/legal pages.
- Templates page renders static example cards only — no live template engine.
- Help page is static markdown-style content — no search.

## Founder decisions still needed (will flag in final report, not block build)

- Confirm price points (£149 / £249 / £499 / £199) — placeholders used as instructed.
- Confirm `Start your first campaign` routes to `/auth` until checkout exists.
- Whether to physically delete the now-unused homepage sections or leave dormant for reuse (plan: leave dormant).

## Files touched (summary)

```text
modify  src/components/Navbar.tsx
modify  src/components/HeroSection.tsx
modify  src/components/FinalCTA.tsx
modify  src/components/PlatformPositioning.tsx
modify  src/components/CampaignCapabilities.tsx
modify  src/pages/Index.tsx
modify  src/pages/About.tsx
modify  src/pages/ForAgencies.tsx
modify  src/App.tsx
modify  public/sitemap.xml
new     src/components/ProblemProof.tsx
new     src/components/CorePromises.tsx
new     src/components/HowItWorksPreview.tsx
new     src/components/AudienceSplit.tsx
new     src/components/PricingTeaser.tsx
new     src/components/NotAnotherX.tsx
new     src/components/HomeFAQ.tsx
new     src/pages/Pricing.tsx
new     src/pages/HowItWorks.tsx
new     src/pages/ForBusinesses.tsx
new     src/pages/Features.tsx
new     src/pages/Templates.tsx
new     src/pages/Help.tsx
```

Approve and I'll build it in one sprint.
