
ALTER TABLE public.email_connections
  ADD COLUMN IF NOT EXISTS nylas_region text;

ALTER TABLE public.nylas_oauth_states
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'eu';
