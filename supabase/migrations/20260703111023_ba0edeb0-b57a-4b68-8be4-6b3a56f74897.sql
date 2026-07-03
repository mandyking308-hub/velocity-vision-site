
CREATE TABLE public.upgrade_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_id uuid,
  plan text,
  event text NOT NULL,
  reason text,
  route text,
  is_test boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX upgrade_events_user_idx ON public.upgrade_events(user_id, created_at DESC);
CREATE INDEX upgrade_events_event_idx ON public.upgrade_events(event, created_at DESC);

GRANT SELECT, INSERT ON public.upgrade_events TO authenticated;
GRANT ALL ON public.upgrade_events TO service_role;

ALTER TABLE public.upgrade_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own upgrade events"
  ON public.upgrade_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users read own upgrade events"
  ON public.upgrade_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
