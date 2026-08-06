/**
 * Receives sanitised client-side error reports and stores them in error_logs.
 *
 * Hardening:
 *  - Strict payload schema, all fields truncated server-side.
 *  - Redaction re-applied server-side (never trust the client).
 *  - In-memory per-IP rate limit.
 *  - Nothing is echoed back to the caller.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { count: number; start: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  entry.count++;
  return entry.count > MAX_PER_WINDOW;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_RE = /https?:\/\/[^\s'"]+/g;
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const LONG_TOKEN_RE = /\b[A-Za-z0-9_\-.]{32,}\b/g;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(EMAIL_RE, "[email]")
    .replace(URL_RE, "[url]")
    .replace(UUID_RE, "[id]")
    .replace(LONG_TOKEN_RE, "[token]")
    .slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ accepted: false }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const raw = await req.text();
    if (raw.length > 4000) {
      return new Response(JSON.stringify({ accepted: false }), {
        status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = JSON.parse(raw) as Record<string, unknown>;
    const name = clean(body.name, 80) || "Error";
    const message = clean(body.message, 300);
    if (!message) {
      return new Response(JSON.stringify({ accepted: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const route = clean(body.route, 120);
    const stack = clean(body.stack, 600);
    const build = clean(body.build, 40);

    await supabase.from("error_logs").insert({
      category: "client_runtime",
      severity: "error",
      message: `${name}: ${message}`,
      details: `route=${route} build=${build} stack=${stack}`,
    });

    return new Response(JSON.stringify({ accepted: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("client-error-log failure:", e);
    return new Response(JSON.stringify({ accepted: false }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
