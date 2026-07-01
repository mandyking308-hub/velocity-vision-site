ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS account_reference text,
  ADD COLUMN IF NOT EXISTS preferred_contact_method text;