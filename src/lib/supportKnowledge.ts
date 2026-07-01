// Deterministic knowledge base used by the Support Widget.
// No external calls — safe to run offline. Answers are cautious and
// never promise deliverability, revenue, or legal compliance outcomes.

export type SupportCategory =
  | "getting_started"
  | "data_vault"
  | "sender_verification"
  | "activation"
  | "billing_credits"
  | "campaigns"
  | "leads_pipeline"
  | "agency"
  | "legal_data"
  | "troubleshooting"
  | "other";

export interface KnowledgeEntry {
  id: string;
  category: SupportCategory;
  question: string;
  answer: string;
  keywords: string[];
  links?: { label: string; to: string }[];
}

export const KNOWLEDGE: KnowledgeEntry[] = [
  // Getting started
  {
    id: "gs-workspace",
    category: "getting_started",
    question: "How do I create or open my workspace?",
    answer:
      "Every account starts with a workspace. Open Workspaces to create one or switch between them. Starter and Growth plans include one workspace; Agency supports multiple isolated client workspaces.",
    keywords: ["workspace", "create", "open", "switch"],
    links: [{ label: "Workspaces", to: "/app/workspaces" }],
  },
  {
    id: "gs-flow",
    category: "getting_started",
    question: "What is the recommended order of operations?",
    answer:
      "1) Open a workspace  2) Upload contacts to the Data Vault  3) Review data quality  4) Connect and verify a sender  5) Accept current legal terms  6) Create a campaign  7) Activate only when Safe Activation is green.",
    keywords: ["order", "steps", "flow", "how", "start"],
    links: [
      { label: "Data Vault", to: "/app/data-vault" },
      { label: "Activate", to: "/app/activate" },
    ],
  },
  // Data Vault
  {
    id: "dv-upload",
    category: "data_vault",
    question: "How do I upload contacts?",
    answer:
      "Use Data Vault → Upload. Supported: CSV or paste. You'll map fields, preview, and confirm. Rows are labelled valid, needs review, risky, blocked, or duplicate.",
    keywords: ["upload", "csv", "import", "contacts", "vault"],
    links: [{ label: "Upload", to: "/app/data-vault/upload" }],
  },
  {
    id: "dv-quality",
    category: "data_vault",
    question: "What do the quality labels mean?",
    answer:
      "Valid: safe to use. Needs review: missing or ambiguous fields. Risky: role/generic/toxic addresses. Blocked: unsubscribed, bounced, or disallowed. Duplicate: already in this workspace. Only valid + reviewed contacts are used for activation.",
    keywords: ["quality", "valid", "risky", "blocked", "duplicate", "review"],
  },
  {
    id: "dv-isolation",
    category: "data_vault",
    question: "Can other workspaces see my data?",
    answer:
      "No. Contacts, companies, uploads, campaigns and leads are scoped to their workspace. Switching workspace switches the whole surface. Agency plans keep each client workspace isolated.",
    keywords: ["isolation", "share", "other", "workspace", "see"],
  },
  {
    id: "dv-failed",
    category: "data_vault",
    question: "My upload failed or numbers look wrong.",
    answer:
      "Re-check the file: UTF-8, one row per contact, header row present. Very large files can be split. If numbers look off, confirm you are viewing the correct workspace in the header.",
    keywords: ["failed", "upload", "wrong", "counts", "missing"],
    links: [{ label: "Report the problem", to: "/app/data-vault" }],
  },
  // Sender verification
  {
    id: "sv-connected-vs-verified",
    category: "sender_verification",
    question: "My sender is connected but activation is still blocked.",
    answer:
      "Connected is not the same as verified. Activation requires MX, SPF, DKIM (with the exact selector you configured) and DMARC to resolve for your sending domain. Add the DNS records shown in Settings → Email and re-check.",
    keywords: ["sender", "connected", "verified", "dkim", "spf", "mx", "dmarc"],
    links: [{ label: "Email settings", to: "/app/settings/email" }],
  },
  {
    id: "sv-dkim-selector",
    category: "sender_verification",
    question: "What is the DKIM selector?",
    answer:
      "DKIM is looked up at <selector>._domainkey.<yourdomain>. The selector is chosen by your mail provider (e.g. 'google', 's1', 'k1'). Enter the exact selector in the sender form or verification will fail.",
    keywords: ["dkim", "selector", "domainkey"],
  },
  // Activation
  {
    id: "act-blocked",
    category: "activation",
    question: "Why is Activation blocked?",
    answer:
      "Activation requires all of: current legal terms accepted, sender verified end-to-end, credits available, at least one safe contact, and an active workspace. Each check is listed on the Activation screen.",
    keywords: ["activation", "blocked", "cannot", "send"],
    links: [{ label: "Activation", to: "/app/activate" }],
  },
  // Billing & credits
  {
    id: "bill-plans",
    category: "billing_credits",
    question: "What are the plans and credits?",
    answer:
      "Starter and Growth include one workspace. Agency supports multiple client workspaces with pooled credits. One credit is consumed per governed campaign action. Top-ups are available at any time.",
    keywords: ["plan", "starter", "growth", "agency", "credits", "topup"],
    links: [{ label: "Billing", to: "/app/billing" }],
  },
  {
    id: "bill-failed",
    category: "billing_credits",
    question: "My payment succeeded but billing didn't update.",
    answer:
      "Webhooks usually update within a minute. Refresh the Billing page. If nothing changes after a few minutes, open a support ticket — we'll reconcile from the Stripe reference.",
    keywords: ["payment", "billing", "not updated", "webhook", "stuck"],
    links: [{ label: "Billing", to: "/app/billing" }],
  },
  // Campaigns
  {
    id: "camp-create",
    category: "campaigns",
    question: "How do I create a campaign?",
    answer:
      "Campaigns → New. Choose the workspace, audience segment, cadence, and assets. Generation uses credits only when it succeeds — failed generations do not double-charge.",
    keywords: ["campaign", "create", "new"],
    links: [{ label: "New campaign", to: "/app/campaigns/new" }],
  },
  // Leads / follow-up / pipeline
  {
    id: "leads-replies",
    category: "leads_pipeline",
    question: "Where do replies show up?",
    answer:
      "Replies land in Follow-up. From there you can mark warm leads and move them into Pipeline for opportunity tracking. Follow-up states include due, overdue, warm, replied and in_pipeline.",
    keywords: ["replies", "follow", "pipeline", "warm", "lead"],
    links: [
      { label: "Follow-up", to: "/app/follow-up" },
      { label: "Pipeline", to: "/app/pipeline" },
    ],
  },
  // Agency
  {
    id: "agency-multi",
    category: "agency",
    question: "How does multi-client work on Agency?",
    answer:
      "Each client is its own workspace with isolated contacts, campaigns and leads. Credits are pooled across your workspaces and daily send caps apply at the agency level to keep deliverability safe.",
    keywords: ["agency", "clients", "multi", "pooled"],
  },
  // Legal
  {
    id: "legal-versions",
    category: "legal_data",
    question: "Why am I being asked to accept legal terms again?",
    answer:
      "Governed actions (activation, billing, top-ups, human review) require acceptance of the current version of our legal documents. When we publish a new version, you'll be asked once before the next governed action.",
    keywords: ["legal", "accept", "terms", "version"],
    links: [{ label: "Legal Centre", to: "/legal" }],
  },
  {
    id: "legal-ai",
    category: "legal_data",
    question: "Are AI-generated assets safe to send as-is?",
    answer:
      "AI outputs are drafts. You remain responsible for reviewing content for legal, brand, and compliance suitability before sending. We do not provide legal advice.",
    keywords: ["ai", "draft", "compliance", "legal"],
  },
  // Troubleshooting
  {
    id: "ts-wrong-ws",
    category: "troubleshooting",
    question: "My data looks wrong or missing.",
    answer:
      "First check the workspace switcher in the header — data is workspace-scoped. If still wrong, open a ticket with the affected page URL so we can investigate.",
    keywords: ["missing", "wrong", "empty", "not showing"],
  },
];

// Simple deterministic scorer: keyword hits weighted, question overlap bonus.
export function searchKnowledge(query: string, limit = 3): KnowledgeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const scored = KNOWLEDGE.map((k) => {
    let score = 0;
    for (const t of tokens) {
      if (k.question.toLowerCase().includes(t)) score += 3;
      if (k.answer.toLowerCase().includes(t)) score += 1;
      if (k.keywords.some((kw) => kw.includes(t) || t.includes(kw))) score += 4;
    }
    return { k, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.k);
  return scored;
}

export const PROBLEM_CATEGORIES: { id: string; label: string; category: SupportCategory }[] = [
  { id: "broken", label: "Something is broken", category: "troubleshooting" },
  { id: "upload", label: "I can't upload", category: "data_vault" },
  { id: "sender", label: "My sender won't verify", category: "sender_verification" },
  { id: "billing", label: "Billing did not update", category: "billing_credits" },
  { id: "activation", label: "Activation is blocked", category: "activation" },
  { id: "campaign", label: "Campaign generation failed", category: "campaigns" },
  { id: "missing", label: "I think data is missing", category: "troubleshooting" },
  { id: "question", label: "Ask a question", category: "other" },
];
