import { DestinationField } from "./destinationFields";

const PATTERNS: { field: DestinationField; tests: RegExp[] }[] = [
  { field: "first_name", tests: [/^first[\s_-]?name$/i, /^fname$/i, /^given$/i] },
  { field: "last_name", tests: [/^last[\s_-]?name$/i, /^lname$/i, /^surname$/i, /^family/i] },
  { field: "full_name", tests: [/^(full[\s_-]?)?name$/i, /^contact[\s_-]?name$/i, /^person/i] },
  { field: "email", tests: [/email/i, /e-?mail/i, /mail$/i] },
  { field: "phone", tests: [/phone/i, /mobile/i, /tel(ephone)?/i, /cell/i] },
  { field: "company_name", tests: [/company/i, /organi[sz]ation/i, /business/i, /account[\s_-]?name/i] },
  { field: "website", tests: [/website/i, /url/i, /domain/i, /site/i] },
  { field: "job_title", tests: [/title/i, /role/i, /position/i, /job/i] },
  { field: "country", tests: [/country/i, /nation/i] },
  { field: "language", tests: [/language/i, /^lang$/i, /locale/i] },
  { field: "source", tests: [/source/i, /channel/i, /origin/i] },
  { field: "notes", tests: [/notes?/i, /comment/i, /description/i, /about/i] },
];

export function detectField(header: string): DestinationField {
  const h = header.trim();
  if (!h) return "ignore";
  for (const { field, tests } of PATTERNS) {
    if (tests.some((re) => re.test(h))) return field;
  }
  return "ignore";
}

export function detectMapping(headers: string[]): Record<string, DestinationField> {
  const map: Record<string, DestinationField> = {};
  const used = new Set<DestinationField>();
  for (const h of headers) {
    let f = detectField(h);
    // avoid duplicate destinations (except ignore)
    if (f !== "ignore" && used.has(f)) f = "ignore";
    if (f !== "ignore") used.add(f);
    map[h] = f;
  }
  return map;
}
