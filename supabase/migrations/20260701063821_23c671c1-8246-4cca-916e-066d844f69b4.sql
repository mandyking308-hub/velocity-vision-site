ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE public.email_sends ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_leads_last_contacted_at ON public.leads(last_contacted_at);
CREATE INDEX IF NOT EXISTS idx_email_sends_scheduled_at ON public.email_sends(scheduled_at);