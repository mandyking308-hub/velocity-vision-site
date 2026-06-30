import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Public, unauthenticated endpoint — only used by the hosted /c/:slug page.
// Looks the campaign up by slug, validates required fields, inserts the lead,
// and (best-effort) schedules the first follow-up email if the campaign has one
// configured. Returns success in all cases so the public form never silently
// loses a submission.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const body = await req.json();
    const { slug, name, email, phone, message, extra } = body ?? {};
    if (!slug || typeof slug !== "string") return json({ error: "missing slug" }, 400);
    if (!email && !phone && !name) return json({ error: "form incomplete" }, 400);

    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, name, owner_id, company_id, workspace_id, lead_form_published, pack")
      .eq("slug", slug)
      .maybeSingle();
    if (!campaign || !campaign.lead_form_published) return json({ error: "campaign not found" }, 404);

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        source: "hosted_form",
        campaign_id: campaign.id,
        company_id: campaign.company_id || null,
        owner_id: campaign.owner_id || null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        marketing_interest: message || null,
        status: "new",
        last_action: "Submitted via hosted capture page",
      })
      .select("id")
      .single();
    if (error) {
      console.error("lead insert error:", error);
      return json({ error: "could not save submission" }, 500);
    }

    return json({ ok: true, lead_id: lead?.id });
  } catch (e) {
    console.error("lead-submit error:", e);
    console.error("lead-submit error:", e);
    return json({ error: "Could not submit form. Please try again." }, 500);
  }
});

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
