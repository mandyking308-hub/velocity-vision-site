import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { encryptSecret } from "../_shared/email-crypto.ts";
import { smtpVerify } from "../_shared/smtp-send.ts";

const PROVIDER_DEFAULTS: Record<string, { host: string; port: number }> = {
  gmail: { host: "smtp.gmail.com", port: 587 },
  outlook: { host: "smtp.office365.com", port: 587 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const body = await req.json();
    const {
      id, // optional, update existing
      provider, from_email, from_name, display_name,
      smtp_host, smtp_port, smtp_username, smtp_password,
      workspace_id, is_default,
    } = body;

    if (!provider || !from_email || !smtp_username) {
      return json({ error: "missing required fields" }, 400);
    }

    const defaults = PROVIDER_DEFAULTS[provider as string] || { host: smtp_host, port: smtp_port || 587 };
    const host = smtp_host || defaults.host;
    const port = Number(smtp_port || defaults.port);

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify creds if password provided
    let status: "connected" | "error" = "connected";
    let last_error: string | null = null;
    let last_verified_at: string | null = null;
    if (smtp_password) {
      const v = await smtpVerify({ host, port, username: smtp_username, password: smtp_password });
      if (v.ok) {
        last_verified_at = new Date().toISOString();
      } else {
        status = "error";
        last_error = v.error || "SMTP verification failed";
      }
    }

    let connectionId = id;
    const row: any = {
      user_id: user.id, workspace_id: workspace_id || null,
      provider, from_email, from_name: from_name || null, display_name: display_name || null,
      smtp_host: host, smtp_port: port, smtp_username,
      is_default: !!is_default, status, last_error, last_verified_at,
    };

    if (connectionId) {
      const { error } = await admin.from("email_connections").update(row).eq("id", connectionId).eq("user_id", user.id);
      if (error) return json({ error: error.message }, 400);
    } else {
      const { data, error } = await admin.from("email_connections").insert(row).select("id").single();
      if (error) return json({ error: error.message }, 400);
      connectionId = data.id;
    }

    if (smtp_password) {
      const encrypted = await encryptSecret(smtp_password);
      await admin.from("email_connection_secrets").upsert({ connection_id: connectionId, encrypted_password: encrypted, updated_at: new Date().toISOString() });
    }

    if (is_default) {
      await admin.from("email_connections").update({ is_default: false }).eq("user_id", user.id).neq("id", connectionId);
    }

    return json({ id: connectionId, status, last_error });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
