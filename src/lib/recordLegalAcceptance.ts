import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSIONS, CURRENT_LEGAL_VERSION } from "@/lib/legalVersions";

export type LegalAcceptanceSource =
  | "signup"
  | "workspace_create"
  | "plan_checkout"
  | "topup_checkout"
  | "activation"
  | "campaign_send"
  | "human_review_checkout";

interface RecordArgs {
  userId: string;
  email?: string | null;
  source: LegalAcceptanceSource;
  workspaceId?: string | null;
}

async function fetchIp(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data?.ip ?? null;
  } catch {
    return null;
  }
}

/**
 * Record an explicit acceptance of the full legal stack for the current
 * authenticated user. FAIL-CLOSED: throws if the database insert fails so
 * callers must not proceed with the governed action.
 *
 * IP / user-agent capture is best-effort and never blocks. The database
 * insert is append-only — existing acceptance rows are never modified.
 */
export async function recordLegalAcceptance({
  userId,
  email,
  source,
  workspaceId,
}: RecordArgs): Promise<void> {
  // Best-effort context — must never block.
  let ip: string | null = null;
  let ua: string | null = null;
  try { ip = await fetchIp(); } catch { ip = null; }
  try { ua = typeof navigator !== "undefined" ? navigator.userAgent : null; } catch { ua = null; }

  const v = (slug: string) => LEGAL_VERSIONS[slug]?.version ?? CURRENT_LEGAL_VERSION;

  const documentVersions: Record<string, string> = {};
  Object.keys(LEGAL_VERSIONS).forEach((slug) => {
    documentVersions[slug] = v(slug);
  });

  const { error } = await supabase.from("legal_acceptances").insert({
    user_id: userId,
    email: email ?? null,
    account_type: "business",
    legal_version: CURRENT_LEGAL_VERSION,
    ip_address: ip,
    user_agent: ua,
    source,
    workspace_id: workspaceId ?? null,
    document_versions: documentVersions,
    accepted_terms_version: v("terms-of-service"),
    accepted_customer_agreement_version: v("client-services-agreement"),
    accepted_dpa_version: v("data-processing-agreement"),
    accepted_privacy_version: v("privacy-policy"),
    accepted_aup_version: v("acceptable-use-policy"),
    accepted_marketing_compliance_version: v("marketing-compliance-policy"),
    accepted_cookie_policy_version: v("cookie-policy"),
    accepted_security_policy_version: v("platform-security-policy"),
    accepted_sla_version: v("service-level-agreement"),
  } as never);

  if (error) {
    console.error("Failed to record legal acceptance:", error);
    throw new Error(
      "We could not record your legal acceptance. Please try again.",
    );
  }
}
