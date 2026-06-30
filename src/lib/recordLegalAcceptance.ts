import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSIONS, CURRENT_LEGAL_VERSION } from "@/lib/legalVersions";

export type LegalAcceptanceSource =
  | "signup"
  | "workspace_create"
  | "plan_checkout"
  | "topup_checkout";

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
 * Record an explicit acceptance of the full legal stack against the
 * current authenticated user. Failure is logged but never thrown — the
 * UI must already have blocked the action when the checkbox is unticked.
 */
export async function recordLegalAcceptance({
  userId,
  email,
  source,
  workspaceId,
}: RecordArgs): Promise<void> {
  try {
    const ip = await fetchIp();
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;

    const v = (slug: string) => LEGAL_VERSIONS[slug]?.version ?? CURRENT_LEGAL_VERSION;

    const documentVersions: Record<string, string> = {};
    Object.keys(LEGAL_VERSIONS).forEach((slug) => {
      documentVersions[slug] = v(slug);
    });

    await supabase.from("legal_acceptances").insert({
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
  } catch (err) {
    console.error("Failed to record legal acceptance:", err);
  }
}
