import type { MappedRow } from "./validate";

export type DuplicateStatus = "none" | "possible" | "likely" | "existing";

export interface ExistingContact {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name?: string | null;
}

export interface DuplicateResult {
  status: DuplicateStatus;
  duplicate_of_contact_id?: string;
}

function fullName(r: { first_name?: string | null; last_name?: string | null; full_name?: string }) {
  if (r.full_name) return r.full_name.trim().toLowerCase();
  return `${r.first_name || ""} ${r.last_name || ""}`.trim().toLowerCase();
}

export function buildDuplicateChecker(existing: ExistingContact[]) {
  const byEmail = new Map<string, ExistingContact>();
  const byNameCompany = new Map<string, ExistingContact>();
  for (const c of existing) {
    if (c.email) byEmail.set(c.email.toLowerCase().trim(), c);
    const k = `${fullName(c)}::${(c.company_name || "").toLowerCase().trim()}`;
    if (k.trim() !== "::" && k.length > 4) byNameCompany.set(k, c);
  }

  const seenEmailsInBatch = new Map<string, number>();
  const seenNameCompanyInBatch = new Map<string, number>();

  return function check(row: MappedRow, batchIndex: number): DuplicateResult {
    const email = (row.email || "").toLowerCase().trim();
    if (email && byEmail.has(email)) {
      return { status: "existing", duplicate_of_contact_id: byEmail.get(email)!.id };
    }
    if (email && seenEmailsInBatch.has(email)) {
      return { status: "likely" };
    }
    const nc = `${fullName(row as any)}::${(row.company_name || "").toLowerCase().trim()}`;
    if (nc.trim() !== "::" && byNameCompany.has(nc)) {
      return { status: "possible", duplicate_of_contact_id: byNameCompany.get(nc)!.id };
    }
    if (nc.trim() !== "::" && seenNameCompanyInBatch.has(nc)) {
      return { status: "possible" };
    }
    if (email) seenEmailsInBatch.set(email, batchIndex);
    if (nc.trim() !== "::") seenNameCompanyInBatch.set(nc, batchIndex);
    return { status: "none" };
  };
}
