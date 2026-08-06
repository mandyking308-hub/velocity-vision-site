ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS is_sample boolean NOT NULL DEFAULT false;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS reply_category text,
  ADD COLUMN IF NOT EXISTS reply_snippet text,
  ADD COLUMN IF NOT EXISTS reply_triaged_at timestamptz;

CREATE INDEX IF NOT EXISTS leads_reply_category_idx ON public.leads (reply_category) WHERE reply_category IS NOT NULL;