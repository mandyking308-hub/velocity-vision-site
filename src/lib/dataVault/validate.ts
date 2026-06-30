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
const ROLE_LOCAL = ["info", "admin", "sales", "support", "noreply", "no-reply", "contact", "hello", "team", "office", "marketing", "press"];
const FREE_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com", "live.com", "msn.com"];

export function validateRow(r: MappedRow): ValidationResult {
  const issues: string[] = [];
  const email = (r.email || "").trim().toLowerCase();
  const hasName = !!(r.full_name || r.first_name || r.last_name);
  const hasCompany = !!r.company_name;

  let status: QualityStatus = "valid";

  if (!email) {
    issues.push("Missing email");
    status = "needs_review";
  } else if (!EMAIL_RE.test(email)) {
    issues.push("Email format looks invalid");
    status = "risky";
  } else {
    const [local, domain] = email.split("@");
    if (ROLE_LOCAL.includes(local)) {
      issues.push("Role-based address (info@, admin@, etc.)");
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

  // Blocked: malformed email AND no name AND no company
  if (email && !EMAIL_RE.test(email) && !hasName && !hasCompany) {
    status = "blocked";
  }
  if (!email && !hasName && !hasCompany) {
    status = "blocked";
    issues.push("Row is effectively empty");
  }

  return { status, issues };
}

const ORDER: QualityStatus[] = ["valid", "needs_review", "risky", "blocked"];
function worse(a: QualityStatus, b: QualityStatus): QualityStatus {
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}
