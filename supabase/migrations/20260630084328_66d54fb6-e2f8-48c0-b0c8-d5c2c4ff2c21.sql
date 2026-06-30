ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS brief jsonb,
  ADD COLUMN IF NOT EXISTS pack jsonb,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS campaign_kind text;

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_slug_key ON public.campaigns(slug) WHERE slug IS NOT NULL;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS last_action text,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS owner_id uuid;

CREATE INDEX IF NOT EXISTS leads_campaign_id_idx ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS campaigns_owner_id_idx ON public.campaigns(owner_id);
CREATE INDEX IF NOT EXISTS campaigns_workspace_id_idx ON public.campaigns(workspace_id);