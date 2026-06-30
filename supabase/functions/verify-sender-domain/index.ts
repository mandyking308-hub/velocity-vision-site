// Real DNS verification for SPF + DKIM on a sender domain.
// Auth: requires a signed-in user. Updates email_connections row owned by them.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Result {
  domain: string;
  spf_status: "valid" | "invalid" | "missing" | "error";
  dkim_status: "valid" | "invalid" | "missing" | "error";
  spf_records: string[];
  dkim_selectors_checked: string[];
  dkim_records: Record<string, string>;
  errors: string[];
  verified: boolean;
}

async function resolveTxt(name: string): Promise<string[]> {
  try {
    const rec = await Deno.resolveDns(name, "TXT");
    return rec.map((parts) => (Array.isArray(parts) ? parts.join("") : String(parts)));
  } catch (_e) {
    return [];
  }
}

// Common provider selectors. We check whichever returns a v=DKIM1 record.
const DEFAULT_SELECTORS = [
  "default", "google", "selector1", "selector2",
  "k1", "k2", "mandrill", "mxvault", "sendgrid", "s1", "s2",
  "smtp", "dkim", "zoho", "fm1", "fm2", "fm3", "protonmail",
];

async function verifyDomain(domain: string, extraSelectors: string[] = []): Promise<Result> {
  const errors: string[] = [];
  const out: Result = {
    domain,
    spf_status: "missing",
    dkim_status: "missing",
    spf_records: [],
    dkim_selectors_checked: [],
    dkim_records: {},
    errors,
    verified: false,
  };

  // SPF — TXT on apex starting with v=spf1
  try {
    const txts = await resolveTxt(domain);
    const spf = txts.filter((t) => t.toLowerCase().startsWith("v=spf1"));
    out.spf_records = spf;
    if (spf.length === 0) out.spf_status = "missing";
    else if (spf.length > 1) { out.spf_status = "invalid"; errors.push("Multiple SPF records found — only one is allowed."); }
    else out.spf_status = "valid";
  } catch (e) {
    out.spf_status = "error";
    errors.push(`SPF lookup error: ${(e as Error).message}`);
  }

  // DKIM — try known selectors
  const selectors = Array.from(new Set([...extraSelectors, ...DEFAULT_SELECTORS]));
  for (const sel of selectors) {
    const host = `${sel}._domainkey.${domain}`;
    out.dkim_selectors_checked.push(sel);
    const txts = await resolveTxt(host);
    const joined = txts.join("");
    if (joined && /v=DKIM1/i.test(joined)) {
      out.dkim_records[sel] = joined;
    }
  }
  if (Object.keys(out.dkim_records).length === 0) {
    out.dkim_status = "missing";
  } else {
    out.dkim_status = "valid";
  }

  out.verified = out.spf_status === "valid" && out.dkim_status === "valid";
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const connectionId: string | undefined = body.connection_id;
    let domain: string | undefined = body.domain;
    const extraSelectors: string[] = Array.isArray(body.selectors) ? body.selectors : [];

    const admin = createClient(SUPABASE_URL, SERVICE);

    // If a connection_id is provided, ensure it belongs to the caller and derive the domain
    let target: any = null;
    if (connectionId) {
      const { data } = await admin.from("email_connections").select("*").eq("id", connectionId).eq("user_id", userId).maybeSingle();
      if (!data) {
        return new Response(JSON.stringify({ error: "Connection not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      target = data;
      if (!domain && data.from_email) domain = String(data.from_email).split("@")[1];
    }

    if (!domain) {
      return new Response(JSON.stringify({ error: "Missing domain" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    domain = domain.trim().toLowerCase();

    const result = await verifyDomain(domain, extraSelectors);

    if (target) {
      await admin.from("email_connections").update({
        spf_status: result.spf_status,
        dkim_status: result.dkim_status,
        domain_verified_at: result.verified ? new Date().toISOString() : null,
        domain_verification_details: result,
      }).eq("id", target.id);
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
