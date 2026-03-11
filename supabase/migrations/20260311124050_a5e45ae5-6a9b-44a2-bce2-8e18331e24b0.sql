
-- Client onboarding profiles
CREATE TABLE public.client_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  business_description text,
  marketing_goals text,
  target_audience text,
  target_regions text,
  competitors text,
  existing_channels text,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Onboarding viewable by authenticated" ON public.client_onboarding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Onboarding insertable by authenticated" ON public.client_onboarding FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Onboarding updatable by authenticated" ON public.client_onboarding FOR UPDATE TO authenticated USING (true);
