
-- ===== International product layer: language / locale / timezone metadata =====

-- profiles already has preferred_language. Add timezone + locale + country.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS preferred_locale  text DEFAULT 'en-GB',
  ADD COLUMN IF NOT EXISTS preferred_timezone text DEFAULT 'Europe/London';

-- Workspace default language / locale / timezone (cascade default to child entities)
ALTER TABLE public.client_workspaces
  ADD COLUMN IF NOT EXISTS default_language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS default_locale   text DEFAULT 'en-GB',
  ADD COLUMN IF NOT EXISTS default_timezone text DEFAULT 'Europe/London',
  ADD COLUMN IF NOT EXISTS default_country  text DEFAULT 'GB';

-- Contact-level language + country (used for outbound content / cadence localization)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS country  text,
  ADD COLUMN IF NOT EXISTS timezone text;

-- Campaign-level language (drives generated asset language going forward)
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS target_country text;

-- Per-asset language so a campaign can carry multilingual variants
ALTER TABLE public.campaign_assets
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- ===== Security fixes for findings flagged this turn =====

-- 1. credit_topups: revoke self-insert. Only webhook (service_role) may insert.
DROP POLICY IF EXISTS "own topup insert" ON public.credit_topups;
REVOKE INSERT ON public.credit_topups FROM authenticated;

-- 2. human_reviews: drop the self-insert policy, only Stripe webhook may insert.
DROP POLICY IF EXISTS "own review insert" ON public.human_reviews;
REVOKE INSERT ON public.human_reviews FROM authenticated;

-- 3. user_roles: drop any residual "always true" select policy by every known name.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'public.user_roles'::regclass
      AND polcmd = 'r'
      AND pg_get_expr(polqual, polrelid) = 'true'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.user_roles', r.polname);
  END LOOP;
END$$;

-- 4. has_role search_path hardening: move to pg_catalog so a shadow public.user_roles
--    cannot hijack the lookup. Fully-qualify the reference.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
