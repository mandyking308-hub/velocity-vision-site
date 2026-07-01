import type { QualityResult } from "@/lib/campaignQuality";

const CUSTOMER_MESSAGE =
  "Generation quality check failed. We didn't save this pack and no credits were used. Please try again.";

function isDebug(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("debug");
  } catch {
    return false;
  }
}

export function formatQualityFailure(quality: QualityResult): { title: string; description: string } {
  // Always log full details for founder/dev inspection.
  // eslint-disable-next-line no-console
  console.warn("[campaign quality] failed", quality.issues);

  const first = quality.issues[0];
  if (isDebug() && first) {
    const where = first.where ? ` @ ${first.where}` : "";
    return {
      title: "Campaign quality check failed",
      description: `${first.code}${where}: ${first.message}`,
    };
  }

  return {
    title: "Campaign quality check failed",
    description: CUSTOMER_MESSAGE,
  };
}
