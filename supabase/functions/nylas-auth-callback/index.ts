import { createClient } from "npm:@supabase/supabase-js@2";

// Public endpoint: Nylas redirects the user's browser here with ?code&state.
// We exchange the code for a grant, upsert an email_connections row (auth_type = 'nylas'),
// then redirect the user back into the app.
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const appOrigin = req.headers.get("origin")
    || Deno.env.get("APP_PUBLIC_ORIGIN")
    || "https://velocity-outreach.com";
  const settingsUrl = `${appOrigin.replace(/\/$/, "")}/app/settings/email`;

  function redirectBack(params: Record<string, string>) {
    const target = new URL(settingsUrl);
    for (const [k, v] of Object.entries(params)) target.searchParams.set(k, v);
    return Response.redirect(target.toString(), 302);
  }

  if (errorParam) return redirectBack({ nylas: "error", reason: errorParam });
  if (!code || !state) return redirectBack({ nylas: "error", reason: "missing_params" });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: stateRow, error: stateErr } = await admin
      .from("nylas_oauth_states")
      .select("*")
      .eq("state", state)
      .maybeSingle();
    if (stateErr || !stateRow) return redirectBack({ nylas: "error", reason: "unknown_state" });
    if (stateRow.consumed_at) return redirectBack({ nylas: "error", reason: "state_consumed" });
    if (new Date(stateRow.expires_at).getTime() < Date.now()) {
      return redirectBack({ nylas: "error", reason: "state_expired" });
    }

    const apiKey = Deno.env.get("NYLAS_EU_API_KEY");
    const clientId = Deno.env.get("NYLAS_EU_CLIENT_ID");
    const apiUri = (Deno.env.get("NYLAS_EU_API_URI") || "https://api.eu.nylas.com").replace(/\/$/, "");
    const callback = Deno.env.get("NYLAS_CALLBACK_URI");
    if (!apiKey || !clientId || !callback) {
      return redirectBack({ nylas: "error", reason: "nylas_not_configured" });
    }

    // Exchange code for grant
    const tokenRes = await fetch(`${apiUri}/v3/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: apiKey,
        grant_type: "authorization_code",
        code,
        redirect_uri: callback,
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson?.grant_id) {
      console.error("nylas token exchange failed", tokenRes.status, tokenJson);
      return redirectBack({ nylas: "error", reason: "token_exchange_failed" });
    }

    const grantId: string = tokenJson.grant_id;
    const providerFromNylas: string = tokenJson.provider || stateRow.provider || "google";
    const email: string | undefined = tokenJson.email;

    // Fetch grant details for a reliable email address if not returned in tokenJson.
    let fromEmail = email;
    if (!fromEmail) {
      const grantRes = await fetch(`${apiUri}/v3/grants/${grantId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const grantJson = await grantRes.json().catch(() => ({}));
      fromEmail = grantJson?.data?.email;
    }
    if (!fromEmail) return redirectBack({ nylas: "error", reason: "no_email_from_grant" });

    const domain = fromEmail.split("@")[1] || null;
    const localProvider = providerFromNylas === "microsoft" ? "outlook" : providerFromNylas;

    // Upsert the connection. Prefer to update an existing Nylas row for this user+email.
    const { data: existing } = await admin
      .from("email_connections")
      .select("id")
      .eq("user_id", stateRow.user_id)
      .eq("from_email", fromEmail)
      .eq("auth_type", "nylas")
      .maybeSingle();

    const row = {
      user_id: stateRow.user_id,
      workspace_id: stateRow.workspace_id,
      provider: localProvider,
      auth_type: "nylas",
      nylas_grant_id: grantId,
      nylas_provider: providerFromNylas,
      connected_via: "hosted_oauth",
      nylas_connected_at: new Date().toISOString(),
      nylas_disconnected_at: null,
      token_status: "active",
      from_email: fromEmail,
      domain,
      status: "connected",
      last_error: null,
      last_verified_at: new Date().toISOString(),
      // Sending stays disabled until DNS/DKIM verification passes.
      sending_enabled: false,
    };

    if (existing?.id) {
      await admin.from("email_connections").update(row).eq("id", existing.id);
    } else {
      await admin.from("email_connections").insert(row);
    }

    await admin
      .from("nylas_oauth_states")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", stateRow.id);

    const target = new URL(stateRow.redirect_to || settingsUrl);
    target.searchParams.set("nylas", "connected");
    target.searchParams.set("email", fromEmail);
    return Response.redirect(target.toString(), 302);
  } catch (e) {
    console.error("nylas-auth-callback error:", e);
    return redirectBack({ nylas: "error", reason: "internal_error" });
  }
});
