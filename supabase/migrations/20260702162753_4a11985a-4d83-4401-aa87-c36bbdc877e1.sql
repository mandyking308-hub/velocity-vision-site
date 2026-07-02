
CREATE TABLE public.customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id uuid,
  email text,
  rating smallint CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  feedback_type text NOT NULL CHECK (feedback_type IN ('confusing','missing_feature','bug','loved','pricing_billing','other')),
  message text NOT NULL,
  route text,
  source text NOT NULL DEFAULT 'app' CHECK (source IN ('public_site','app','demo')),
  plan text,
  browser_info text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_permission boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','actioned','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.customer_feedback TO authenticated;
GRANT INSERT ON public.customer_feedback TO anon;
GRANT ALL ON public.customer_feedback TO service_role;

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + signed-in) can insert feedback; signed-in inserts must scope user_id to themselves or null
CREATE POLICY "anon can insert feedback"
  ON public.customer_feedback FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "auth users insert own feedback"
  ON public.customer_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Signed-in users may read/update their own feedback rows
CREATE POLICY "users read own feedback"
  ON public.customer_feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Internal staff (admin/founder) can read, update, delete everything
CREATE POLICY "staff read all feedback"
  ON public.customer_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'));

CREATE POLICY "staff update feedback"
  ON public.customer_feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'founder'));

CREATE INDEX customer_feedback_created_at_idx ON public.customer_feedback (created_at DESC);
CREATE INDEX customer_feedback_status_idx ON public.customer_feedback (status);

CREATE TRIGGER customer_feedback_set_updated_at
  BEFORE UPDATE ON public.customer_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
