// Real DNS verification for MX + SPF + DKIM + DMARC on a sender domain.
// Sender verification can enable live sending, so it is restricted to an
// actively entitled paid plan before any DNS checks or connection mutation.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type DnsStatus = "valid" | "invalid" | "missing" | "error" | "unknown";

interface Result {
  domain: string;
  mx_status: DnsStatus;
  spf_status: DnsStatus;
  dkim_status: DnsStatus;
  dmarc_status: DnsStatus;
  mx_records: string[];
  spf_records: string[];
  dkim_selectors_checked: string[];
  dkim_configured_selectors: string[];
  dkim_detected_selectors: string[];
  dkim_matched_selectors: string[];
  dkim_records: Record<string, string>;
  dmarc_records: string[];
  errors: string[];
  verified: boolean;
  verification_status: "verified" | "needs_dns_setup" | "failed" | "checking";
  sending_enabled: boolean;
}

async function resolveTxt(name: string): Promise<string[]> {
  try {
    const rec = await Deno.resolveDns(name, "TXT");
    return rec.map((parts) => (Array.isArray(parts) ? parts.join("") : String(parts)));
  } catch (_e) { return []; }
}
async function resolveMx(name: string): Promise<{ preference: number; exchange: string }[]> {
  try { return await Deno.resolveDns(name, "MX") as any; } catch (_e) { return []; }
}

const PROVIDER_SELECTORS: Record<string, string[]> = {
  "smtp.gmail.com": ["google"],
  "smtp.office365.com": ["selector1", "selector2"],
};

const FALLBACK_PROBE_SELECTORS = [
  "default", "google", "selector1", "selector2", "k1", "k2",
  "mandrill", "mxvault", "sendgrid", "s1", "s2",
  "smtp", "dkim", "zoho", "fm1", "fm2", "fm3", "protonmail",
];

async function verifyDomain(
  domain: string,
  smtpHost: string | null,
  configuredSelectors: string[],
): Promise<Result> {
  const errors: string[] = [];
  const out: Result = {
    domain,
    mx_status: "missing", spf_status: "missing", dkim_status: "missing", dmarc_status: "missing",
    mx_records: [], spf_records: [],
    dkim_selectors_checked: [], dkim_configured_selectors: [...configuredSelectors],
    dkim_detected_selectors: [], dkim_matched_selectors: [],
    dkim_records: {}, dmarc_records: [],
    errors, verified: false, verification_status: "needs_dns_setup", sending_enabled: false,
  };

  try {
    const mx = await resolveMx(domain);
    out.mx_records = mx.map((m) => `${m.preference} ${m.exchange}`);
    out.mx_status = mx.length > 0 ? "valid" : "missing";
  } catch (e) { out.mx_status = "error"; errors.push(`MX lookup: ${(e as Error).message}`); }

  try {
    const txts = await resolveTxt(domain);
    const spf = txts.filter((t) => t.toLowerCase().startsWith("v=spf1"));
    out.spf_records = spf;
    if (spf.length === 0) out.spf_status = "missing";
    else if (spf.length > 1) { out.spf_status = "invalid"; errors.push("Multiple SPF records found — only one is allowed."); }
    else out.spf_status = "valid";
  } catch (e) { out.spf_status = "error"; errors.push(`SPF lookup: ${(e as Error).message}`); }

  try {
    const txts = await resolveTxt(`_dmarc.${domain}`);
    const dmarc = txts.filter((t) => /v=DMARC1/i.test(t));
    out.dmarc_records = dmarc;
    out.dmarc_status = dmarc.length > 0 ? "valid" : "missing";
  } catch (e) { out.dmarc_status = "error"; errors.push(`DMARC lookup: ${(e as Error).message}`); }

  const providerKnown = smtpHost && PROVIDER_SELECTORS[smtpHost] ? PROVIDER_SELECTORS[smtpHost] : [];
  const trusted = Array.from(new Set([...providerKnown, ...configuredSelectors].map((s) => s.trim()).filter(Boolean)));
  const probes = Array.from(new Set([...trusted, ...FALLBACK_PROBE_SELECTORS]));

  for (const sel of probes) {
    out.dkim_selectors_checked.push(sel);
    const txts = await resolveTxt(`${sel}._domainkey.${domain}`);
    const joined = txts.join("");
    if (joined && /v=DKIM1/i.test(joined)) {
      out.dkim_records[sel] = joined;
      out.dkim_detected_selectors.push(sel);
      if (trusted.includes(sel)) out.dkim_matched_selectors.push(sel);
    }
  }

  if (out.dkim_matched_selectors.length > 0) {
    out.dkim_status = "valid";
  } else if (trusted.length === 0) {
    out.dkim_status = "unknown";
    errors.push(
      out.dkim_detected_selectors.length > 0
        ? `DKIM records were detected at selector(s) ${out.dkim_detected_selectors.join(", ")}, but no selector is configured for this sender. Enter the DKIM selector supplied by your email provider to confirm.`
        : "DKIM selector required — enter the selector supplied by your email provider."
    );
  } else {
    out.dkim_status = "missing";
    errors.push(`Expected DKIM at selector(s) ${trusted.join(", ")} but no matching DKIM record was found.`);
  }

  const allOk = out.mx_status === "valid"
    && out.spf_status === "valid"
    && out.dkim_status === "valid"
    && out.dmarc_status === "valid";

  out.verified = allOk;
  out.sending_enabled = allOk;
  out.verification_status = allOk
    ? "verified"
    : (out.mx_status === "error" || out.spf_status === "error" || out.dmarc_status === "error")
      ? "failed"
      : "needs_dns_setup";

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: effectivePlan, error: planErr } = await admin.rpc("effective_plan_for_actions", { _user_id: userId });
    if (planErr) {
      console.error("verify-sender-domain entitlement check failed", { message: planErr.message });
      return json({ error: "entitlement_check_failed" }, 500);
    }
    if (!(["starter", "growth", "agency"] as string[]).includes(String(effectivePlan ?? ""))) {
      return json({ error: "paid_plan_required", message: "Sender verification is available on paid plans." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const connectionId: string | undefined = body.connection_id;
    const workspaceId: string | undefined = body.workspace_id;
    let domain: string | undefined = body.domain;
    const requestSelectors: string[] = Array.isArray(body.selectors)
      ? body.selectors.filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
      : [];
    const persistSelector: string | undefined = typeof body.persist_selector === "string" && body.persist_selector.trim()
      ? body.persist_selector.trim()
      : undefined;

    let target: any = null;
    if (connectionId) {
      const { data } = await admin.from("email_connections").select("*").eq("id", connectionId).eq("user_id", userId).maybeSingle();
      if (!data) return json({ error: "Connection not found" }, 404);
      if (workspaceId && data.workspace_id && data.workspace_id !== workspaceId) {
        return json({ error: "Connection does not belong to the active workspace" }, 403);
      }
      target = data;
      if (!domain && data.from_email) domain = String(data.from_email).split("@")[1];
    }
    if (!domain) return json({ error: "Missing domain" }, 400);
    domain = domain.trim().toLowerCase();

    if (target && persistSelector) {
      const existing: string[] = Array.isArray(target.dkim_selectors) ? target.dkim_selectors : [];
      const merged = Array.from(new Set([...existing, persistSelector]));
      await admin.from("email_connections").update({
        dkim_selector: persistSelector,
        dkim_selectors: merged,
      }).eq("id", target.id);
      target.dkim_selector = persistSelector;
      target.dkim_selectors = merged;
    }

    const configuredSelectors: string[] = [];
    if (target?.dkim_selector) configuredSelectors.push(String(target.dkim_selector));
    if (Array.isArray(target?.dkim_selectors)) for (const s of target.dkim_selectors) if (typeof s === "string") configuredSelectors.push(s);
    for (const s of requestSelectors) configuredSelectors.push(s);

    if (target) {
      await admin.from("email_connections").update({
        verification_status: "checking", dns_checked_at: new Date().toISOString(), domain,
      }).eq("id", target.id);
    }

    const result = await verifyDomain(domain, target?.smtp_host ?? null, configuredSelectors);

    if (target) {
      await admin.from("email_connections").update({
        domain,
        mx_status: result.mx_status,
        spf_status: result.spf_status,
        dkim_status: result.dkim_status,
        dmarc_status: result.dmarc_status,
        dns_checked_at: new Date().toISOString(),
        verification_errors: {
          errors: result.errors,
          dkim_selectors_checked: result.dkim_selectors_checked,
          dkim_detected_selectors: result.dkim_detected_selectors,
          dkim_matched_selectors: result.dkim_matched_selectors,
          dkim_configured_selectors: result.dkim_configured_selectors,
        },
        domain_verified_at: result.verified ? new Date().toISOString() : null,
        verification_status: result.verification_status,
        sending_enabled: result.sending_enabled,
        domain_verification_details: result,
      }).eq("id", target.id);
    }

    return json(result);
  } catch (e) {
    console.error("verify-sender-domain error:", e);
    return json({ error: "Domain verification failed. Please try again." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
