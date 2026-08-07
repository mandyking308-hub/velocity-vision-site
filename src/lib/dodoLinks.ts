// Pure guard for hosted Dodo checkout links (client mirror of the edge helper
// in supabase/functions/_shared/dodo.ts). Both are covered by the same tests.

const DODO_CHECKOUT_HOST_SUFFIXES = ["dodopayments.com"];

export function isSafeDodoCheckoutLink(link: unknown): link is string {
  if (typeof link !== "string" || !link.trim()) return false;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return DODO_CHECKOUT_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}
