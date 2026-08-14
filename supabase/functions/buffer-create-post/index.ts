import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  bufferGraphql,
  getValidAccessToken,
  listAllChannels,
  loadBufferConfig,
  markReconnectRequired,
} from "../_shared/buffer.ts";
import {
  CREATE_POST_MUTATION,
  buildCreatePostVariables,
  confirmationForResult,
  validateCreatePostRequest,
} from "../_shared/buffer-shared.ts";

// Sends a customer-reviewed text draft to Buffer as Draft / Queue / Schedule.
// Paid, actively entitled workspaces only: Free Preview is review-only.
// Never auto-publishes: the UI defaults to Draft, and Share Now is not
// supported here at all. The chosen channel must exist in the user's own
// current Buffer channels — arbitrary channel IDs are rejected.
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

    const parsed = validateCreatePostRequest(await req.json().catch(() => null));
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const post = parsed.value;

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: effectivePlan, error: planErr } = await admin.rpc("effective_plan_for_actions", { _user_id: user.id });
    if (planErr) {
      console.error("buffer-create-post entitlement check failed", { message: planErr.message });
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

    // Channel ownership validation against the user's CURRENT channels.
    const ch = await listAllChannels(token.accessToken);
    if (!ch.ok) {
      console.error("buffer-create-post channel lookup failure", { message: ch.message });
      return json({ error: "buffer_api_error" }, 502);
    }
    const channel = ch.channels.find((c) => c.id === post.channelId);
    if (!channel) return json({ error: "invalid_channel" }, 400);

    const variables = buildCreatePostVariables(post);
    const created = await bufferGraphql(token.accessToken, CREATE_POST_MUTATION, variables);
    if (!created.ok) {
      console.error("buffer-create-post GraphQL failure", { status: created.status, message: created.message });
      if (created.status === 401 || created.status === 403) {
        await markReconnectRequired(admin, token.connectionId, "Buffer connection expired. Reconnect to continue.");
        return json({ error: "reconnect_required" }, 400);
      }
      return json({ error: "buffer_api_error" }, 502);
    }

    const createdPost = created.data?.createPost?.post ?? null;
    const mutationError = created.data?.createPost?.message ?? null;
    if (!createdPost) {
      console.error("buffer-create-post rejected by Buffer", { message: mutationError });
      return json({ error: "buffer_rejected" }, 502);
    }

    const status = typeof createdPost.status === "string" ? createdPost.status : null;
    return json({
      ok: true,
      mode: post.mode,
      bufferStatus: status,
      message: confirmationForResult(post.mode, status),
      post: {
        id: typeof createdPost.id === "string" ? createdPost.id : null,
        status,
        dueAt: typeof createdPost.dueAt === "string" ? createdPost.dueAt : null,
      },
    });
  } catch (e) {
    console.error("buffer-create-post error:", e);
    return json({ error: "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
