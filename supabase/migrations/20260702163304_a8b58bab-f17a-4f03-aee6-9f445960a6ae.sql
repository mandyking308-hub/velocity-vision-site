
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID,
  email TEXT,
  rating SMALLINT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('confusing','missing_feature','bug','loved','pricing_billing','other')),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 4000),
  route TEXT,
  source TEXT NOT NULL DEFAULT 'app' CHECK (source IN ('public_site','app','demo')),
  plan TEXT,
  browser_info TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_permission BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','actioned','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.customer_feedback TO authenticated;
GRANT INSERT ON public.customer_feedback TO anon;
GRANT ALL ON public.customer_feedback TO service_role;

CREATE INDEX IF NOT EXISTS customer_feedback_status_idx ON public.customer_feedback (status, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_feedback_type_idx ON public.customer_feedback (feedback_type, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_feedback_user_idx ON public.customer_feedback (user_id);

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_insert_anon"
  ON public.customer_feedback
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "feedback_insert_authenticated"
  ON public.customer_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "feedback_read_staff"
  ON public.customer_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin'::app_role, 'founder'::app_role)
    )
  );

CREATE POLICY "feedback_update_staff"
  ON public.customer_feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin'::app_role, 'founder'::app_role)
    )
  )
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.tg_customer_feedback_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER customer_feedback_touch
BEFORE UPDATE ON public.customer_feedback
FOR EACH ROW EXECUTE FUNCTION public.tg_customer_feedback_touch();
