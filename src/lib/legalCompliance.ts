import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSIONS } from "@/lib/legalVersions";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Required legal documents that MUST be at their current version
 * before a user can perform a governed / go-live action
 * (workspace creation, plan checkout, top-up checkout, activation,
 * campaign send). Slugs match `LEGAL_VERSIONS` in legalVersions.ts
 * and the corresponding /legal/:slug routes.
 */
export const REQUIRED_LEGAL_SLUGS = [
  "terms-of-service",
  "client-services-agreement",
  "privacy-policy",
  "data-processing-agreement",
  "acceptable-use-policy",
  "marketing-compliance-policy",
  "cookie-policy",
  "platform-security-policy",
  "service-level-agreement",
  "subprocessors",
] as const;

export type LegalSlug = (typeof REQUIRED_LEGAL_SLUGS)[number];

export const LEGAL_TITLES: Record<LegalSlug, string> = {
  "terms-of-service": "Platform Terms of Service",
  "client-services-agreement": "Customer / Client Services Agreement",
  "privacy-policy": "Privacy Policy",
  "data-processing-agreement": "Data Processing Agreement",
  "acceptable-use-policy": "Acceptable Use Policy",
  "marketing-compliance-policy": "Marketing Compliance Policy",
  "cookie-policy": "Cookie Policy",
  "platform-security-policy": "Platform Security Policy",
  "service-level-agreement": "Service Level Agreement",
  "subprocessors": "Subprocessor List",
};

export interface MissingDoc {
  slug: LegalSlug;
  title: string;
  currentVersion: string;
  acceptedVersion: string | null;
}

export interface LegalStatus {
  loading: boolean;
  isCompliant: boolean;
  missing: MissingDoc[];
  latestAcceptedAt: string | null;
}

/**
 * Compare the latest acceptance row's document_versions map against
 * the CURRENT versions declared in LEGAL_VERSIONS. Returns each
 * required doc where the accepted version is missing or outdated.
 * Never mutates prior rows — acceptance is append-only.
 */
export function computeLegalStatus(
  documentVersions: Record<string, string> | null | undefined,
): { isCompliant: boolean; missing: MissingDoc[] } {
  const accepted = documentVersions ?? {};
  const missing: MissingDoc[] = [];
  for (const slug of REQUIRED_LEGAL_SLUGS) {
    const current = LEGAL_VERSIONS[slug]?.version ?? "1.0";
    const acceptedVersion = accepted[slug] ?? null;
    if (acceptedVersion !== current) {
      missing.push({
        slug,
        title: LEGAL_TITLES[slug],
        currentVersion: current,
        acceptedVersion,
      });
    }
  }
  return { isCompliant: missing.length === 0, missing };
}

/**
 * Server-truth check: read the user's most recent legal_acceptance row
 * (append-only). Returns compliance and the missing/outdated doc list.
 */
export async function fetchLegalStatus(userId: string): Promise<LegalStatus> {
  const { data, error } = await supabase
    .from("legal_acceptances")
    .select("document_versions, accepted_at")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false })
    .limit(1);
  if (error) {
    return { loading: false, isCompliant: false, missing: [], latestAcceptedAt: null };
  }
  const row = data?.[0];
  const { isCompliant, missing } = computeLegalStatus(
    (row?.document_versions as Record<string, string> | null) ?? null,
  );
  return { loading: false, isCompliant, missing, latestAcceptedAt: row?.accepted_at ?? null };
}

export function useLegalStatus(deps: unknown[] = []) {
  const { user } = useAuth();
  const [status, setStatus] = useState<LegalStatus>({
    loading: true, isCompliant: false, missing: [], latestAcceptedAt: null,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setStatus({ loading: false, isCompliant: false, missing: [], latestAcceptedAt: null });
      return;
    }
    setStatus((s) => ({ ...s, loading: true }));
    const next = await fetchLegalStatus(user.id);
    setStatus(next);
  }, [user]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, refresh, ...deps]);

  return { ...status, refresh };
}
