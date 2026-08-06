// Campaign Preflight — deterministic readiness model run BEFORE any outreach
// can be activated. Pure functions only: no network, no side effects, so the
// same rules can be unit-tested and reused by the Activation page, the
// Campaign workspace and the Copilot.
//
// Nothing here loosens an existing gate. It surfaces, in one place, checks that
// were previously scattered (or invisible) so the user can see exactly what is
// blocking a send and fix it.

export type PreflightSeverity = "blocker" | "warning" | "info";

export interface PreflightCheck {
  id: string;
  label: string;
  /** Plain-English explanation of what passed or what is wrong. */
  detail: string;
  ok: boolean;
  severity: PreflightSeverity;
  /** Where the user goes to fix it. */
  fixTo?: string;
  fixLabel?: string;
}

export interface PreflightResult {
  checks: PreflightCheck[];
  blockers: PreflightCheck[];
  warnings: PreflightCheck[];
  /** 0-100 readiness score across all non-info checks. */
  score: number;
  /** True only when there are zero unresolved blockers. */
  canActivate: boolean;
  /** True when there are no blockers AND no warnings. */
  allClear: boolean;
}

export interface PreflightInput {
  /**
   * "send" runs every check including live send capacity and credits.
   * "campaign" runs only the checks the campaign owner controls from the
   * campaign workspace; capacity is verified again at activation.
   */
  scope?: "send" | "campaign";
  /** Campaign record basics. */
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
  /** Contacts cleared by the Data Vault for activation. */
  safeContacts: number;
  /** Contacts still awaiting manual review. */
  reviewContacts: number;
  /** Sender readiness — reuse senderReadiness state strings. */
  senderState:
    | "disconnected"
    | "reconnect_required"
    | "setup_needed"
    | "connected_test_only"
    | "ready_warmup"
    | "ready_full"
    | null;
  senderEmail?: string | null;
  /** Send Safety Engine allowance remaining today. */
  remainingToday: number;
  /** Reasons the Safety Engine has paused sending, if any. */
  pauseReasons: string[];
  /** Credits available vs the cost of this activation. */
  creditsAvailable: number;
  creditsRequired: number;
  /** Whether the workspace has accepted the current legal/compliance versions. */
  legalAccepted: boolean;
  /**
   * Whether opt-out handling is confirmed for this send. Callers must derive
   * this from lib/systemCapabilities — never pass a bare literal.
   */
  unsubscribeReady: boolean;
}

const SENDER_BLOCKING = new Set([
  "disconnected",
  "reconnect_required",
  "setup_needed",
]);

function packHasEmail(pack: unknown): boolean {
  const p = pack as { emails?: { subject?: string; body?: string }[] } | null;
  const first = p?.emails?.[0];
  return Boolean(first?.subject?.trim() && first?.body?.trim());
}

export function runPreflight(input: PreflightInput): PreflightResult {
  const c = input.campaign;
  const checks: PreflightCheck[] = [];

  const add = (x: PreflightCheck) => checks.push(x);

  // 0. A campaign must actually be selected before anything can be prepared.
  add({
    id: "campaign",
    label: "A campaign is selected",
    detail: c?.id
      ? `Leads will be prepared inside "${c.name || "this campaign"}".`
      : "Choose the campaign these contacts should be prepared into.",
    ok: Boolean(c?.id),
    severity: "blocker",
    fixTo: "/app/campaigns/new",
    fixLabel: "Create a campaign",
  });

  // 1. Campaign content exists
  add({
    id: "content",
    label: "Campaign content is generated",
    detail: packHasEmail(c?.pack)
      ? "Email subject and body are present and ready to review."
      : "This campaign has no email content yet. Generate or write it before activating.",
    ok: packHasEmail(c?.pack),
    severity: "blocker",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns/new",
    fixLabel: "Open campaign",
  });


  // 2. Objective / audience clarity
  const hasObjective = Boolean((c?.goal || "").trim());
  const hasAudience = Boolean((c?.brief?.audience || "").trim());
  add({
    id: "objective",
    label: "Objective and audience are defined",
    detail:
      hasObjective && hasAudience
        ? "The campaign has a clear goal and a described audience."
        : "Add a campaign goal and describe who you are contacting — this drives the copy and the reporting.",
    ok: hasObjective && hasAudience,
    severity: "warning",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns",
    fixLabel: "Edit brief",
  });

  // 3. Call to action
  const hasCta = Boolean((c?.brief?.cta || "").trim());
  add({
    id: "cta",
    label: "A single clear call to action",
    detail: hasCta
      ? "Your chosen call to action is set and used verbatim in the copy."
      : "No call to action chosen. Recipients need one obvious next step.",
    ok: hasCta,
    severity: "warning",
    fixTo: c?.id ? `/app/campaigns/${c.id}` : "/app/campaigns",
    fixLabel: "Edit brief",
  });

  // 4. Audience volume
  add({
    id: "contacts",
    label: "Approved contacts are available",
    detail:
      input.safeContacts > 0
        ? `${input.safeContacts.toLocaleString()} contact${input.safeContacts === 1 ? "" : "s"} cleared for activation.`
        : "No contacts have passed data-quality review yet. Upload and review data first.",
    ok: input.safeContacts > 0,
    severity: "blocker",
    fixTo: "/app/data-vault",
    fixLabel: "Open Data Vault",
  });

  if (input.reviewContacts > 0) {
    add({
      id: "review_backlog",
      label: "No contacts waiting on review",
      detail: `${input.reviewContacts.toLocaleString()} contact${input.reviewContacts === 1 ? " is" : "s are"} held back pending manual review. They will not be sent to.`,
      ok: false,
      severity: "warning",
      fixTo: "/app/data-vault",
      fixLabel: "Review data",
    });
  }

  // 5. Sender readiness
  const senderOk = Boolean(input.senderState && !SENDER_BLOCKING.has(input.senderState));
  add({
    id: "sender",
    label: "Sending mailbox is connected",
    detail: senderOk
      ? `Sending from ${input.senderEmail || "your connected mailbox"}.`
      : "No usable sending mailbox. Connect and verify a mailbox before activating.",
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
      label: "Mailbox is out of warm-up",
      detail: "This mailbox is still warming up, so today's volume is deliberately reduced to protect deliverability.",
      ok: false,
      severity: "warning",
      fixTo: "/app/settings/email",
      fixLabel: "View sender status",
    });
  }

  // 6. Safety engine allowance
  const scope = input.scope ?? "send";
  if (scope === "send") add({
    id: "allowance",
    label: "Daily safe send allowance remaining",
    detail:
      input.remainingToday > 0
        ? `${input.remainingToday.toLocaleString()} safe send${input.remainingToday === 1 ? "" : "s"} left today.`
        : "You have used today's safe send allowance. Sending resumes tomorrow.",
    ok: input.remainingToday > 0,
    severity: "blocker",
    fixTo: "/app/activate",
    fixLabel: "Open Activate",
  });

  if (scope === "send" && input.pauseReasons.length > 0) {
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

  // 7. Credits
  const creditsOk = input.creditsAvailable >= input.creditsRequired;
  if (scope === "send") add({
    id: "credits",
    label: "Enough credits for this activation",
    detail: creditsOk
      ? `${input.creditsAvailable.toLocaleString()} credits available (${input.creditsRequired.toLocaleString()} required).`
      : `This activation needs ${input.creditsRequired.toLocaleString()} credits and you have ${input.creditsAvailable.toLocaleString()}.`,
    ok: creditsOk,
    severity: "blocker",
    fixTo: "/app/billing",
    fixLabel: "Top up",
  });

  // 8. Compliance
  add({
    id: "legal",
    label: "Compliance terms accepted",
    detail: input.legalAccepted
      ? "Current outreach and data-protection terms have been accepted."
      : "You must accept the current outreach compliance terms before sending.",
    ok: input.legalAccepted,
    severity: "blocker",
    fixTo: "/app/settings",
    fixLabel: "Review terms",
  });

  add({
    id: "unsubscribe",
    label: "Unsubscribe handling is active",
    detail: input.unsubscribeReady
      ? "Every message carries a working unsubscribe link and honours suppressions."
      : "Opt-out handling is not confirmed for this send. Add an unsubscribe line to the email copy.",
    ok: input.unsubscribeReady,
    severity: "blocker",
    fixTo: "/app/settings/email",
    fixLabel: "Check settings",
  });

  // 9. Human approval — the final gate.
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
      detail: "This campaign was built from sample data. Swap in your own contacts and offer before sending.",
      ok: false,
      severity: "blocker",
      fixTo: "/app/data-vault/upload",
      fixLabel: "Upload real data",
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

// ---------------------------------------------------------------------------
// Activation gate
// ---------------------------------------------------------------------------
// Activation is not sending: it prepares leads inside a campaign. Send-time
// concerns (daily allowance, credits, mailbox health) stay VISIBLE in the
// preflight card but must not hard-block activation, or we would contradict the
// "activation is separate from sending" promise.
//
// These are the checks that must hold before a single lead row is written. The
// gate is derived from the very same PreflightResult the UI renders, so the
// button state and the execution path cannot drift apart.
export const ACTIVATION_BLOCKER_IDS = [
  "campaign",
  "content",
  "contacts",
  "legal",
  "approval",
  "sample",
] as const;

export type ActivationBlockerId = (typeof ACTIVATION_BLOCKER_IDS)[number];

export interface ActivationGateResult {
  /** True only when every activation-critical check passes. */
  ok: boolean;
  /** The failing activation-critical checks, in preflight order. */
  blockers: PreflightCheck[];
  /** The first thing the user has to fix, for messaging. */
  firstBlocker: PreflightCheck | null;
  /** Ids only — safe to persist to the audit log (no free text, no PII). */
  blockerIds: string[];
}

/**
 * Derive the activation verdict from a preflight result.
 *
 * Pure and total: callers pass the same `PreflightResult` they display, so the
 * UI button and `runActivation()` always agree.
 */
export function activationGate(result: PreflightResult): ActivationGateResult {
  const critical = new Set<string>(ACTIVATION_BLOCKER_IDS);
  const blockers = result.checks.filter(
    (c) => !c.ok && c.severity === "blocker" && critical.has(c.id),
  );
  return {
    ok: blockers.length === 0,
    blockers,
    firstBlocker: blockers[0] ?? null,
    blockerIds: blockers.map((c) => c.id),
  };
}

/** The minimum a campaign row must expose for the execution guard. */
export interface ActivationCampaignRef {
  id?: string | null;
  is_sample?: boolean | null;
  approved_at?: string | null;
}

export interface ExecutionVerdict {
  ok: boolean;
  /** Human-readable first thing to fix. Empty when `ok`. */
  reason: string;
  /** Ids only — safe to persist to the audit log (no free text, no PII). */
  blockerIds: string[];
}

/**
 * The single source of truth for "may this campaign create leads right now?".
 *
 * Pure and total. Both the activation button and `runActivation()` call this
 * with the same preflight result, so the rendered state and the executed
 * decision cannot diverge. The campaign row is passed separately so the
 * execution path can re-verify against a freshly fetched row.
 */
export function canExecuteActivation(
  result: PreflightResult,
  campaign: ActivationCampaignRef | null | undefined,
): ExecutionVerdict {
  if (!campaign?.id) {
    return { ok: false, reason: "Choose the campaign these contacts should be prepared into.", blockerIds: ["campaign"] };
  }
  if (campaign.is_sample === true) {
    return {
      ok: false,
      reason: "Sample campaigns are for practice only and can never contact anyone.",
      blockerIds: ["sample"],
    };
  }
  if (!campaign.approved_at) {
    return {
      ok: false,
      reason: "Record final human approval of the campaign content before preparing leads.",
      blockerIds: ["approval"],
    };
  }
  if (!result.canActivate) {
    const first = result.blockers[0];
    return {
      ok: false,
      reason: first ? `${first.label}: ${first.detail}` : "Resolve the outstanding preflight blockers.",
      blockerIds: result.blockers.map((b) => b.id),
    };
  }
  return { ok: true, reason: "", blockerIds: [] };
}

