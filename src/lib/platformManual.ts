export interface ManualChapter {
  id: string;
  title: string;
  sections: ManualSection[];
}

export interface ManualSection {
  title: string;
  content: string;
}

/**
 * Founder-facing operating manual.
 *
 * Keep this document deliberately focused on the current product truth and
 * route model. Detailed implementation remains authoritative in source code,
 * database policies and deployed Edge Functions; this manual must never be
 * used to invent capabilities that are not implemented.
 */
export const platformManual: ManualChapter[] = [
  {
    id: "overview",
    title: "Platform Overview",
    sections: [
      {
        title: "Product identity",
        content: `Velocity Vision is a self-serve B2B commercial workspace operated by Global Solutions Management LLC (Delaware, USA). Customers provide their own lawfully obtained business data, prepare editable AI-assisted drafts, verify their own sender, review preflight controls, approve activation themselves, manage replies and follow-up, and track early pipeline and outcomes.\n\nVelocity Vision is software, not a full-service agency. It does not scrape contacts, sell lists, run managed campaigns, send automatically, or guarantee compliance, deliverability, replies, pipeline, sales or revenue.`,
      },
      {
        title: "Core operating principles",
        content: `**Customer control is the default.** AI outputs are drafts. Sending and activation require customer-controlled gates.\n\n**Truth before marketing.** Public copy must match actual enforcement. Unsupported features such as seat management, white-label portals, calendar sync, A/B testing or autonomous sending must not be advertised.\n\n**Fail closed.** Free Preview cannot live-send. Unknown plans do not gain sending permission. Dodo direct-purchase CTAs remain unavailable unless the corresponding live product is confirmed ready.\n\n**No fabricated proof.** Demo/sample records are illustrative. The public Work page describes configuration examples rather than invented customer case studies or results.`,
      },
      {
        title: "Main product areas",
        content: `1. **Public website** — product explanation, pricing, help, demo and legal information.\n2. **Customer app** — Data Vault, campaigns, Copilot, activation, replies, follow-up, pipeline, performance, settings and billing.\n3. **Agency Workspace** — isolated client workspaces, pooled Campaign Credits, account-wide send-usage visibility and cross-client outcome visibility.\n4. **Internal CRM** — protected operational, compliance, support, QA, billing and founder surfaces.\n5. **Hosted capture** — campaign-specific public lead forms at \`/c/:slug\`, kept separate from the indexable marketing site.\n6. **Payment layer** — Dodo is the live-readiness path for new purchases; legacy Stripe portal support remains only where existing Stripe customers require it.`,
      },
    ],
  },
  {
    id: "routes",
    title: "Routes & Access",
    sections: [
      {
        title: "Public routes",
        content: `The active public product routes are:\n\n- \`/\` — Home\n- \`/services\` — Platform capabilities\n- \`/industries\` — Example B2B use cases\n- \`/work\` — Configuration examples, not fabricated case studies\n- \`/insights\` — Editorial content\n- \`/about\` — Product/operator information\n- \`/contact\` — Support, billing, legal and commercial enquiries\n- \`/for-agencies\` — Agency Workspace\n- \`/for-businesses\` — Business workspace\n- \`/pricing\` — Plans, credits, billing and refund information\n- \`/how-it-works\` — Customer-controlled workflow\n- \`/features\` — Implemented product features\n- \`/templates\` — Draft starting points\n- \`/help\` and \`/help/getting-started\` — Product guidance\n- \`/legal\` and \`/legal/:slug\` — Legal Centre/documents\n- \`/demo\`, \`/demo/crm\`, \`/demo/data-vault\` — Illustrative demo\n- \`/auth\` — Sign in/account creation; noindex\n- \`/unsubscribe\` — Email-preference utility; noindex\n- \`/c/:slug\` — Hosted campaign capture; noindex\n\n\`/book-demo\` is a compatibility redirect to \`/demo\`; there is no separate BookDemo page.`,
      },
      {
        title: "Customer app routes",
        content: `Authenticated customer routes live under \`/app\` and are noindex/protected. The active surfaces include the dashboard, Data Vault, upload/import detail, campaigns, campaign creation, Copilot, campaign detail, leads, follow-up, pipeline, activation, performance, templates, settings, email settings, billing and workspaces.\n\nUnauthenticated access redirects to \`/auth\` and must not flash customer data before the redirect.`,
      },
      {
        title: "Internal CRM routes",
        content: `Internal routes live under \`/crm\`. They are protected first by authentication and then by internal roles from \`user_roles\` (founder, admin, sales or marketing as applicable). Active areas include companies, contacts, leads, opportunities, tasks, campaigns, campaign dashboard, founder dashboard, billing, QA, legal/compliance, manual, monetisation, intelligence, support and feedback.\n\nInternal/admin pages must never be exposed through public navigation or the sitemap.`,
      },
      {
        title: "Legacy compatibility",
        content: `Legacy \`/portal\` routes redirect to the current \`/app\` family. \`/portal/legal\` redirects to the public Legal Centre. Redirects must remain loop-free and must not bypass current authentication or role guards.`,
      },
    ],
  },
  {
    id: "product",
    title: "Customer Product Truth",
    sections: [
      {
        title: "Free Preview",
        content: `Free Preview is £0 with no card required. It provides 10 welcome Campaign Credits plus 2 per day with the configured daily balance cap, runs for 14 days, supports one workspace and up to 25 contacts, and permits one full preview campaign pack.\n\n**Critical enforcement:** Free Preview has zero live sends. The server-side sending path fails closed for an ineligible or unknown plan. The one-full-pack rule is enforced before credits are spent.`,
      },
      {
        title: "Paid plans",
        content: `**Starter — £149 one-off**\n- 25 Campaign Credits\n- 30 days workspace access\n- 1 workspace\n- plan daily send ceiling: up to 20/day\n- one-off campaign use; no recurring cadence entitlement\n\n**Growth — £249/month**\n- 80 Campaign Credits/month\n- 1 workspace\n- plan daily send ceiling: up to 50/day\n- recurring cadence and reusable recurring templates enabled\n\n**Agency Workspace — £499/month**\n- 250 pooled Campaign Credits/month\n- unlimited isolated client workspaces\n- plan daily send ceiling: up to 100/day\n- account-wide view of send usage across client workspaces\n- cross-client pipeline/Outcome Funnel visibility from stored records\n\nDo not describe the send ceiling as an independent per-workspace cap engine, seat-management system or pooled sending-governance product.`,
      },
      {
        title: "Campaign workflow",
        content: `The current workflow includes Data Vault review, First-Campaign Copilot, Launchpad, Preflight, governed activation, Reply Intent Command Centre, compliance precedence, referrals, out-of-office return-date handling, 24h+ waiting queues, customer-controlled meeting handoff/manual meeting recording, pipeline and Outcome Funnel.\n\nThese tools organise and assist customer activity. They do not automatically send a reply, guarantee a meeting, or manufacture outcome data.`,
      },
      {
        title: "Agency Workspace",
        content: `Agency Workspace creates isolated client workspaces under an agency account. Real capabilities include pooled Campaign Credits, separate client data, account-wide visibility of send usage, and cross-client pipeline/outcome visibility.\n\nDo not advertise team-member/seat administration, white-label client portals or independently configurable workspace send ceilings unless those capabilities are implemented and verified in a future release.`,
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Payments",
    sections: [
      {
        title: "Dodo readiness model",
        content: `New direct purchases use the Dodo readiness bridge. Public readiness exposes safe booleans only; API keys, webhook secrets, product IDs and customer IDs must never be exposed client-side.\n\nA paid CTA may switch to direct purchase only when the corresponding product is explicitly live-ready. If it is not live-ready, the public site must use a truthful contact/onboarding fallback. Changing secure Dodo settings does not require inventing a public readiness state.`,
      },
      {
        title: "Checkout and fulfilment",
        content: `Browser return from checkout is not fulfilment authority. Paid entitlement/credit fulfilment must come from verified provider webhooks and the existing server-side rules.\n\nHuman Review checkout carries a campaign reference only for the Human Review product; the server validates the UUID and campaign ownership before placing it in provider metadata. Other products must reject a supplied campaign reference.`,
      },
      {
        title: "Legacy Stripe support",
        content: `Stripe code remains for existing Stripe subscribers who need their established billing portal. It is not the public new-purchase positioning. Internal QA and documentation should refer to provider-neutral payment processing unless a test explicitly targets the legacy Stripe path.`,
      },
      {
        title: "Top-ups and Human Review",
        content: `Credit top-ups and Human Review must be described according to runtime readiness. When the relevant Dodo product is live-ready, the signed-in billing flow may offer direct purchase. When it is not, copy must fall back to the published contact route rather than promising instant checkout.`,
      },
    ],
  },
  {
    id: "safety",
    title: "Safety, Compliance & Data",
    sections: [
      {
        title: "Sending safeguards",
        content: `Unsubscribe intent has precedence over sales/reply categories. Bounce handling also prevents unsafe sales treatment, with unsubscribe remaining the stronger precedence where both signals exist. Manual relabelling must not downgrade those safety classifications.\n\nPlan send ceilings and risky-record controls are operational safeguards; they are not legal-compliance or deliverability guarantees.`,
      },
      {
        title: "Customer responsibility",
        content: `Customers remain responsible for authority to use each record, lawful basis, sender identity, content approval, suppression/opt-out handling and every activation decision. Agencies must also have client authority for each client workspace and dataset.`,
      },
      {
        title: "Hosted capture privacy",
        content: `Hosted capture pages use campaign-specific forms at \`/c/:slug\`. They are noindex by default, present an explicit Privacy Policy link beside the contact consent text, validate required fields and lengths, and fail safely for invalid/non-live slugs.`,
      },
    ],
  },
  {
    id: "release",
    title: "Release & QA Procedure",
    sections: [
      {
        title: "Pre-release gate",
        content: `Before publication or payment activation:\n1. Enumerate routes from \`src/App.tsx\`.\n2. Run the full automated test suite.\n3. Run TypeScript typecheck.\n4. Run a production build.\n5. Browser-smoke public pages at desktop, tablet and 390px mobile.\n6. Verify every protected \`/app\` and \`/crm\` route redirects safely when signed out.\n7. Check internal links, redirects, sitemap, robots, llms.txt, public metadata and localisation.\n8. Search for stale/unsupported product claims, old brand names, provider-only wording and exposed secrets.\n9. Cross-check pricing and capability copy against actual enforcement.\n10. Publish only after blockers and high-severity truth defects are resolved.`,
      },
      {
        title: "Source of truth",
        content: `This manual is a founder reference, not an enforcement layer. When a statement here conflicts with current source code, database policies or deployed Edge Functions, stop and investigate rather than assuming the manual is correct. After a material product change, update this manual as part of the release so it does not become a second stale product definition.`,
      },
    ],
  },
];
