// Campaign Preflight — deterministic readiness model for campaign preparation
// and customer-controlled sending. Pure functions only: no network or side effects.

export type PreflightSeverity = "blocker" | "warning" | "info";

export interface PreflightCheck {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
  severity: PreflightSeverity;
  fixTo?: string;
  fixLabel?: string;
}

export interface PreflightResult {
  checks: PreflightCheck[];
  blockers: PreflightCheck[];
  warnings: PreflightCheck[];
  score: number;
  canActivate: boolean;
  allClear: boolean;
}

export interface PreflightInput {
  /**
   * campaign = checks required to prepare eligible leads inside a campaign.
   * send = campaign checks plus mailbox, unsubscribe and daily send readiness.
   */
  scope?: "send" | "campaign";
  campaign: {
    id?: string | null;
    name?: string | null;
    goal?: string | null;
    status?: string | null;
    pack?: unknown;
    brief?: { cta?: string | null; audience?: string | null; offer?: string | null } | null;
    approved_at?: string | null;
    is_sample?: boolean | null;
    start_at?: string | null;
    cadence_type?: string | null;
  } | null;
  safeContacts: number;
  reviewContacts: number;
  senderState:
    | "disconnected"
    | "reconnect_required"
    | "setup_needed"
    | "connected_test_only"
    | "ready_warmup"
    | "ready_full"
    | null;
  senderEmail?: string | null;
  remainingToday: number;
  pauseReasons: string[];
  /** @deprecated Campaign Credits are checked when a credit-priced AI action is reserved, not when sending. */
  creditsAvailable?: number;
  /** @deprecated Campaign Credits are not consumed by activation or per-contact sending. */
  creditsRequired?: number;
  legalAccepted: boolean;
  unsubscribeReady: boolean;
}

const SENDER_BLOCKING = new Set(["disconnected", "reconnect_required", "setup_needed"]);

function packHasEmail(pack: unknown): boolean {
  const p = pack as { emails?: { subject?: string; body?: string }[] } | null;
  const first = p?.emails?.[0];
  return Boolean(first?.subject?.trim() && first?.body?.trim());
}

export function runPreflight(input: PreflightInput): PreflightResult {
  const c = input.campaign;
  const scope = input.scope ?? "send";
  const checks: PreflightCheck[] = [];
  const add = (x: PreflightCheck) => checks.push(x);

  add({
    id: "campaign",
    label: "A campaign is selected",
    detail: c?.id ? `Leads will be prepared inside "${c.name || "this campaign"}".` : "Choose the campaign these contacts should be prepared into.",
    ok: Boolean(c?.id),
    severity: "blocker",
    fixTo: "/app/campaigns/new",
    fixLabel: "Create a campaign",
  });

  add({
    id: "content",
    label: "Campaign content is ready for review",
    detail: packHasEmail(c?.pack)
      ? "Email subject and body are present. Review them before activation."
      : "This campaign has no email content yet. Generate or write it before activation.",
    ok: packHasEmail(c?.pack),
    severity: "blocker",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns/new",
    fixLabel: "Open campaign",
  });

  const hasObjective = Boolean((c?.goal || "").trim());
  const hasAudience = Boolean((c?.brief?.audience || "").trim());
  add({
    id: "objective",
    label: "Objective and audience are defined",
    detail: hasObjective && hasAudience
      ? "The campaign has a clear goal and described audience."
      : "Add a campaign goal and describe who you are contacting.",
    ok: hasObjective && hasAudience,
    severity: "warning",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns",
    fixLabel: "Edit brief",
  });

  const hasCta = Boolean((c?.brief?.cta || "").trim());
  add({
    id: "cta",
    label: "A single clear call to action",
    detail: hasCta ? "A call to action is set." : "No call to action is set yet.",
    ok: hasCta,
    severity: "warning",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns",
    fixLabel: "Edit brief",
  });

  add({
    id: "contacts",
    label: "Eligible contacts are available",
    detail: input.safeContacts > 0
      ? `${input.safeContacts.toLocaleString()} contact${input.safeContacts === 1 ? "" : "s"} eligible for activation review under current workspace checks.`
      : "No contacts have passed the current data-quality checks yet. Upload and review data first.",
    ok: input.safeContacts > 0,
    severity: "blocker",
    fixTo: "/app/data-vault",
    fixLabel: "Open Data Vault",
  });

  if (input.reviewContacts > 0) {
    add({
      id: "review_backlog",
      label: "Contacts awaiting review are held back",
      detail: `${input.reviewContacts.toLocaleString()} contact${input.reviewContacts === 1 ? " is" : "s are"} awaiting manual review and will remain excluded until reviewed.`,
      ok: false,
      severity: "warning",
      fixTo: "/app/data-vault",
      fixLabel: "Review data",
    });
  }

  add({
    id: "legal",
    label: "Compliance terms accepted",
    detail: input.legalAccepted
      ? "Current outreach and data-protection terms have been accepted."
      : "Accept the current outreach compliance terms before activation preparation.",
    ok: input.legalAccepted,
    severity: "blocker",
    fixTo: "/app/settings",
    fixLabel: "Review terms",
  });

  add({
    id: "approval",
    label: "Reviewed and approved by a human",
    detail: c?.approved_at
      ? `Approved on ${new Date(c.approved_at).toLocaleString()}.`
      : "Read the final copy and approve it. Nothing is sent automatically without this.",
    ok: Boolean(c?.approved_at),
    severity: "blocker",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns",
    fixLabel: "Review copy",
  });

  if (c?.is_sample) {
    add({
      id: "sample",
      label: "Not a sample campaign",
      detail: "Sample campaigns are for practice only. Use your own authorized data and offer before live use.",
      ok: false,
      severity: "blocker",
      fixTo: "/app/data-vault/upload",
      fixLabel: "Upload real data",
    });
  }

  // Sending readiness is deliberately separate from activation preparation.
  if (scope === "send") {
    const senderOk = Boolean(input.senderState && !SENDER_BLOCKING.has(input.senderState));
    add({
      id: "sender",
      label: "Sending mailbox is connected",
      detail: senderOk
        ? `Sending from ${input.senderEmail || "your connected mailbox"}.`
        : "No usable sending mailbox. Connect and verify a mailbox before sending.",
      ok: senderOk,
      severity: "blocker",
      fixTo: "/app/settings/email",
      fixLabel: "Connect mailbox",
    });

    if (senderOk && input.senderState === "connected_test_only") {
      add({
        id: "sender_test_only",
        label: "Mailbox cleared for customer sending",
        detail: "This mailbox is currently limited to internal test sends only.",
        ok: false,
        severity: "blocker",
        fixTo: "/app/settings/email",
        fixLabel: "Open sender settings",
      });
    }

    if (input.senderState === "ready_warmup") {
      add({
        id: "warmup",
        label: "Mailbox warm-up is still active",
        detail: "Today's sending volume is deliberately reduced while this mailbox warms up.",
        ok: false,
        severity: "warning",
        fixTo: "/app/settings/email",
        fixLabel: "View sender status",
      });
    }

    add({
      id: "allowance",
      label: "Daily send allowance remaining",
      detail: input.remainingToday > 0
        ? `${input.remainingToday.toLocaleString()} send${input.remainingToday === 1 ? "" : "s"} available under today's current safety allowance.`
        : "Today's current send allowance has been reached or sending is not available on this plan/sender yet.",
      ok: input.remainingToday > 0,
      severity: "blocker",
      fixTo: "/app/activate",
      fixLabel: "Open Activate",
    });

    if (input.pauseReasons.length > 0) {
      add({
        id: "paused",
        label: "Sending is not paused",
        detail: input.pauseReasons.join(" · "),
        ok: false,
        severity: "blocker",
        fixTo: "/app/activate",
        fixLabel: "Review safety",
      });
    }

    add({
      id: "unsubscribe",
      label: "Unsubscribe handling is active",
      detail: input.unsubscribeReady
        ? "The send path includes working unsubscribe handling and suppression checks."
        : "Opt-out handling is not confirmed for this send.",
      ok: input.unsubscribeReady,
      severity: "blocker",
      fixTo: "/app/settings/email",
      fixLabel: "Check settings",
    });
  }

  const scored = checks.filter((x) => x.severity !== "info");
  const passed = scored.filter((x) => x.ok).length;
  const blockers = checks.filter((x) => !x.ok && x.severity === "blocker");
  const warnings = checks.filter((x) => !x.ok && x.severity === "warning");

  return {
    checks,
    blockers,
    warnings,
    score: scored.length ? Math.round((passed / scored.length) * 100) : 0,
    canActivate: blockers.length === 0,
    allClear: blockers.length === 0 && warnings.length === 0,
  };
}

export const ACTIVATION_BLOCKER_IDS = ["campaign", "content", "contacts", "legal", "approval", "sample"] as const;
export type ActivationBlockerId = (typeof ACTIVATION_BLOCKER_IDS)[number];

export interface ActivationGateResult {
  ok: boolean;
  blockers: PreflightCheck[];
  firstBlocker: PreflightCheck | null;
  blockerIds: string[];
}

export function activationGate(result: PreflightResult): ActivationGateResult {
  const critical = new Set<string>(ACTIVATION_BLOCKER_IDS);
  const blockers = result.checks.filter((c) => !c.ok && c.severity === "blocker" && critical.has(c.id));
  return {
    ok: blockers.length === 0,
    blockers,
    firstBlocker: blockers[0] ?? null,
    blockerIds: blockers.map((c) => c.id),
  };
}

export interface ActivationCampaignRef {
  id?: string | null;
  is_sample?: boolean | null;
  approved_at?: string | null;
}

export interface ExecutionVerdict {
  ok: boolean;
  reason: string;
  blockerIds: string[];
}

export function canExecuteActivation(
  result: PreflightResult,
  campaign: ActivationCampaignRef | null | undefined,
): ExecutionVerdict {
  if (!campaign?.id) {
    return { ok: false, reason: "Choose the campaign these contacts should be prepared into.", blockerIds: ["campaign"] };
  }
  if (campaign.is_sample === true) {
    return { ok: false, reason: "Sample campaigns are for practice only and can never contact anyone.", blockerIds: ["sample"] };
  }
  if (!campaign.approved_at) {
    return { ok: false, reason: "Record final human approval of the campaign content before preparing leads.", blockerIds: ["approval"] };
  }

  // Only activation-critical checks can block lead preparation. Mailbox state,
  // daily send allowance and unsubscribe readiness are evaluated again at send time.
  const gate = activationGate(result);
  if (!gate.ok) {
    const first = gate.firstBlocker;
    return {
      ok: false,
      reason: first ? `${first.label}: ${first.detail}` : "Resolve the outstanding activation-preparation blockers.",
      blockerIds: gate.blockerIds,
    };
  }
  return { ok: true, reason: "", blockerIds: [] };
}
