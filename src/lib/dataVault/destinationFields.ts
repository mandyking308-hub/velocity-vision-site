export type DestinationField =
  | "first_name"
  | "last_name"
  | "full_name"
  | "email"
  | "phone"
  | "company_name"
  | "website"
  | "job_title"
  | "country"
  | "language"
  | "source"
  | "notes"
  | "ignore";

export const DESTINATION_FIELDS: { value: DestinationField; label: string }[] = [
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "full_name", label: "Full name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company_name", label: "Company name" },
  { value: "website", label: "Website" },
  { value: "job_title", label: "Job title" },
  { value: "country", label: "Country" },
  { value: "language", label: "Language" },
  { value: "source", label: "Source" },
  { value: "notes", label: "Notes" },
  { value: "ignore", label: "— Ignore this column —" },
];

export const FIELD_LABEL: Record<DestinationField, string> = Object.fromEntries(
  DESTINATION_FIELDS.map((f) => [f.value, f.label])
) as Record<DestinationField, string>;
