
-- Add 'draft' to campaign_status enum
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'draft';

-- Add 'linkedin_outreach' and 'newsletter' to campaign_type enum
ALTER TYPE public.campaign_type ADD VALUE IF NOT EXISTS 'linkedin_outreach';
ALTER TYPE public.campaign_type ADD VALUE IF NOT EXISTS 'newsletter';

-- Add new columns to campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS objective text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS target_audience_description text;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS budget numeric(12,2) DEFAULT 0;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Campaign assets table
CREATE TABLE public.campaign_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'other',
  file_url text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assets viewable by authenticated" ON public.campaign_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Assets insertable by authenticated" ON public.campaign_assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Assets deletable by authenticated" ON public.campaign_assets FOR DELETE TO authenticated USING (true);

-- Campaign audiences table
CREATE TABLE public.campaign_audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company_name text,
  email text,
  job_title text,
  industry text,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audiences viewable by authenticated" ON public.campaign_audiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audiences insertable by authenticated" ON public.campaign_audiences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Audiences deletable by authenticated" ON public.campaign_audiences FOR DELETE TO authenticated USING (true);
CREATE POLICY "Audiences updatable by authenticated" ON public.campaign_audiences FOR UPDATE TO authenticated USING (true);

-- Add replies column to campaign_metrics for outreach tracking
ALTER TABLE public.campaign_metrics ADD COLUMN IF NOT EXISTS replies integer DEFAULT 0;
ALTER TABLE public.campaign_metrics ADD COLUMN IF NOT EXISTS reach integer DEFAULT 0;
ALTER TABLE public.campaign_metrics ADD COLUMN IF NOT EXISTS traffic integer DEFAULT 0;
ALTER TABLE public.campaign_metrics ADD COLUMN IF NOT EXISTS clicks integer DEFAULT 0;
ALTER TABLE public.campaign_metrics ADD COLUMN IF NOT EXISTS conversions integer DEFAULT 0;
