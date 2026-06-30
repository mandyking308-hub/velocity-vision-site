import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Returns the public-safe slice of a campaign for /c/:slug — never leak the pack.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return json({ error: "missing slug" }, 400);

  const { data } = await supabase
    .from("campaigns")
    .select("id, name, slug, lead_form_published, lead_form_config, pack, goal")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || !data.lead_form_published) return json({ error: "not found" }, 404);

  // Whitelist what's exposed publicly
  const pack = (data as any).pack || {};
  const cfg = (data as any).lead_form_config || {};
  return json({
    id: data.id,
    name: data.name,
    slug: data.slug,
    headline: cfg.headline || pack?.landing?.headline || data.name,
    subheadline: cfg.subheadline || pack?.landing?.subheadline || "",
    formTitle: cfg.formTitle || pack?.leadCapture?.formTitle || "Get started",
    fields: cfg.fields || pack?.leadCapture?.fields || [
      { id: "name", label: "Full name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
    ],
    ctaLabel: cfg.ctaLabel || pack?.leadCapture?.ctaLabel || "Submit",
    thankYou: cfg.thankYou || pack?.leadCapture?.thankYou || "Thanks — we'll be in touch shortly.",
  });
});

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
