
ALTER TABLE public.legal_acceptances
  ADD COLUMN IF NOT EXISTS workspace_id uuid,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS accepted_terms_version text,
  ADD COLUMN IF NOT EXISTS accepted_customer_agreement_version text,
  ADD COLUMN IF NOT EXISTS accepted_dpa_version text,
  ADD COLUMN IF NOT EXISTS accepted_privacy_version text,
  ADD COLUMN IF NOT EXISTS accepted_aup_version text,
  ADD COLUMN IF NOT EXISTS accepted_marketing_compliance_version text,
  ADD COLUMN IF NOT EXISTS accepted_cookie_policy_version text,
  ADD COLUMN IF NOT EXISTS accepted_security_policy_version text,
  ADD COLUMN IF NOT EXISTS accepted_sla_version text;
