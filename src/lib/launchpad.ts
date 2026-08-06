// Guided First Campaign Launchpad.
//
// Pure resolution of "what should I do next?" from live workspace signals.
// Every step's completed state must be derived from real data by the caller —
// nothing here reads localStorage, and nothing here claims a campaign is live
// unless activation has genuinely been approved and used.

export type LaunchStepId =
  | "brief"
  | "contacts"
  | "content"
  | "sender"
  | "preflight"
  | "approval"
  | "activated";

export interface LaunchpadSignals {
  /** A campaign exists with a goal and a described audience. */
  hasBrief: boolean;
  /** Contacts cleared by the Data Vault for activation. */
  approvedContacts: number;
  /** Campaign has reviewable email content (subject + body). */
  hasContent: boolean;
  /** A usable, verified sending mailbox is connected. */
  senderReady: boolean;
  /** Count of unresolved preflight blockers for the working campaign. */
  preflightBlockers: number;
  /** Human approval has been recorded on the working campaign. */
  approved: boolean;
  /** The working campaign was built from sample data. */
  isSample: boolean;
  /** Leads have actually been prepared / messages queued or sent. */
  activated: boolean;
  /** Working campaign id, used for deep links. */
  campaignId?: string | null;
  /** Replies waiting to be worked (optional; only used once live). */
  repliesWaiting?: number;
  /** Compliance/opportunity replies that must be handled first. */
  urgentReplies?: number;
  /** Contacts still held back pending manual data review. */
  reviewContacts?: number;
}

export interface LaunchStep {
  id: LaunchStepId;
  label: string;
  detail: string;
  done: boolean;
  to: string;
  cta: string;
  /** Why this step matters — shown on the next-best-action card only. */
  why?: string;
}

export interface NextBestAction {
  /** Step (or post-launch action) the operator should do right now. */
  id: LaunchStepId | "replies";
  label: string;
  detail: string;
  why: string;
  to: string;
  cta: string;
  urgent: boolean;
}

export interface LaunchpadResult {
  steps: LaunchStep[];
  completed: number;
  total: number;
  /** The next genuine blocker, or null when everything is done. */
  nextStep: LaunchStep | null;
  /** Safe primary CTA target — never points at a completed step. */
  continueTo: string;
  continueLabel: string;
  /** Plain-English readiness sentence. Never claims a live campaign falsely. */
  summary: string;
  /** True only when approval AND real activation have happened. */
  campaignLive: boolean;
  /**
   * Single highest-value action derived from live data. Before launch this is
   * the next incomplete step; once live it becomes reply work when replies are
   * actually waiting.
   */
  nextBestAction: NextBestAction | null;
}


export function resolveLaunchpad(s: LaunchpadSignals): LaunchpadResult {
  const campaignTo = s.campaignId ? `/app/campaigns/${s.campaignId}` : "/app/campaigns/copilot";

  const steps: LaunchStep[] = [
    {
      id: "brief",
      label: "Define your audience and offer",
      detail: s.hasBrief
        ? "Your campaign has a goal and a described audience."
        : "Tell the Copilot who you are contacting and what you are offering.",
      done: s.hasBrief,
      to: "/app/campaigns/copilot",
      cta: "Open Copilot",
    },
    {
      id: "contacts",
      label: "Add approved contacts",
      detail:
        s.approvedContacts > 0
          ? `${s.approvedContacts.toLocaleString()} contact${s.approvedContacts === 1 ? "" : "s"} cleared for activation.`
          : "Import contacts and clear them through data-quality review first.",
      done: s.approvedContacts > 0,
      to: "/app/data-vault/upload",
      cta: "Upload contacts",
    },
    {
      id: "content",
      label: "Generate and review campaign assets",
      detail: s.hasContent
        ? "Email content exists and can be reviewed."
        : "Generate or write the email content for this campaign.",
      done: s.hasContent,
      to: campaignTo,
      cta: "Open campaign",
    },
    {
      id: "sender",
      label: "Verify your sending mailbox",
      detail: s.senderReady
        ? "A verified mailbox is connected and cleared for sending."
        : "Connect and verify a mailbox so messages come from your own domain.",
      done: s.senderReady,
      to: "/app/settings/email",
      cta: "Connect mailbox",
    },
    {
      id: "preflight",
      label: "Run preflight",
      detail:
        s.preflightBlockers === 0
          ? "No outstanding preflight blockers."
          : `${s.preflightBlockers} blocker${s.preflightBlockers === 1 ? "" : "s"} must be cleared before activation.`,
      done: s.preflightBlockers === 0,
      to: "/app/activate",
      cta: "Open preflight",
    },
    {
      id: "approval",
      label: "Approve activation",
      detail: s.isSample
        ? "Sample campaigns can never contact anyone. Swap in your own data first."
        : s.approved
          ? "Human approval has been recorded."
          : "Read the final copy and record your approval. Nothing sends without it.",
      done: s.approved && !s.isSample,
      to: campaignTo,
      cta: "Review and approve",
    },
    {
      id: "activated",
      label: "Activate your first segment",
      detail: s.activated
        ? "Leads have been prepared from your approved contacts."
        : "Prepare leads from your approved contacts inside the campaign.",
      done: s.activated,
      to: "/app/activate",
      cta: "Activate",
    },
  ];

  const completed = steps.filter((x) => x.done).length;
  const nextStep = steps.find((x) => !x.done) ?? null;
  const campaignLive = s.approved && !s.isSample && s.activated;

  const summary = campaignLive
    ? "Your first campaign is approved and activated. Work replies as they arrive."
    : nextStep
      ? `Not live yet — next: ${nextStep.label.toLowerCase()}.`
      : "Every step is complete.";

  return {
    steps,
    completed,
    total: steps.length,
    nextStep,
    continueTo: nextStep ? nextStep.to : "/app/follow-up",
    continueLabel: nextStep ? nextStep.cta : "Work replies",
    summary,
    campaignLive,
  };
}
