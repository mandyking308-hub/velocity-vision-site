import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const publishable = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, publishable, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const { connection_id } = await req.json().catch(() => ({}));
    if (!connection_id) return json({ error: "missing_connection_id" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: conn, error: fetchErr } = await admin
      .from("email_connections")
      .select("id, user_id, nylas_grant_id")
      .eq("id", connection_id)
      .maybeSingle();
    if (fetchErr || !conn) return json({ error: "not_found" }, 404);
    if (conn.user_id !== user.id) return json({ error: "forbidden" }, 403);

    if (conn.nylas_grant_id) {
      const apiKey = Deno.env.get("NYLAS_EU_API_KEY");
      const apiUri = (Deno.env.get("NYLAS_EU_API_URI") || "https://api.eu.nylas.com").replace(/\/$/, "");
      if (apiKey) {
        const res = await fetch(`${apiUri}/v3/grants/${conn.nylas_grant_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok && res.status !== 404) {
          console.warn("nylas grant delete non-ok:", res.status);
        }
      }
    }

    await admin.from("email_connections").update({
      nylas_grant_id: null,
      token_status: "revoked",
      nylas_disconnected_at: new Date().toISOString(),
      sending_enabled: false,
      status: "reconnect_required",
    }).eq("id", connection_id);

    return json({ ok: true });
  } catch (e) {
    console.error("nylas-disconnect error:", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
