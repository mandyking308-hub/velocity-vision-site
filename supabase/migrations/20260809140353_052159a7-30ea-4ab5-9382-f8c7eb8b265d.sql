CREATE TABLE public.buffer_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buffer_account_id text,
  scopes text,
  status text NOT NULL DEFAULT 'connected',
  connected_at timestamptz NOT NULL DEFAULT now(),
  access_token_expires_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT ON public.buffer_connections TO authenticated;
GRANT ALL ON public.buffer_connections TO service_role;

ALTER TABLE public.buffer_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own Buffer connection status"
  ON public.buffer_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_buffer_connections_updated_at
  BEFORE UPDATE ON public.buffer_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.buffer_connection_secrets (
  connection_id uuid NOT NULL PRIMARY KEY REFERENCES public.buffer_connections(id) ON DELETE CASCADE,
  encrypted_access_token text NOT NULL,
  encrypted_refresh_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tokens are server-only by construction: no anon/authenticated grants at all.
GRANT ALL ON public.buffer_connection_secrets TO service_role;

ALTER TABLE public.buffer_connection_secrets ENABLE ROW LEVEL SECURITY;
-- No client-facing policies on purpose: only the service role can reach this table.

CREATE TABLE public.buffer_oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state text NOT NULL UNIQUE,
  code_verifier text NOT NULL,
  return_to text,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PKCE verifier and OAuth state are server-only.
GRANT ALL ON public.buffer_oauth_states TO service_role;

ALTER TABLE public.buffer_oauth_states ENABLE ROW LEVEL SECURITY;
-- No client-facing policies: callbacks resolve the user via service role only.

CREATE INDEX buffer_oauth_states_expires_idx ON public.buffer_oauth_states (expires_at);