// Lightweight conversion event tracker for upgrade nudges.
// Fire-and-forget: never blocks UI, never throws. No PII in payloads.
import { supabase } from "@/integrations/supabase/client";

export type UpgradeEventName =
  | "upgrade_nudge_viewed"
  | "upgrade_nudge_dismissed"
  | "upgrade_nudge_clicked_buy_credits"
  | "upgrade_nudge_clicked_upgrade"
  | "free_preview_contact_gate_hit"
  | "free_preview_campaign_gate_hit"
  | "free_preview_export_gate_hit"
  | "free_preview_sending_gate_hit"
  | "topup_checkout_started"
  | "growth_checkout_started";

export interface UpgradeEventPayload {
  reason?: string;
  plan?: string;
  workspaceId?: string | null;
  isTest?: boolean;
  meta?: Record<string, unknown>;
}

// Heuristic: identifies internal test accounts so metrics stay clean.
function looksInternal(email?: string | null) {
  if (!email) return false;
  const e = email.toLowerCase();
  return /(qa|test|demo|sandbox|internal|founder)/.test(e) || e.endsWith("@example.com");
}

export async function trackUpgradeEvent(event: UpgradeEventName, payload: UpgradeEventPayload = {}) {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;
    const isTest = payload.isTest ?? looksInternal(user.email);
    const route = typeof window !== "undefined" ? window.location.pathname : null;
    await supabase.from("upgrade_events").insert({
      user_id: user.id,
      workspace_id: payload.workspaceId ?? null,
      plan: payload.plan ?? null,
      event,
      reason: payload.reason ?? null,
      route,
      is_test: isTest,
      meta: (payload.meta ?? {}) as any,
    });
  } catch {
    /* ignore — never block UI on analytics */
  }
}
