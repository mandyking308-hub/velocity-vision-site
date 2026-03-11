
-- QA test results table
CREATE TABLE public.qa_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  test_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  last_run_at timestamptz,
  run_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.qa_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "QA results viewable by authenticated" ON public.qa_test_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "QA results insertable by authenticated" ON public.qa_test_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "QA results updatable by authenticated" ON public.qa_test_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "QA results deletable by authenticated" ON public.qa_test_results FOR DELETE TO authenticated USING (true);

-- Error log table
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  message text NOT NULL,
  details text,
  severity text NOT NULL DEFAULT 'error',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Error logs viewable by authenticated" ON public.error_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Error logs insertable by authenticated" ON public.error_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Error logs updatable by authenticated" ON public.error_logs FOR UPDATE TO authenticated USING (true);
