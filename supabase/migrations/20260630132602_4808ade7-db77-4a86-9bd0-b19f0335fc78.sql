
ALTER TYPE public.campaign_status ADD VALUE IF NOT EXISTS 'expired';

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS cadence_type text NOT NULL DEFAULT 'one_off',
  ADD COLUMN IF NOT EXISTS cadence_interval int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cadence_unit text NOT NULL DEFAULT 'week',
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/London',
  ADD COLUMN IF NOT EXISTS cadence_end_at timestamptz,
  ADD COLUMN IF NOT EXISTS cadence_max_runs int,
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS runs_completed int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refresh_strategy text NOT NULL DEFAULT 'reuse';

COMMENT ON COLUMN public.campaigns.cadence_type IS 'one_off | weekly | monthly | quarterly | yearly | custom';
COMMENT ON COLUMN public.campaigns.cadence_unit IS 'day | week | month (used when cadence_type=custom)';
COMMENT ON COLUMN public.campaigns.refresh_strategy IS 'reuse | clone | regenerate (how recurring runs handle assets)';

CREATE INDEX IF NOT EXISTS idx_campaigns_next_run_at ON public.campaigns(next_run_at) WHERE next_run_at IS NOT NULL;
