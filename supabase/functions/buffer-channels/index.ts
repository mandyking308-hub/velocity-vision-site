import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getValidAccessToken, listAllChannels, loadBufferConfig } from "../_shared/buffer.ts";

// Returns the connected Buffer account's channels (safe metadata only) for an
// authenticated, actively entitled paid user. Free Preview is review-only.
// Tokens never leave the server.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

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

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: effectivePlan, error: planErr } = await admin.rpc("effective_plan_for_actions", { _user_id: user.id });
    if (planErr) {
      console.error("buffer-channels entitlement check failed", { message: planErr.message });
      return json({ error: "entitlement_check_failed" }, 500);
    }
    if (!(["starter", "growth", "agency"] as string[]).includes(String(effectivePlan ?? ""))) {
      return json({ error: "paid_plan_required", message: "Buffer handoff is available on paid plans." }, 403);
    }

    const config = loadBufferConfig();
    const token = await getValidAccessToken(admin, user.id, config);
    if (!token.ok) {
      const status = token.error === "not_configured" ? 503 : 400;
      return json({ error: token.error }, status);
    }

    const result = await listAllChannels(token.accessToken);
    if (!result.ok) {
      console.error("buffer-channels GraphQL failure", { message: result.message });
      return json({ error: "buffer_api_error" }, 502);
    }

    return json({ channels: result.channels });
  } catch (e) {
    console.error("buffer-channels error:", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
