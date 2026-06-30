
DO $$ BEGIN
  CREATE TYPE public.lead_follow_state AS ENUM (
    'none','due','overdue','replied','warm','dormant','bounced','suppressed','snoozed','in_pipeline','won','lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS follow_up_state public.lead_follow_state NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS opportunity_id uuid,
  ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS source_lead_id uuid,
  ADD COLUMN IF NOT EXISTS source_campaign_id uuid,
  ADD COLUMN IF NOT EXISTS workspace_id uuid,
  ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS stage_changed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reason_lost text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.lead_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  workspace_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lead_audit_log TO authenticated;
GRANT ALL ON public.lead_audit_log TO service_role;
ALTER TABLE public.lead_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_audit_select" ON public.lead_audit_log;
CREATE POLICY "lead_audit_select" ON public.lead_audit_log
  FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "lead_audit_insert" ON public.lead_audit_log;
CREATE POLICY "lead_audit_insert" ON public.lead_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_lead_audit_lead ON public.lead_audit_log(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_audit_user ON public.lead_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_follow_state ON public.leads(follow_up_state, follow_up_at);
CREATE INDEX IF NOT EXISTS idx_opps_owner_stage ON public.opportunities(owner_id, stage);
