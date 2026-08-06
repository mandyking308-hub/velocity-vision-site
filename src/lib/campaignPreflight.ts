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
  /** Whether unsubscribe handling is wired for this send. */
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
    fixTo: c?.id ? `/app/campaigns/${c.id}` : undefined,
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
    fixTo: c?.id ? `/app/campaigns/${c.id}` : undefined,
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
      : "Unsubscribe handling is not available for this send.",
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
    fixTo: c?.id ? `/app/campaigns/${c.id}` : undefined,
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
