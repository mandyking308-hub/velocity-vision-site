// Canonical entry points into /auth.
//
// Public "Start Free Preview" style CTAs must land a brand-new prospect in the
// Create Account state, not on a Sign In form they have to escape from.
// Sign-in links keep pointing at the bare /auth path.
//
// The `mode` flag is a presentation hint only — it never widens `next`
// sanitisation and never grants anything.

export const SIGNUP_PATH = "/auth?mode=signup";
export const LOGIN_PATH = "/auth";

/**
 * Build a signup-mode auth link that preserves an internal return path
 * (for example a paid-plan purchase intent: /app/billing?buy=growth).
 * The path is encoded here and re-sanitised by `safeNextPath` on arrival.
 */
export function signupPathWithNext(next?: string | null): string {
  if (!next) return SIGNUP_PATH;
  return `${SIGNUP_PATH}&next=${encodeURIComponent(next)}`;
}

/** True when the URL explicitly asks for the Create Account state. */
export function isSignupMode(mode: string | null | undefined): boolean {
  return mode === "signup";
}
