// First-Campaign Copilot — brief model, plan derivation and draft persistence.
//
// This module deliberately contains no React and no network calls so the rules
// that matter (required data-source confirmation, sample non-operability,
// manual-starter fallback labelling) can be unit tested directly.
//
// It does NOT define a parallel campaign model: everything here is projected
// into the existing `CampaignBrief` / `CampaignPack` shapes and stored on the
// existing `campaigns` row (`brief` and `pack` jsonb columns).

import {
  filterSupportedChannels,
  normaliseCampaignChannel,
  type CampaignBrief,
  type CampaignGoal,
  type CampaignPack,
} from "@/lib/campaignPack";

/** How the draft content was produced. Surfaced to the user, never hidden. */
export type CopilotSource = "ai" | "manual_starter" | "sample";

export interface CopilotInput {
  name: string;
  goal: CampaignGoal;
  /** Company site or offer context. Prefilled from the workspace when known. */
  website: string;
  offer: string;
  audience: string;
  industry: string;
  geography: string;
  tone: string;
  cta: string;
  channels: string[];
  /** Evidence the user is comfortable standing behind. Optional. */
  proof: string;
  /** Things the draft must avoid — claims, wording, timing. Optional. */
  constraints: string;
  /** Required. The user confirms the audience data is authorized business data. */
  dataSourceConfirmed: boolean;
}

export const COPILOT_GOALS: { value: CampaignGoal; label: string; help: string }[] = [
  { value: "leads", label: "Start conversations with new prospects", help: "Introductory outreach to people who fit your offer." },
  { value: "bookings", label: "Get meetings in the diary", help: "A direct ask for a call or demo." },
  { value: "sales", label: "Sell a specific product or service", help: "A defined offer with a clear commercial next step." },
  { value: "signups", label: "Get sign-ups or registrations", help: "Event, waitlist or trial registration." },
  { value: "awareness", label: "Introduce what we do", help: "Softer positioning, useful in a new market." },
];

export const COPILOT_CTA_OPTIONS = [
  "Reply to arrange a short call",
  "Reply if you'd like the details",
  "Book a time that suits you",
  "Reply with a yes and I'll send it over",
];

export const COPILOT_TONES = [
  "Direct, practical, no hype",
  "Warm and conversational",
  "Formal and considered",
  "Brief and to the point",
];

/**
 * Channels the copilot will offer. The platform sends email itself after
 * approval; social channels hand off to the customer's own Buffer account
 * (review → Send to Buffer → customer controls scheduling/publishing there).
 * `manual` channels produce a checklist task the customer carries out outside
 * the platform entirely.
 */
const BUFFER_CHANNEL_HELP =
  "We draft the posts. You review them, then Send to Buffer — you control scheduling and publishing in your own Buffer account.";

export const COPILOT_CHANNELS: { id: string; label: string; manual: boolean; help: string }[] = [
  { id: "Email", label: "Email", manual: false, help: "Sent from your own connected mailbox, after you approve." },
  { id: "LinkedIn", label: "LinkedIn (via Buffer)", manual: false, help: BUFFER_CHANNEL_HELP },
  { id: "Instagram", label: "Instagram (via Buffer)", manual: false, help: BUFFER_CHANNEL_HELP },
  { id: "X", label: "X / Twitter (via Buffer)", manual: false, help: BUFFER_CHANNEL_HELP },
  { id: "Facebook", label: "Facebook (via Buffer)", manual: false, help: BUFFER_CHANNEL_HELP },
  { id: "TikTok", label: "TikTok (via Buffer)", manual: false, help: BUFFER_CHANNEL_HELP },
  { id: "PR", label: "Press / announcement (manual)", manual: true, help: "We draft the release. You decide where it goes." },
  { id: "Paid ads", label: "Paid ads (manual)", manual: true, help: "We draft ad copy. You run it in your own ad account." },
];

/** Tokens the generator is allowed to emit, with the fallback used when a contact field is blank. */
export const COPILOT_VARIABLES: { token: string; label: string; fallback: string }[] = [
  { token: "{{first_name}}", label: "Recipient first name", fallback: "there" },
  { token: "{{company}}", label: "Recipient company", fallback: "your team" },
  { token: "{{sender}}", label: "Your name", fallback: "the sender name on your mailbox" },
];

export const COPILOT_DATA_SOURCE_LABEL =
  "I confirm this campaign will only contact business contacts I am authorized to email, from data my organization obtained lawfully.";

export const COPILOT_DRAFT_STORAGE_KEY = "vv.copilot.draft.v1";

export const EMPTY_COPILOT_INPUT: CopilotInput = {
  name: "",
  goal: "leads",
  website: "",
  offer: "",
  audience: "",
  industry: "",
  geography: "",
  tone: COPILOT_TONES[0],
  cta: COPILOT_CTA_OPTIONS[0],
  channels: ["Email"],
  proof: "",
  constraints: "",
  dataSourceConfirmed: false,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface CopilotIssue {
  field: keyof CopilotInput;
  message: string;
}

const MIN_OFFER = 20;
const MIN_AUDIENCE = 20;

export function validateCopilotInput(input: CopilotInput): CopilotIssue[] {
  const issues: CopilotIssue[] = [];
  if ((input.offer || "").trim().length < MIN_OFFER) {
    issues.push({ field: "offer", message: `Describe your offer in at least ${MIN_OFFER} characters.` });
  }
  if ((input.audience || "").trim().length < MIN_AUDIENCE) {
    issues.push({ field: "audience", message: `Describe who you're contacting in at least ${MIN_AUDIENCE} characters.` });
  }
  if (!filterSupportedChannels(input.channels).length) {
    issues.push({ field: "channels", message: "Choose at least one channel." });
  }
  if (!input.dataSourceConfirmed) {
    issues.push({ field: "dataSourceConfirmed", message: "Confirm your audience data is authorized business data before we build a draft." });
  }
  return issues;
}

export const canCreateFromCopilot = (input: CopilotInput) => validateCopilotInput(input).length === 0;

// ---------------------------------------------------------------------------
// Projection into the existing brief model
// ---------------------------------------------------------------------------

function defaultCampaignName(input: CopilotInput): string {
  const goal = COPILOT_GOALS.find((g) => g.value === input.goal)?.label ?? "Campaign";
  const who = (input.audience || "").trim().split(/[.,\n]/)[0]?.trim();
  return who ? `${goal} — ${who}`.slice(0, 90) : goal;
}

export function toCampaignBrief(input: CopilotInput): CampaignBrief {
  const channels = filterSupportedChannels(input.channels);
  const notes = [
    input.proof.trim() ? `Proof we can stand behind: ${input.proof.trim()}` : "",
    input.constraints.trim() ? `Must avoid: ${input.constraints.trim()}` : "",
    input.website.trim() ? `Company context: ${input.website.trim()}` : "",
  ].filter(Boolean).join("\n");

  return {
    name: (input.name || "").trim() || defaultCampaignName(input),
    goal: input.goal,
    kind: "lead_gen",
    offer: input.offer.trim(),
    audience: input.audience.trim(),
    industry: input.industry.trim(),
    geography: input.geography.trim(),
    pricePoint: "",
    tone: input.tone,
    cta: input.cta,
    channels: channels.length ? channels : ["Email"],
    deadline: "",
    notes,
    outputs: ["email", "landing", "offer"],
    language: "en",
  };
}

// ---------------------------------------------------------------------------
// The structured, editable plan stored alongside the brief
// ---------------------------------------------------------------------------

export interface CopilotEmailStep {
  step: number;
  subject: string;
  body: string;
  /** Days after the previous step. Step 1 is always 0 (send day). */
  delayDays: number;
  purpose: string;
}

export interface CopilotManualTask {
  channel: string;
  task: string;
}

export interface CopilotPlan {
  version: 1;
  source: CopilotSource;
  createdAt: string;
  objective: string;
  icpSummary: string;
  offerAngle: string;
  emailSteps: CopilotEmailStep[];
  manualTasks: CopilotManualTask[];
  variables: typeof COPILOT_VARIABLES;
  complianceNote: string;
  dataSourceConfirmed: boolean;
  proof: string;
  constraints: string;
}

const STEP_PURPOSES = [
  "Introduce the offer and make the ask once.",
  "Add context or a relevant example, then repeat the same ask.",
  "Short, polite close. Make it easy to say no.",
];
const STEP_DELAYS = [0, 3, 7];

const BUFFER_HANDOFF_TASK =
  "Review the drafted posts, then use Send to Buffer to hand them to your own Buffer account. You choose draft, queue or schedule there — nothing publishes automatically.";

const MANUAL_TASK_COPY: Record<string, string> = {
  LinkedIn: BUFFER_HANDOFF_TASK,
  Instagram: BUFFER_HANDOFF_TASK,
  X: BUFFER_HANDOFF_TASK,
  Facebook: BUFFER_HANDOFF_TASK,
  TikTok: BUFFER_HANDOFF_TASK,
  PR: "Review the drafted announcement and place it through your own channels or PR contact.",
  "Paid ads": "Load the drafted ad copy into your own ad account and set your own budget.",
};

function starterEmailSteps(brief: CampaignBrief): CopilotEmailStep[] {
  const who = brief.audience || "your audience";
  return [
    {
      step: 1,
      subject: `[EDIT] A short note about ${(brief.offer || "our work").slice(0, 40)}`,
      body: `Hi {{first_name}},\n\n[EDIT: one sentence on why you are writing to {{company}}.]\n\n[EDIT: what ${who} actually get from ${brief.offer || "your offer"}.]\n\n${brief.cta}\n\n— {{sender}}`,
      delayDays: STEP_DELAYS[0],
      purpose: STEP_PURPOSES[0],
    },
    {
      step: 2,
      subject: "[EDIT] Adding a little context",
      body: `{{first_name}},\n\n[EDIT: one concrete example or piece of proof you can stand behind.]\n\n${brief.cta}\n\n— {{sender}}`,
      delayDays: STEP_DELAYS[1],
      purpose: STEP_PURPOSES[1],
    },
    {
      step: 3,
      subject: "[EDIT] Last note from me",
      body: `{{first_name}},\n\n[EDIT: short, polite close. Make it easy to say no.]\n\n${brief.cta}\n\n— {{sender}}`,
      delayDays: STEP_DELAYS[2],
      purpose: STEP_PURPOSES[2],
    },
  ];
}

export function buildEmailSteps(pack: CampaignPack | null, brief: CampaignBrief): CopilotEmailStep[] {
  const generated = (pack?.emails || []).filter((e) => e && (e.subject || e.body)).slice(0, 3);
  if (generated.length < 3) return starterEmailSteps(brief);
  return generated.map((e, i) => ({
    step: i + 1,
    subject: e.subject || "",
    body: e.body || "",
    delayDays: STEP_DELAYS[i] ?? 7,
    purpose: STEP_PURPOSES[i] ?? STEP_PURPOSES[2],
  }));
}

export function buildManualTasks(channels: string[]): CopilotManualTask[] {
  return filterSupportedChannels(channels)
    .map(normaliseCampaignChannel)
    .filter((c) => c !== "Email")
    .map((c) => ({ channel: c, task: MANUAL_TASK_COPY[c] ?? `Carry out the ${c} step manually and record the outcome.` }));
}

export function buildComplianceNote(input: Pick<CopilotInput, "dataSourceConfirmed" | "constraints">, source: CopilotSource): string {
  const base = source === "sample"
    ? "Sample campaign. The contacts and content are examples only — this campaign cannot be activated or sent."
    : input.dataSourceConfirmed
      ? "The account holder confirmed this audience is authorized business data obtained lawfully by their organization."
      : "Data source not yet confirmed.";
  const extra = [
    "Every email carries an unsubscribe link and your sending address.",
    "Nothing sends until you clear preflight and approve the campaign.",
  ];
  if ((input.constraints || "").trim()) extra.push(`Author constraints: ${input.constraints.trim()}`);
  return [base, ...extra].join(" ");
}

export function buildCopilotPlan(args: {
  input: CopilotInput;
  brief: CampaignBrief;
  pack: CampaignPack | null;
  source: CopilotSource;
  now?: string;
}): CopilotPlan {
  const { input, brief, pack, source } = args;
  return {
    version: 1,
    source,
    createdAt: args.now ?? new Date().toISOString(),
    objective: `${COPILOT_GOALS.find((g) => g.value === brief.goal)?.label ?? brief.goal} — ${brief.cta}`,
    icpSummary: brief.audience,
    offerAngle: pack?.strategy?.bigIdea?.trim() || brief.offer,
    emailSteps: buildEmailSteps(pack, brief),
    manualTasks: buildManualTasks(brief.channels),
    variables: COPILOT_VARIABLES,
    complianceNote: buildComplianceNote(input, source),
    dataSourceConfirmed: source === "sample" ? true : !!input.dataSourceConfirmed,
    proof: input.proof.trim(),
    constraints: input.constraints.trim(),
  };
}

/** Read a plan back off a stored brief, tolerating old rows that have none. */
export function readCopilotPlan(brief: unknown): CopilotPlan | null {
  const plan = (brief as any)?.copilot;
  if (!plan || typeof plan !== "object" || plan.version !== 1) return null;
  if (!Array.isArray(plan.emailSteps)) return null;
  return plan as CopilotPlan;
}

// ---------------------------------------------------------------------------
// Draft persistence — the user must never lose their brief to a failed call
// ---------------------------------------------------------------------------

export function saveCopilotDraft(input: CopilotInput, storage?: Pick<Storage, "setItem">): void {
  const store = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(COPILOT_DRAFT_STORAGE_KEY, JSON.stringify({ ...input, savedAt: new Date().toISOString() }));
  } catch { /* storage unavailable — the in-memory form still works */ }
}

export function loadCopilotDraft(storage?: Pick<Storage, "getItem">): CopilotInput | null {
  const store = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!store) return null;
  try {
    const raw = store.getItem(COPILOT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...EMPTY_COPILOT_INPUT,
      ...parsed,
      channels: Array.isArray(parsed.channels) && parsed.channels.length ? parsed.channels : ["Email"],
      // Consent is never restored from storage — the user re-confirms each time.
      dataSourceConfirmed: false,
    };
  } catch {
    return null;
  }
}

export function clearCopilotDraft(storage?: Pick<Storage, "removeItem">): void {
  const store = storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);
  if (!store) return;
  try { store.removeItem(COPILOT_DRAFT_STORAGE_KEY); } catch { /* noop */ }
}

/** True when the draft holds enough work that losing it would matter. */
export function draftHasContent(input: CopilotInput): boolean {
  return !!(input.offer.trim() || input.audience.trim() || input.proof.trim() || input.constraints.trim() || input.name.trim());
}

// ---------------------------------------------------------------------------
// Insert payload for the EXISTING campaigns table (no parallel model)
// ---------------------------------------------------------------------------

export function buildCampaignSlug(name: string, rand = Math.random().toString(36).slice(2, 7)): string {
  const base = (name || "campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return `${base || "campaign"}-${rand}`;
}

export function buildCampaignInsert(args: {
  brief: CampaignBrief;
  pack: CampaignPack;
  plan: CopilotPlan;
  userId: string;
  workspaceId: string | null;
  sample: boolean;
  slug?: string;
}): Record<string, unknown> {
  const { brief, pack, plan, userId, workspaceId, sample } = args;
  return {
    name: brief.name,
    description: brief.offer,
    goal: brief.goal,
    campaign_kind: brief.kind,
    // Copilot output is always a draft. It is never scheduled or activated here.
    status: "draft",
    type: "email",
    owner_id: userId,
    created_by: userId,
    workspace_id: workspaceId,
    brief: { ...brief, copilot: plan },
    pack,
    slug: args.slug ?? buildCampaignSlug(brief.name),
    language: brief.language ?? "en",
    is_sample: sample,
    objective: plan.objective,
    target_audience_description: brief.audience,
    cadence_type: "one_off",
  };
}
