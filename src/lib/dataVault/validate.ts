export type QualityStatus = "valid" | "needs_review" | "risky" | "blocked";

export interface MappedRow {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  website?: string;
  job_title?: string;
  country?: string;
  language?: string;
  source?: string;
  notes?: string;
}

export interface ValidationResult {
  status: QualityStatus;
  issues: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLE_LOCAL = ["info", "admin", "sales", "support", "noreply", "no-reply", "contact", "hello", "team", "office", "marketing", "press", "help", "billing", "accounts"];
const FREE_DOMAINS = ["gmail.com", "googlemail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "live.com", "msn.com", "me.com", "protonmail.com", "proton.me"];
const DISPOSABLE_DOMAINS = ["mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "trashmail.com", "yopmail.com", "throwawaymail.com", "getnada.com"];
// Common typos of major providers → risky.
const TYPO_DOMAINS = ["gnail.com", "gmial.com", "gmai.com", "gmil.com", "yhaoo.com", "yaho.com", "hotnail.com", "hotmial.com", "outllok.com", "outlok.com"];

export function validateRow(r: MappedRow): ValidationResult {
  const issues: string[] = [];
  const email = (r.email || "").trim().toLowerCase();
  const hasName = !!(r.full_name || r.first_name || r.last_name);
  const hasCompany = !!(r.company_name && r.company_name.trim());

  let status: QualityStatus = "valid";

  // Empty row: nothing to work with.
  if (!email && !hasName && !hasCompany) {
    return { status: "blocked", issues: ["Row is effectively empty"] };
  }

  if (!email) {
    issues.push("Missing email");
    // No email means we cannot send. Blocked unless there is something else usable
    // (name + company can still be researched manually), which stays as needs_review.
    status = hasName || hasCompany ? "needs_review" : "blocked";
  } else if (!EMAIL_RE.test(email)) {
    issues.push("Email format looks invalid");
    status = "risky";
    if (!hasName && !hasCompany) status = "blocked";
  } else {
    const [local, domain] = email.split("@");
    if (ROLE_LOCAL.includes(local)) {
      issues.push("Role-based address (info@, admin@, etc.)");
      status = worse(status, "risky");
    }
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      issues.push("Disposable email domain");
      status = worse(status, "risky");
    }
    if (TYPO_DOMAINS.includes(domain)) {
      issues.push("Likely typo of a major provider domain");
      status = worse(status, "risky");
    }
    if (FREE_DOMAINS.includes(domain) && !hasCompany) {
      issues.push("Free email with no company");
      status = worse(status, "needs_review");
    }
    if (!/\.[a-z]{2,}$/i.test(domain)) {
      issues.push("Suspicious domain");
      status = worse(status, "risky");
    }
  }

  if (!hasName) {
    issues.push("Missing name");
    status = worse(status, "needs_review");
  }
  if (!hasCompany) {
    issues.push("Missing company");
    status = worse(status, "needs_review");
  }

  // "valid" must mean truly safe-to-send: real email AND at least one identifier
  // (name or company). Anything less is at best needs_review.
  if (status === "valid" && (!email || (!hasName && !hasCompany))) {
    status = "needs_review";
  }

  return { status, issues };
}

const ORDER: QualityStatus[] = ["valid", "needs_review", "risky", "blocked"];
function worse(a: QualityStatus, b: QualityStatus): QualityStatus {
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}

