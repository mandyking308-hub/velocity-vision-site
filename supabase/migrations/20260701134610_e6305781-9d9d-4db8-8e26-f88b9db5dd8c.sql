ALTER TABLE public.email_connections
  ADD COLUMN IF NOT EXISTS dkim_selector text,
  ADD COLUMN IF NOT EXISTS dkim_selectors text[] NOT NULL DEFAULT ARRAY[]::text[];