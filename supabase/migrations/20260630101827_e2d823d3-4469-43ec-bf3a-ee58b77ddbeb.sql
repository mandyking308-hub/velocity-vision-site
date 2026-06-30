
-- 1. credit_ledger: only allow spend inserts from authenticated users
DROP POLICY IF EXISTS "own ledger insert" ON public.credit_ledger;
CREATE POLICY "ledger_spend_insert_self" ON public.credit_ledger
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND delta < 0
    AND reason LIKE 'spend_%'
  );

-- 2. user_plans: remove self-insert and self-update; only webhook (service_role) can mutate
DROP POLICY IF EXISTS "own plan insert" ON public.user_plans;
DROP POLICY IF EXISTS "own plan update" ON public.user_plans;
REVOKE INSERT, UPDATE ON public.user_plans FROM authenticated;

-- Security-definer RPC to lazily provision the free Starter plan once per user
CREATE OR REPLACE FUNCTION public.provision_starter_plan()
RETURNS public.user_plans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing public.user_plans;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  SELECT * INTO existing FROM public.user_plans WHERE user_id = uid LIMIT 1;
  IF FOUND THEN RETURN existing; END IF;
  INSERT INTO public.user_plans (user_id, plan, status, period_end)
  VALUES (uid, 'starter', 'active', now() + interval '30 days')
  RETURNING * INTO existing;
  RETURN existing;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.provision_starter_plan() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.provision_starter_plan() TO authenticated;

-- 3. campaign_audiences: internal staff only
DROP POLICY IF EXISTS audiences_select ON public.campaign_audiences;
DROP POLICY IF EXISTS audiences_insert ON public.campaign_audiences;
DROP POLICY IF EXISTS audiences_update ON public.campaign_audiences;
DROP POLICY IF EXISTS audiences_delete ON public.campaign_audiences;
CREATE POLICY audiences_internal_all ON public.campaign_audiences
  FOR ALL TO authenticated
  USING (app_private.is_internal(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()));

-- 4. companies: internal staff only can insert
DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()));

-- 5. Storage: add explicit UPDATE policy mirroring existing scope
DROP POLICY IF EXISTS client_docs_update ON storage.objects;
CREATE POLICY client_docs_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-documents' AND app_private.is_internal(auth.uid()))
  WITH CHECK (bucket_id = 'client-documents' AND app_private.is_internal(auth.uid()));

-- 6. Lock down public SECURITY DEFINER functions (triggers and policy helpers
--    don't need direct EXECUTE rights from anon/authenticated). The trigger
--    runtime and RLS policy evaluator call them via the owner role regardless.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.leads_inherit_campaign_context() FROM PUBLIC, anon, authenticated;
