
ALTER TABLE public.client_onboarding ADD COLUMN IF NOT EXISTS agency_size text;
ALTER TABLE public.client_onboarding ADD COLUMN IF NOT EXISTS services_offered text;
ALTER TABLE public.client_onboarding ADD COLUMN IF NOT EXISTS industries_served text;
