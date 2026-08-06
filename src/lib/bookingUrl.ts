// Booking / meeting link validation.
//
// Workspace-scoped setting. Strict: https only, no credentials, no javascript:
// or data: schemes, bounded length. Used before anything is written to the
// database, and mirrored by a database CHECK constraint.

export const BOOKING_URL_MAX = 500;

export interface BookingUrlResult {
  valid: boolean;
  /** Normalised https URL when valid. */
  url: string | null;
  error: string | null;
}

export function validateBookingUrl(raw: string | null | undefined): BookingUrlResult {
  const input = String(raw ?? "").trim();
  if (!input) return { valid: false, url: null, error: "Enter a booking link." };
  if (input.length > BOOKING_URL_MAX) {
    return { valid: false, url: null, error: `Booking links must be ${BOOKING_URL_MAX} characters or fewer.` };
  }
  if (/\s/.test(input)) return { valid: false, url: null, error: "A booking link cannot contain spaces." };

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { valid: false, url: null, error: "That does not look like a valid link." };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, url: null, error: "Booking links must start with https:// for security." };
  }
  if (parsed.username || parsed.password) {
    return { valid: false, url: null, error: "Booking links cannot contain a username or password." };
  }
  if (!parsed.hostname.includes(".") || parsed.hostname.endsWith(".")) {
    return { valid: false, url: null, error: "Enter a full domain, for example https://cal.com/your-name." };
  }
  const normalised = parsed.toString();
  if (normalised.length > BOOKING_URL_MAX) {
    return { valid: false, url: null, error: `Booking links must be ${BOOKING_URL_MAX} characters or fewer.` };
  }

  return { valid: true, url: normalised, error: null };
}

/** Where to send someone who has not configured a booking link yet. */
export const BOOKING_SETTING_PATH = "/app/settings#booking-link";
