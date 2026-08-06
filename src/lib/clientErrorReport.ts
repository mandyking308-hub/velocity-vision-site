/**
 * Sanitised client error reporting.
 *
 * Privacy rules (deliberately strict):
 *  - Never send message bodies, lead data, email content or tokens.
 *  - Never send full URLs — only the route pathname, with any UUID-ish or
 *    numeric segments replaced by `:id`. Query strings are always dropped.
 *  - Error messages are redacted (emails, long tokens, URLs) and truncated.
 *  - Stack traces are reduced to the first few frames, file+line only.
 *  - No third-party analytics, no cookies, no fingerprinting.
 */
import { supabase } from "@/integrations/supabase/client";

const MAX_MESSAGE = 300;
const MAX_STACK_FRAMES = 4;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_RE = /https?:\/\/[^\s'"]+/g;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_\-.]{32,}\b/g;
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function redactText(input: string): string {
  return input
    .replace(EMAIL_RE, "[email]")
    .replace(URL_RE, "[url]")
    .replace(UUID_RE, "[id]")
    .replace(LONG_TOKEN_RE, "[token]")
    .slice(0, MAX_MESSAGE);
}

export function safeRoute(pathname: string): string {
  return pathname
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .map((seg) =>
      UUID_RE.test(seg) || /^\d{4,}$/.test(seg) ? ":id" : seg,
    )
    .join("/")
    .slice(0, 120);
}

export function safeStack(stack: string | undefined): string {
  if (!stack) return "";
  return stack
    .split("\n")
    .slice(1, 1 + MAX_STACK_FRAMES)
    .map((line) => redactText(line.trim()))
    .join(" | ")
    .slice(0, 600);
}

export interface SanitisedClientError {
  name: string;
  message: string;
  route: string;
  stack: string;
  build: string;
}

export function buildSanitisedError(error: unknown, pathname: string): SanitisedClientError {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    name: redactText(err.name || "Error").slice(0, 80),
    message: redactText(err.message || "Unknown error"),
    route: safeRoute(pathname),
    stack: safeStack(err.stack),
    build: String((window as unknown as Record<string, string>).__vvBuild ?? "unknown"),
  };
}

// Client-side throttle so a render loop can't hammer the backend.
let sentInWindow = 0;
let windowStart = 0;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

export async function reportClientError(error: unknown, pathname: string): Promise<void> {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) { windowStart = now; sentInWindow = 0; }
  if (sentInWindow >= MAX_PER_WINDOW) return;
  sentInWindow++;

  try {
    await supabase.functions.invoke("client-error-log", {
      body: buildSanitisedError(error, pathname),
    });
  } catch {
    // Reporting must never surface a second error to the customer.
  }
}
