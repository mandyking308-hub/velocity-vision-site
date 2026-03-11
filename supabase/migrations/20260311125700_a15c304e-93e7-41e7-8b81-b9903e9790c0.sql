
-- Add account_type to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'business';

-- Create client_workspaces table for agency sub-clients
CREATE TABLE public.client_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  website text,
  contact_name text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add workspace_id to campaigns (nullable, for agency campaigns)
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.client_workspaces(id);

-- RLS for client_workspaces
ALTER TABLE public.client_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspaces viewable by authenticated" ON public.client_workspaces
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Workspaces insertable by authenticated" ON public.client_workspaces
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Workspaces updatable by authenticated" ON public.client_workspaces
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Workspaces deletable by authenticated" ON public.client_workspaces
  FOR DELETE TO authenticated USING (true);
