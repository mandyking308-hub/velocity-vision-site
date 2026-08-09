// Deterministic knowledge base used by the Support Widget.
// No external calls. Answers are intentionally cautious and never promise
// deliverability, revenue, attribution, legal compliance or automatic sending.

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
  {
    id: "gs-workspace",
    category: "getting_started",
    question: "How do I create or open my workspace?",
    answer: "Free Preview, Starter and Growth use one workspace. Agency supports multiple isolated client workspaces. Open Workspaces to create or switch among workspaces allowed by your plan.",
    keywords: ["workspace", "create", "open", "switch"],
    links: [{ label: "Workspaces", to: "/app/workspaces" }],
  },
  {
    id: "gs-flow",
    category: "getting_started",
    question: "What is the recommended order?",
    answer: "Open a workspace, upload authorized business data, review quality flags, create and review a campaign pack, accept current terms and record human approval, then prepare eligible leads for activation. Before any live send, connect an eligible paid-plan sender and pass the current send-time safety and unsubscribe checks.",
    keywords: ["order", "steps", "flow", "start", "activation", "send"],
    links: [{ label: "Data Vault", to: "/app/data-vault" }, { label: "Activate", to: "/app/activate" }],
  },
  {
    id: "dv-upload",
    category: "data_vault",
    question: "How do I upload contacts?",
    answer: "Use Data Vault → Upload. Map fields, preview the file and confirm the import. Workspace labels such as valid, needs review, risky, blocked and duplicate are operational review aids; they are not legal approval or a guarantee that a contact may lawfully be contacted.",
    keywords: ["upload", "csv", "import", "contacts", "vault"],
    links: [{ label: "Upload", to: "/app/data-vault/upload" }],
  },
  {
    id: "dv-quality",
    category: "data_vault",
    question: "What do the quality labels mean?",
    answer: "Valid means the record passed the current workspace-format checks. Needs review flags incomplete or ambiguous data. Risky flags records that warrant extra review. Blocked or suppressed records are excluded by current workspace rules. Duplicate means the record appears to match another record. The customer remains responsible for lawful basis, permissions and suppression handling.",
    keywords: ["quality", "valid", "risky", "blocked", "duplicate", "review", "eligible"],
  },
  {
    id: "dv-isolation",
    category: "data_vault",
    question: "Can other workspaces see my data?",
    answer: "Client data is scoped by the platform's current workspace ownership and access rules. Agency client workspaces are designed to keep client records isolated while plan billing and pooled Campaign Credits remain account-level.",
    keywords: ["isolation", "share", "workspace", "agency"],
  },
  {
    id: "sender-readiness",
    category: "sender_verification",
    question: "What does sender readiness mean?",
    answer: "Mailbox and domain requirements depend on the provider and connection path. Use Email Settings as the authoritative status page. A connected mailbox may still be warming up, test-only, waiting for DNS checks or otherwise unavailable for customer sending. Do not share passwords, API keys, client secrets or app passwords in support messages.",
    keywords: ["sender", "connected", "verified", "dkim", "spf", "mx", "dmarc", "mailbox"],
    links: [{ label: "Email settings", to: "/app/settings/email" }],
  },
  {
    id: "activation-blocked",
    category: "activation",
    question: "Why is activation preparation blocked?",
    answer: "Preparing leads for activation requires a selected campaign, campaign content, eligible records, current legal acceptance, recorded human approval and non-sample data. Mailbox readiness, unsubscribe handling and today's send allowance are evaluated again when sending; Campaign Credits are not consumed per contact activated or emailed.",
    keywords: ["activation", "blocked", "prepare", "send", "approval"],
    links: [{ label: "Activation", to: "/app/activate" }],
  },
  {
    id: "bill-plans",
    category: "billing_credits",
    question: "What are Campaign Credits used for?",
    answer: "Campaign Credits are product-usage units for credit-priced AI generation. The current live credit-priced generator is full campaign-pack generation. Credits are not charged per email or per contact sent. Free Preview is limited to one full campaign pack; additional top-up packs are offered only to eligible paid workspaces when checkout is live-ready.",
    keywords: ["credits", "topup", "campaign", "pack", "send", "plan"],
    links: [{ label: "Billing", to: "/app/billing" }],
  },
  {
    id: "bill-failed",
    category: "billing_credits",
    question: "My payment succeeded but billing did not update.",
    answer: "Payment fulfilment is driven by the configured provider webhook. Refresh Billing after a short delay. If the paid product or credit balance still has not updated, contact support with the date, amount and account email. Do not send card numbers, API keys, webhook secrets or other credentials.",
    keywords: ["payment", "billing", "not updated", "webhook", "stuck"],
    links: [{ label: "Billing", to: "/app/billing" }],
  },
  {
    id: "camp-create",
    category: "campaigns",
    question: "How do I create a campaign?",
    answer: "Use Campaigns → New or the First-Campaign Copilot. A full campaign pack is a credit-priced AI action. Cadence dates organize recurring work on eligible plans but do not send automatically; each run remains customer-controlled.",
    keywords: ["campaign", "create", "new", "cadence", "credits"],
    links: [{ label: "New campaign", to: "/app/campaigns/new" }],
  },
  {
    id: "leads-replies",
    category: "leads_pipeline",
    question: "Where do replies show up?",
    answer: "Follow-Up displays replies and reply records available to the workspace. Completeness depends on the connected sender/provider, so check the connected inbox when it matters. Reply intent can help triage stored replies, but compliance wording such as unsubscribe or bounce takes precedence and warm replies only move into pipeline when a customer chooses to do so.",
    keywords: ["replies", "follow", "pipeline", "warm", "lead", "triage"],
    links: [{ label: "Follow-up", to: "/app/follow-up" }, { label: "Pipeline", to: "/app/pipeline" }],
  },
  {
    id: "agency-multi",
    category: "agency",
    question: "How does multi-client work on Agency?",
    answer: "Agency provides isolated client workspaces, pooled Campaign Credits, cross-client pipeline and Outcome Funnel visibility, and an account-wide view of daily send usage. Do not interpret that visibility as cross-seat pooled-send enforcement or seat management. The normal plan ceiling is 100 sends/day for the sending account and safety controls can reduce it.",
    keywords: ["agency", "clients", "multi", "pooled", "usage", "workspaces"],
  },
  {
    id: "legal-versions",
    category: "legal_data",
    question: "Why am I being asked to accept legal terms again?",
    answer: "Governed actions such as paid checkout, workspace creation, activation preparation and eligible Premium Human Review can require acceptance of the current legal versions. The legal documents shown in the Legal Centre are authoritative.",
    keywords: ["legal", "accept", "terms", "version"],
    links: [{ label: "Legal Centre", to: "/legal" }],
  },
  {
    id: "legal-ai",
    category: "legal_data",
    question: "Are AI-generated assets safe to send as-is?",
    answer: "No. AI outputs are drafts. Review them for factual accuracy, brand suitability, lawful basis, recipient appropriateness and applicable marketing rules before use. Velocity Vision does not provide legal advice or guarantee compliance.",
    keywords: ["ai", "draft", "compliance", "legal", "safe"],
  },
  {
    id: "human-review",
    category: "campaigns",
    question: "What is Premium Human Review?",
    answer: "Where available, Premium Human Review is a separate paid add-on for a senior-strategist review of the submitted campaign pack, written recommendations and one asynchronous revision pass. It is not legal advice, compliance sign-off, managed campaign delivery or a guarantee of results.",
    keywords: ["human", "review", "premium", "strategist", "campaign"],
  },
  {
    id: "ts-wrong-ws",
    category: "troubleshooting",
    question: "My data looks wrong or missing.",
    answer: "First check the current workspace in the header because customer records are workspace-scoped. If the issue remains, report the affected page and what you expected to see without including passwords, API keys or other secrets.",
    keywords: ["missing", "wrong", "empty", "not showing"],
  },
];

export function searchKnowledge(query: string, limit = 3): KnowledgeEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  return KNOWLEDGE.map((k) => {
    let score = 0;
    for (const t of tokens) {
      if (k.question.toLowerCase().includes(t)) score += 3;
      if (k.answer.toLowerCase().includes(t)) score += 1;
      if (k.keywords.some((kw) => kw.includes(t) || t.includes(kw))) score += 4;
    }
    return { k, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.k);
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
