
-- 1. NEW stripe_subscriptions TABLE
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE SET NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  product_id text,
  price_id text,
  status text NOT NULL DEFAULT 'active',
  plan text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stripe_subs_user_id ON public.stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subs_stripe_id ON public.stripe_subscriptions(stripe_subscription_id);

GRANT SELECT ON public.stripe_subscriptions TO authenticated;
GRANT ALL ON public.stripe_subscriptions TO service_role;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_stripe_sub" ON public.stripe_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "service_role_all_stripe_subs" ON public.stripe_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_stripe_subscriptions_updated_at BEFORE UPDATE ON public.stripe_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. PAYMENT_INTENTS TABLE
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE SET NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  price_id text NOT NULL,
  product_kind text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'gbp',
  status text NOT NULL DEFAULT 'pending',
  ref_id uuid,
  environment text NOT NULL DEFAULT 'sandbox',
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user ON public.payment_intents(user_id);

GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_payments" ON public.payment_intents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "service_role_all_payments" ON public.payment_intents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CAMPAIGNS — public lead form config
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS lead_form_config jsonb;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS lead_form_published boolean NOT NULL DEFAULT true;

-- 4. LEADS — strict anon insert
DROP POLICY IF EXISTS leads_insert_anon ON public.leads;
DROP POLICY IF EXISTS leads_insert_auth ON public.leads;

CREATE POLICY "leads_insert_hosted_form_anon" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (
    source = 'hosted_form'
    AND campaign_id IS NOT NULL
    AND created_by IS NULL
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = leads.campaign_id AND c.lead_form_published = true
    )
  );

CREATE POLICY "leads_insert_authenticated" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (
    app_private.is_internal(auth.uid())
    OR created_by = auth.uid()
    OR company_id = app_private.user_company(auth.uid())
  );

-- Trigger to inherit company/owner from source campaign
CREATE OR REPLACE FUNCTION public.leads_inherit_campaign_context()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c_company uuid;
  c_owner uuid;
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT company_id, owner_id INTO c_company, c_owner FROM public.campaigns WHERE id = NEW.campaign_id;
    IF NEW.company_id IS NULL THEN NEW.company_id := c_company; END IF;
    IF NEW.owner_id IS NULL THEN NEW.owner_id := c_owner; END IF;
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_leads_inherit_campaign ON public.leads;
CREATE TRIGGER trg_leads_inherit_campaign BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_inherit_campaign_context();

-- 5. CAMPAIGNS — allow anon to read minimal published fields for hosted form
DROP POLICY IF EXISTS "campaigns_select_public_hosted" ON public.campaigns;
CREATE POLICY "campaigns_select_public_hosted" ON public.campaigns
  FOR SELECT TO anon
  USING (lead_form_published = true AND slug IS NOT NULL);
GRANT SELECT ON public.campaigns TO anon;

-- 6. EMAIL CONNECTIONS — rate limit
ALTER TABLE public.email_connections ADD COLUMN IF NOT EXISTS rate_limit_per_hour integer NOT NULL DEFAULT 60;
CREATE INDEX IF NOT EXISTS email_sends_connection_sent_at_idx ON public.email_sends(connection_id, sent_at);
