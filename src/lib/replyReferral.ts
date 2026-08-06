// Referral + out-of-office intelligence.
//
// Pure, deterministic extraction helpers. These NEVER create a contact, never
// resume a sequence and never send anything. They only surface a suggestion
// that a human must confirm.

export interface ReferralSuggestion {
  /** True only when referral phrasing AND a usable name or email are present. */
  hasReferral: boolean;
  name: string | null;
  email: string | null;
  /** The matched phrase, shown to the operator so the read is explainable. */
  phrase: string | null;
}

const EMAIL_RX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// Capitalised human-looking names, 1–3 words. Deliberately conservative:
// "our ops lead" or "the finance team" must NOT be treated as a named referral.
const NAME = "([A-Z][a-z]{1,20}(?:['\\-][A-Za-z]{1,20})?(?:\\s+[A-Z][a-z]{1,20}){0,2})";

const REFERRAL_PATTERNS: RegExp[] = [
  new RegExp(`\\bthe right person (?:is|would be|to (?:speak|talk) to is)\\s+${NAME}`),
  new RegExp(`\\byou (?:should|need to|might want to|can)?\\s*(?:speak|talk)\\s+(?:to|with)\\s+${NAME}`),
  new RegExp(`\\b(?:please\\s+)?(?:speak|talk)\\s+(?:to|with)\\s+${NAME}`),
  new RegExp(`\\b(?:please\\s+)?(?:contact|email|reach out to|reach)\\s+${NAME}`),
  new RegExp(`\\b(?:copying|cc'?ing|looping)\\s+in\\s+${NAME}`),
  new RegExp(`\\b(?:i'?ve|i have)\\s+(?:copied|cc'?d|introduced)\\s+${NAME}`),
  new RegExp(`\\b${NAME}\\s+(?:is|would be|handles?|looks after|owns)\\s+(?:the\\s+)?(?:right person|best person|this|that)`),
];

// Phrasing that signals a redirect even without a capitalised name — used to
// pick up an email-only referral ("please email ops@acme.com").
const REDIRECT_HINT =
  /\b(right person|speak to|talk to|contact|reach out to|copying in|cc'?ing in|looping in|forwarded (?:this|it) (?:to|on)|redirect)\b/i;

/** Words that look capitalised but are never a person's name. */
const NAME_STOPWORDS = new Set([
  "i", "we", "our", "the", "please", "hi", "hello", "thanks", "regards", "kind",
  "best", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  "sunday", "january", "february", "march", "april", "may", "june", "july",
  "august", "september", "october", "november", "december", "support", "sales",
  "info", "team", "ltd", "limited", "inc",
  // Interrogatives and pronouns read as capitalised words at the start of a
  // sentence ("Who is the right person?") but are never a referred person.
  "who", "what", "which", "someone", "anyone", "nobody", "he", "she", "they",
  "this", "that", "there", "it", "you", "your", "my", "me", "us", "unfortunately",
]);


function cleanName(raw: string | undefined | null): string | null {
  const v = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!v) return null;
  const words = v.split(" ");
  if (words.some((w) => NAME_STOPWORDS.has(w.toLowerCase()))) return null;
  if (v.length > 60) return null;
  return v;
}

/**
 * Extract a suggested referred person. Returns `hasReferral: false` unless a
 * name or email is clearly present — a vague redirect is not a referral.
 */
export function extractReferral(text: string | null | undefined): ReferralSuggestion {
  const body = String(text ?? "").trim();
  const empty: ReferralSuggestion = { hasReferral: false, name: null, email: null, phrase: null };
  if (body.length < 3) return empty;

  let name: string | null = null;
  let phrase: string | null = null;

  for (const rx of REFERRAL_PATTERNS) {
    const m = body.match(rx);
    if (!m) continue;
    const candidate = cleanName(m[1]);
    if (!candidate) continue;
    name = candidate;
    phrase = m[0].trim().slice(0, 80);
    break;
  }

  const emailMatch = body.match(EMAIL_RX);
  const email = emailMatch ? emailMatch[0].toLowerCase() : null;

  const redirect = REDIRECT_HINT.test(body);
  if (!name && !(email && redirect)) return empty;

  if (!phrase && redirect) {
    const hint = body.match(REDIRECT_HINT);
    phrase = hint ? hint[0] : null;
  }

  return { hasReferral: true, name, email, phrase };
}

/* ------------------------------------------------------------------ */
/* Out-of-office return dates                                          */
/* ------------------------------------------------------------------ */

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
  september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};

function iso(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Extract a clearly-stated return date from an out-of-office reply.
 * Returns an ISO date (yyyy-mm-dd) or null when nothing is stated clearly.
 * Never guesses: ambiguous text returns null so the operator decides.
 */
export function extractReturnDate(
  text: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const body = String(text ?? "");
  if (body.trim().length < 3) return null;

  const lead = /\b(back|return(?:ing)?|returns|away|out of (?:the )?office|unavailable)\b[^.\n]{0,60}?/i;

  // 1. ISO date: "back on 2026-08-12"
  const isoM = body.match(new RegExp(lead.source + "(\\d{4})-(\\d{2})-(\\d{2})", "i"));
  if (isoM) {
    const d = new Date(Date.UTC(+isoM[2], +isoM[3] - 1, +isoM[4]));
    if (!Number.isNaN(d.getTime())) return iso(d);
  }

  // 2. Numeric day/month: "back on 12/08/2026" or "12/08" (day-first).
  const numM = body.match(new RegExp(lead.source + "(\\d{1,2})[/.](\\d{1,2})(?:[/.](\\d{2,4}))?", "i"));
  if (numM) {
    const day = +numM[2];
    const month = +numM[3] - 1;
    let year = numM[4] ? +numM[4] : now.getUTCFullYear();
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
      let d = new Date(Date.UTC(year, month, day));
      if (!numM[4] && d.getTime() < now.getTime()) d = new Date(Date.UTC(year + 1, month, day));
      return iso(d);
    }
  }

  // 3. "12 August" / "12th of August 2026" / "August 12"
  const monthNames = Object.keys(MONTHS).join("|");
  const dm = body.match(
    new RegExp(lead.source + `(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthNames})\\b(?:\\s+(\\d{4}))?`, "i"),
  );
  const md = dm
    ? null
    : body.match(new RegExp(lead.source + `(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:\\s+(\\d{4}))?`, "i"));
  if (dm || md) {
    const day = dm ? +dm[2] : +md![3];
    const month = MONTHS[(dm ? dm[3] : md![2]).toLowerCase()];
    const explicitYear = dm ? dm[4] : md![4];
    let year = explicitYear ? +explicitYear : now.getUTCFullYear();
    let d = new Date(Date.UTC(year, month, day));
    if (!explicitYear && d.getTime() < now.getTime()) d = new Date(Date.UTC(year + 1, month, day));
    return iso(d);
  }

  // 4. Weekday: "back on Monday" → the next such weekday after today.
  const wd = body.match(new RegExp(lead.source + `(${Object.keys(WEEKDAYS).join("|")})\\b`, "i"));
  if (wd) {
    const target = WEEKDAYS[wd[2].toLowerCase()];
    const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let delta = (target - base.getUTCDay() + 7) % 7;
    if (delta === 0) delta = 7;
    return iso(new Date(base.getTime() + delta * 86400000));
  }

  return null;
}

/** Human label for an extracted return date. Empty string when unknown. */
export function describeReturnDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return `Follow up on or after ${d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}
