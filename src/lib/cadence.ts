// Campaign cadence helpers — single source of truth for schedule logic.
// Cadence dates organise recurring work; they never mean automatic sending.

export type CadenceType = "one_off" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
export type CadenceUnit = "day" | "week" | "month";
export type RefreshStrategy = "reuse" | "clone" | "regenerate";
export type LifecycleState = "draft" | "scheduled" | "active" | "paused" | "completed" | "expired";

export interface CadenceConfig {
  cadence_type: CadenceType;
  cadence_interval: number;
  cadence_unit: CadenceUnit;
  start_at: string | null;
  timezone: string;
  cadence_end_at: string | null;
  cadence_max_runs: number | null;
  refresh_strategy: RefreshStrategy;
}

export const CADENCE_LABELS: Record<CadenceType, string> = {
  one_off: "One-off",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom: "Custom recurring",
};

export const REFRESH_LABELS: Record<RefreshStrategy, string> = {
  reuse: "Reuse existing assets",
  clone: "Use prior assets as a starting point",
  regenerate: "Prepare fresh assets before the next run",
};

export function defaultCadence(): CadenceConfig {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 24);
  return {
    cadence_type: "one_off",
    cadence_interval: 1,
    cadence_unit: "week",
    start_at: now.toISOString(),
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Europe/London",
    cadence_end_at: null,
    cadence_max_runs: null,
    refresh_strategy: "reuse",
  };
}

function addStep(d: Date, type: CadenceType, interval: number, unit: CadenceUnit): Date {
  const n = new Date(d);
  switch (type) {
    case "weekly": n.setDate(n.getDate() + 7); break;
    case "monthly": n.setMonth(n.getMonth() + 1); break;
    case "quarterly": n.setMonth(n.getMonth() + 3); break;
    case "yearly": n.setFullYear(n.getFullYear() + 1); break;
    case "custom":
      if (unit === "day") n.setDate(n.getDate() + interval);
      else if (unit === "week") n.setDate(n.getDate() + interval * 7);
      else n.setMonth(n.getMonth() + interval);
      break;
    case "one_off": default: return n;
  }
  return n;
}

/** Compute next cadence date after `from` based on cadence + start_at. */
export function computeNextRun(cfg: CadenceConfig, from: Date = new Date()): Date | null {
  if (!cfg.start_at) return null;
  const start = new Date(cfg.start_at);
  if (cfg.cadence_type === "one_off") return start > from ? start : null;
  let next = new Date(start);
  while (next <= from) next = addStep(next, cfg.cadence_type, cfg.cadence_interval, cfg.cadence_unit);
  if (cfg.cadence_end_at && next > new Date(cfg.cadence_end_at)) return null;
  return next;
}

export function deriveLifecycle(
  status: string | null | undefined,
  cfg: Partial<CadenceConfig>,
  runsCompleted: number = 0,
): LifecycleState {
  if (status === "paused") return "paused";
  if (status === "completed") return "completed";
  if (status === "draft" || !cfg.start_at) return "draft";
  const now = new Date();
  const start = new Date(cfg.start_at);
  const end = cfg.cadence_end_at ? new Date(cfg.cadence_end_at) : null;
  if (end && end < now) return "expired";
  if (cfg.cadence_max_runs && runsCompleted >= cfg.cadence_max_runs) return "completed";
  if (start > now) return "scheduled";
  if (cfg.cadence_type === "one_off" && runsCompleted > 0) return "completed";
  return "active";
}

export const LIFECYCLE_TONE: Record<LifecycleState, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-foreground" },
  scheduled: { label: "Scheduled", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  active: { label: "Active", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  paused: { label: "Paused", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  completed: { label: "Completed", cls: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  expired: { label: "Expired", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
};

function fmtDateTime(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: tz,
    }).format(new Date(iso));
  } catch { return new Date(iso).toLocaleString(); }
}

function fmtDate(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: tz }).format(new Date(iso));
  } catch { return new Date(iso).toLocaleDateString(); }
}

/** Plain-English preview of cadence config. Every due date still requires customer review/action. */
export function plainEnglish(cfg: CadenceConfig): string {
  const parts: string[] = [];
  if (cfg.start_at) parts.push(`Starts ${fmtDateTime(cfg.start_at, cfg.timezone)} (${cfg.timezone})`);
  switch (cfg.cadence_type) {
    case "one_off": parts.push("One planned run"); break;
    case "weekly": parts.push("Cadence every week"); break;
    case "monthly": parts.push("Cadence every month"); break;
    case "quarterly": parts.push("Cadence every quarter"); break;
    case "yearly": parts.push("Cadence every year"); break;
    case "custom": parts.push(`Cadence every ${cfg.cadence_interval} ${cfg.cadence_unit}${cfg.cadence_interval > 1 ? "s" : ""}`); break;
  }
  if (cfg.cadence_end_at) parts.push(`Ends ${fmtDate(cfg.cadence_end_at, cfg.timezone)}`);
  if (cfg.cadence_max_runs) parts.push(`Max ${cfg.cadence_max_runs} planned runs`);
  const next = computeNextRun(cfg);
  if (next) parts.push(`Next review date: ${fmtDateTime(next.toISOString(), cfg.timezone)}`);
  parts.push("Each run remains customer-controlled");
  return parts.join(" · ");
}

/** Short next-action label for cards. Does not imply an automatic send/run. */
export function nextActionLabel(cfg: Partial<CadenceConfig> & { next_run_at?: string | null }): string {
  const next = cfg.next_run_at
    ? new Date(cfg.next_run_at)
    : cfg.start_at && cfg.cadence_type
      ? computeNextRun(cfg as CadenceConfig)
      : null;
  if (!next) return cfg.cadence_end_at ? `Ends ${fmtDate(cfg.cadence_end_at, cfg.timezone || "UTC")}` : "No cadence date set";
  const days = Math.round((next.getTime() - Date.now()) / 86_400_000);
  const tz = cfg.timezone || "UTC";
  if (days < 0) return `Cadence review overdue since ${fmtDate(next.toISOString(), tz)}`;
  if (days === 0) return `Cadence review due today at ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(next)}`;
  if (days === 1) return `Cadence review due tomorrow at ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(next)}`;
  if (days <= 14) return `Cadence review in ${days} days · ${fmtDate(next.toISOString(), tz)}`;
  return `Next cadence review ${fmtDate(next.toISOString(), tz)}`;
}

export const COMMON_TIMEZONES = [
  "Europe/London", "Europe/Dublin", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "UTC",
];
