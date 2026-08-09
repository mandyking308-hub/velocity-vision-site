// Provider-agnostic sender readiness helper.
// Used by /app/settings/email, /app/activate, EmailSequenceSender.
// Mirrors the server-side gates in supabase/functions/email-send.

export type AuthType = "smtp" | "nylas" | null | undefined;
export type Provider =
  | "gmail" | "outlook" | "yahoo" | "icloud" | "imap" | "ews" | "smtp" | "unknown";

export type ReadinessState =
  | "disconnected"
  | "reconnect_required"
  | "setup_needed"
  | "connected_test_only"
  | "ready_warmup"
  | "ready_full";

/**
 * Consumer mailboxes where the customer cannot control DNS — DKIM/SPF/DMARC
 * are provider-managed. We never block warm-up sending on domain auth for
 * these. Keep in sync with server list in email-send/index.ts.
 */
export const PERSONAL_MAILBOX_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "proton.me", "protonmail.com",
]);

export interface ConnectionShape {
  auth_type?: AuthType;
  status?: string | null;
  nylas_grant_id?: string | null;
  nylas_provider?: string | null;
  provider?: string | null;
  from_email?: string | null;
  domain?: string | null;
  verification_status?: string | null;
  sending_enabled?: boolean | null;
}

export function detectProvider(c: ConnectionShape | null | undefined): Provider {
  if (!c) return "unknown";
  const np = (c.nylas_provider || "").toLowerCase();
  if (c.auth_type === "nylas") {
    if (np.includes("google") || np === "gmail") return "gmail";
    if (np.includes("microsoft") || np === "outlook") return "outlook";
    if (np.includes("yahoo")) return "yahoo";
    if (np.includes("icloud")) return "icloud";
    if (np === "ews" || np.includes("exchange")) return "ews";
    if (np.includes("imap")) return "imap";
    // Fall through to the local provider column if nylas_provider unknown.
  }
  const p = (c.provider || "").toLowerCase();
  if (["gmail","outlook","icloud","imap","ews","smtp","yahoo"].includes(p)) return p as Provider;
  return "smtp";
}

export function connectionDomain(c: ConnectionShape | null | undefined): string {
  if (!c) return "";
  return (c.domain || c.from_email?.split("@")[1] || "").toLowerCase();
}

export function isPersonalMailbox(c: ConnectionShape | null | undefined): boolean {
  return PERSONAL_MAILBOX_DOMAINS.has(connectionDomain(c));
}

export interface ReadinessResult {
  state: ReadinessState;
  provider: Provider;
  personal: boolean;
  inboxConnected: boolean;
  canTestSend: boolean;
  canSendWarmup: boolean;
  canSendFull: boolean;
  friendlyLine: string;
}

export function computeReadiness(c: ConnectionShape | null | undefined): ReadinessResult {
  const provider = detectProvider(c);
  const personal = isPersonalMailbox(c);

  const base: ReadinessResult = {
    state: "disconnected", provider, personal,
    inboxConnected: false, canTestSend: false,
    canSendWarmup: false, canSendFull: false,
    friendlyLine: "No mailbox connected.",
  };
  if (!c) return base;

  if (c.status === "reconnect_required") {
    return { ...base, state: "reconnect_required",
      friendlyLine: "Mailbox needs to be reconnected." };
  }
  if (c.status !== "connected") {
    return { ...base, state: "disconnected",
      friendlyLine: "Mailbox is not connected." };
  }

  // Nylas path — inbox is connected.
  if (c.auth_type === "nylas" && c.nylas_grant_id) {
    if (personal) {
      // Personal consumer mailbox: replies come back to the inbox, DKIM/SPF
      // are provider-managed, warm-up sending is available immediately.
      const full = c.sending_enabled === true;
      return {
        state: full ? "ready_full" : "ready_warmup",
        provider, personal, inboxConnected: true,
        canTestSend: true, canSendWarmup: true, canSendFull: full,
        friendlyLine: full
          ? "Ready to send."
          : "Mailbox connected — warm-up sending available. Replies return to this inbox.",
      };
    }
    // Custom domain via Nylas (Workspace, M365, IMAP, EWS): warm-up allowed,
    // full send needs sending_enabled. Copy is provider-appropriate.
    const full = c.sending_enabled === true;
    const providerNote =
      provider === "ews" ? " Exchange/EWS uses your organization's mail infrastructure."
      : provider === "imap" ? " IMAP sender uses your provider's outbound service."
      : "";
    return {
      state: full ? "ready_full" : "ready_warmup",
      provider, personal, inboxConnected: true,
      canTestSend: true, canSendWarmup: true, canSendFull: full,
      friendlyLine: full
        ? "Ready to send."
        : `Mailbox connected — warm-up sending available.${providerNote} Complete sender setup before higher-volume sending.`,
    };
  }

  // SMTP path — existing readiness model.
  const full = c.sending_enabled === true;
  return {
    state: full ? "ready_full" : "connected_test_only",
    provider, personal, inboxConnected: true,
    canTestSend: true, canSendWarmup: false, canSendFull: full,
    friendlyLine: full
      ? "Ready to send."
      : "SMTP connected — complete sender setup to enable sending.",
  };
}

/** Warm-up daily caps per plan. */
export const WARMUP_DAILY_CAP: Record<string, number> = {
  starter: 20,
  growth: 50,
  agency: 100,
};

export function warmupCap(plan: string | null | undefined): number {
  return WARMUP_DAILY_CAP[(plan || "starter").toLowerCase()] ?? 20;
}

export const READINESS_BADGE: Record<ReadinessState, { label: string; cls: string }> = {
  disconnected: { label: "Not connected", cls: "bg-muted text-muted-foreground" },
  reconnect_required: { label: "Reconnect required", cls: "bg-rose-100 text-rose-700" },
  setup_needed: { label: "Setup needed", cls: "bg-amber-100 text-amber-800" },
  connected_test_only: { label: "Test send only", cls: "bg-amber-100 text-amber-800" },
  ready_warmup: { label: "Ready — warm-up", cls: "bg-emerald-100 text-emerald-700" },
  ready_full: { label: "Ready to send", cls: "bg-emerald-100 text-emerald-700" },
};
