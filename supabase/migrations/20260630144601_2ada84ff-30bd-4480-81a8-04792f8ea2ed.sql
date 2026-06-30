
-- Sprint A + B combined: i18n + currency columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS preferred_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS billing_country text;

ALTER TABLE public.client_workspaces
  ADD COLUMN IF NOT EXISTS default_language text NOT NULL DEFAULT 'en';

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS output_language text NOT NULL DEFAULT 'en';

ALTER TABLE public.campaign_assets
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

ALTER TABLE public.user_plans
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS billing_country text;
