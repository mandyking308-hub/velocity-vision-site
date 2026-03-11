
ALTER TABLE public.legal_acceptances 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS legal_version text DEFAULT '1.0';
