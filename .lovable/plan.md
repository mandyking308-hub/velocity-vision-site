## Sprint 2 — Reshape the Logged-In Product Into a Self-Serve Campaign Launchpad

The goal is to turn the existing `/portal` + `/crm` surfaces into a guided, campaign-first product without rebuilding the underlying tables, auth, or agency model. Customers should land on a Launch Dashboard, run a guided builder, and end up in a campaign pack workspace with social / press / video / lead capture / pipeline / reporting all in one place.

### 1. New customer-facing app namespace: `/app`

Customers (role: `client`) and agency users currently land in `/portal`. We'll introduce a new `/app` namespace that becomes the self-serve launchpad. `/portal/*` stays as a thin compatibility layer (redirects to the `/app` equivalents) so we don't break existing sessions.

```text
/app                        Launch Dashboard (new)
/app/campaigns              My campaigns (active + drafts)
/app/campaigns/new          Guided 5-step builder
/app/campaigns/:id          Campaign pack workspace (tabs)
/app/leads                  Mini pipeline (Kanban: New → Contacted → Qualified → Won → Lost)
/app/performance            Cross-campaign performance review
/app/templates              Template gallery + clone
/app/workspaces             Agency client workspace switcher (agency only)
/app/settings               Billing, integrations, profile, email connection
```

### 2. Launch Dashboard (`/app`)

Top band:
- "Welcome back, {first name}"
- Primary CTA: **Start a new campaign** → `/app/campaigns/new`
- Secondary CTA: **Open my latest campaign** → most recent `campaigns` row
- Stat strip: active campaigns, leads captured, follow-ups due, last campaign performance snapshot

Below, six core cards (plus a 7th for agencies):
Start a campaign · My current campaigns · Lead capture & pipeline · Performance review · Templates · Workspace settings · Client workspaces (agency only).

### 3. Guided campaign builder (`/app/campaigns/new`)

Replace the existing one-shot form with a 5-step wizard with a progress bar:
1. **Goal** — leads / sales / sign-ups / bookings / awareness
2. **Business brief** — campaign name, offer, audience, industry, geography, price, tone, key CTA, channels, deadline, notes
3. **Campaign type** — lead gen / launch / promo / nurture / re-engagement / PR push
4. **Output preferences** — checklist of pack components (social, email, landing, PR, video, full bundle)
5. **Review** — summary card → **Generate campaign pack**

Submission writes one row to `campaigns` (existing table) with brief data in a JSON column (`brief jsonb` — add via migration if missing) and a generated `pack jsonb` produced client-side from a deterministic template library (no AI call yet; we wire AI in a follow-up). Each generated section is stored so the workspace can read it back.

### 4. Campaign pack workspace (`/app/campaigns/:id`)

Replace the current `CampaignDetailPage` with a tabbed workspace. Tabs:
Overview · Strategy · Landing Page Copy · Offer Copy · Email Sequence · Social Pack · Press Release · Video Pack · Lead Capture · Pipeline · Performance.

Each tab renders the corresponding slice of `pack jsonb` with copy-to-clipboard, "regenerate this section" stub, and export buttons (markdown / pdf reuse the existing `jspdf` setup).

Required content shapes:
- **Social pack** — launch posts, follow-ups, hook variations, CTA variations, platform variants (LinkedIn / Instagram / X / Facebook / TikTok), short + long captions, visual prompts, launch-week sequence, repost ideas.
- **Press release** — headline, subheadline, opening para, body, quote draft, boilerplate, CTA / contact line.
- **Video pack** — 3 hook options, 30s + 60s scripts, talking-head + B-roll versions, shot list, storyboard outline, on-screen text prompts, caption text, CTA endings. No rendering this sprint.
- **Lead capture** — form title, field preview, CTA label, thank-you message, hosted capture URL placeholder (`/c/:slug`), leads-from-this-campaign list.
- **Pipeline** — campaign-scoped slice of `leads` table.
- **Performance** — leads, response volume, conversion %, best performer note, next-step prompt, "Clone campaign" button.

### 5. Mini pipeline (`/app/leads`)

Kanban with 5 stages (New, Contacted, Qualified, Won, Lost) reading from the existing `leads` table. Each card: name, source campaign, created date, stage, last action, follow-up status. Drag to change stage updates `leads.status`.

### 6. Templates (`/app/templates`)

Static template gallery with six starter types (lead gen, launch, nurture, promo, re-engagement, PR push) plus a "Clone from existing" list pulled from the user's past campaigns. Selecting a template prefills the builder.

### 7. Agency workspace integration

Reuse existing `client_workspaces`. Add a workspace-switcher dropdown in the `/app` shell header for users with more than one workspace; all `/app` reads are scoped by selected `workspace_id` held in context + localStorage. Same flows, just scoped.

### 8. Demo environment

Reshape `/demo/crm` to mirror the new `/app` experience using `DemoContext` (no DB writes). Pre-seed one fully generated example campaign so the demo shows: builder → pack → social → PR → video → lead capture → pipeline → reporting.

### 9. Cleanup / compatibility

- `/portal` routes become thin redirects to `/app` equivalents (Navigate components) — preserves bookmarks and any links in transactional emails.
- Internal CRM (`/crm/*`) is untouched — it stays the staff-side tool.
- Old `CampaignsPage` / `CampaignDetailPage` in `/crm` remain for staff but are no longer the customer's primary surface.

### Technical details

- New folder: `src/pages/app/` for the launchpad pages, `src/components/app/` for builder steps, workspace tabs, pipeline board, template cards.
- New context: `src/contexts/WorkspaceContext.tsx` — selected workspace id, switcher, scoped query helpers.
- New util: `src/lib/campaignPack.ts` — pure-function template generators that take the brief and return the full `pack` object (social, PR, video, etc.). Deterministic, no network. AI hook stub left as `TODO: replace with AI Gateway call`.
- Migration: add `brief jsonb`, `pack jsonb`, `slug text unique` to `campaigns` if absent. Grants kept consistent (`authenticated`, `service_role`). RLS unchanged.
- Update `src/App.tsx` with the new `/app/*` route tree under `ProtectedRoute`, plus `/portal/*` → `/app/*` redirects.
- Update `src/lib/platformManual.ts` with a new chapter "Self-Serve Campaign Launchpad" and add a build-log entry.

### Out of scope this sprint (called out for founder decisions)

- Real AI generation for pack content (currently deterministic templates). Decision: do we wire Lovable AI Gateway next sprint?
- Hosted capture page rendering at `/c/:slug` — placeholder route only.
- Stripe billing / paywalling tiers (Starter / Growth / Agency).
- Email sending for follow-up sequences (drafts only).
- Real analytics ingestion (UTM / pixel) — performance numbers are computed from `leads` for now.

### Deliverables when complete

Launch Dashboard, guided builder, campaign pack workspace with all 11 tabs, full social / PR / video outputs, mini pipeline, templates, agency workspace switcher, refreshed demo, `/portal` redirects, updated ops manual, and a short list of founder decisions before the monetisation sprint.
