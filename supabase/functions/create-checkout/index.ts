import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, PRICE_CATALOG } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Allow-list of safe return paths the client may request. Anything else
// (including absolute URLs, protocol-relative URLs, or non-/app paths) is
// rejected and we fall back to /app/billing.
const ALLOWED_RETURN_PATHS = new Set<string>([
  "/app/billing",
  "/app/billing?checkout=success",
  "/app/billing?checkout=starter",
  "/app/billing?checkout=growth",
  "/app/billing?checkout=agency",
  "/app/billing?checkout=topup",
]);

function sanitiseReturnPath(input: unknown): string {
  if (typeof input !== "string") return "/app/billing?checkout=success";
  // Reject absolute or protocol-relative URLs and javascript: schemes.
  if (!input.startsWith("/app/")) return "/app/billing?checkout=success";
  if (input.startsWith("//")) return "/app/billing?checkout=success";
  if (/[\s\r\n]/.test(input)) return "/app/billing?checkout=success";
  // Strip any pre-existing session_id token; we re-append the Stripe placeholder.
  const clean = input.split("&session_id=")[0].split("?session_id=")[0];
  if (!ALLOWED_RETURN_PATHS.has(clean)) return "/app/billing?checkout=success";
  return clean;
}

function buildReturnUrl(origin: string, path: string): string {
  // Only allow origins that look like http(s)://host, never file:// or javascript:.
  const safeOrigin = /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin)
    ? origin
    : "https://velocity-outreach.com";
  const sep = path.includes("?") ? "&" : "?";
  return `${safeOrigin}${path}${sep}session_id={CHECKOUT_SESSION_ID}`;
}

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const c = existing.data[0];
      if (c.metadata?.userId !== options.userId) {
        await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId: options.userId } });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const { priceId, environment, returnUrl, refId, workspaceId } = await req.json();
    if (typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return json({ error: "invalid priceId" }, 400);
    }
    // Enforce internal catalog allow-list. Any priceId not in PRICE_CATALOG
    // (including currency-suffixed variants) is rejected before we ever call Stripe.
    if (!Object.prototype.hasOwnProperty.call(PRICE_CATALOG, priceId)) {
      return json({ error: "unknown priceId" }, 400);
    }
    if (environment !== "sandbox" && environment !== "live") return json({ error: "invalid env" }, 400);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user } } = token ? await supabase.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ error: "unauthorized" }, 401);

    // Server-side return URL construction. Client return path (if any) must be
    // a relative /app/... path from the safe allow-list; origin comes from the
    // request header, not from the client body.
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "https://velocity-outreach.com";
    // Extract a candidate path from returnUrl if the caller passed a legacy full URL
    let requestedPath: string | undefined;
    if (typeof returnUrl === "string") {
      try {
        const u = new URL(returnUrl, origin);
        // Only trust the pathname + a safe query string
        requestedPath = `${u.pathname}${u.search ? u.search : ""}`;
      } catch {
        requestedPath = undefined;
      }
    }
    const safePath = sanitiseReturnPath(requestedPath);
    const safeReturnUrl = buildReturnUrl(origin, safePath);

    const stripe = createStripeClient(environment as StripeEnv);

    let prices = await stripe.prices.list({ lookup_keys: [priceId] });
    let fellBackToBase = false;
    if (!prices.data.length) {
      const base = priceId.replace(/_(usd|eur|cad|aud|mxn|gbp)$/i, "");
      if (base !== priceId && Object.prototype.hasOwnProperty.call(PRICE_CATALOG, base)) {
        prices = await stripe.prices.list({ lookup_keys: [base] });
        fellBackToBase = prices.data.length > 0;
      }
    }
    if (!prices.data.length) return json({ error: "price not found" }, 404);
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const customerId = await resolveOrCreateCustomer(stripe, { email: user.email ?? undefined, userId: user.id });

    let productDescription: string | undefined;
    if (!isRecurring) {
      const productId = typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);
      productDescription = product.name;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: safeReturnUrl,
      customer: customerId,
      ...(!isRecurring && { payment_intent_data: { description: productDescription } }),
      metadata: {
        userId: user.id,
        priceId,
        currency_fallback: fellBackToBase ? "true" : "false",
        ...(refId && { refId }),
        ...(workspaceId && { workspaceId }),
      },
      ...(isRecurring && {
        subscription_data: {
          metadata: {
            userId: user.id,
            priceId,
            ...(workspaceId && { workspaceId }),
          },
        },
      }),
      managed_payments: { enabled: true },
    } as any);

    return json({ clientSecret: session.client_secret, currencyFallback: fellBackToBase });
  } catch (e) {
    console.error("create-checkout error:", e);
    return json({ error: "Unable to start checkout. Please try again or contact support." }, 500);
  }
});

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
