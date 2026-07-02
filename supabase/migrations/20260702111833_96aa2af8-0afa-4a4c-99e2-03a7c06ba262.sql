
-- Extend email_connections for Nylas OAuth
ALTER TABLE public.email_connections
  ADD COLUMN IF NOT EXISTS auth_type text NOT NULL DEFAULT 'smtp',
  ADD COLUMN IF NOT EXISTS nylas_grant_id text,
  ADD COLUMN IF NOT EXISTS nylas_provider text,
  ADD COLUMN IF NOT EXISTS connected_via text,
  ADD COLUMN IF NOT EXISTS nylas_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS nylas_disconnected_at timestamptz,
  ADD COLUMN IF NOT EXISTS token_status text;

ALTER TABLE public.email_connections
  ALTER COLUMN smtp_host DROP NOT NULL,
  ALTER COLUMN smtp_username DROP NOT NULL;

ALTER TABLE public.email_connections
  ALTER COLUMN smtp_host DROP DEFAULT,
  ALTER COLUMN smtp_username DROP DEFAULT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_connections_auth_type_chk'
  ) THEN
    ALTER TABLE public.email_connections
      ADD CONSTRAINT email_connections_auth_type_chk
      CHECK (auth_type IN ('smtp','nylas'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS email_connections_nylas_grant_uniq
  ON public.email_connections (nylas_grant_id)
  WHERE nylas_grant_id IS NOT NULL;

-- OAuth CSRF state table
CREATE TABLE IF NOT EXISTS public.nylas_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE CASCADE,
  state text NOT NULL UNIQUE,
  nonce text NOT NULL,
  provider text NOT NULL,
  redirect_to text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nylas_oauth_states TO authenticated;
GRANT ALL ON public.nylas_oauth_states TO service_role;

ALTER TABLE public.nylas_oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own oauth state" ON public.nylas_oauth_states;
CREATE POLICY "Users manage their own oauth state"
  ON public.nylas_oauth_states
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
