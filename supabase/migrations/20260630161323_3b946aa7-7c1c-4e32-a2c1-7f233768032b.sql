
-- 1. Drop the broad anon-visible campaigns SELECT policy.
DROP POLICY IF EXISTS "campaigns_select_public_hosted" ON public.campaigns;

-- 2. Explicit service-role-only policies on email_connection_secrets so its
-- locked-down intent is documented in policy (not just "absence of policies").
DROP POLICY IF EXISTS "email_secrets_service_select" ON public.email_connection_secrets;
DROP POLICY IF EXISTS "email_secrets_service_insert" ON public.email_connection_secrets;
DROP POLICY IF EXISTS "email_secrets_service_update" ON public.email_connection_secrets;
DROP POLICY IF EXISTS "email_secrets_service_delete" ON public.email_connection_secrets;

CREATE POLICY "email_secrets_service_select" ON public.email_connection_secrets
  FOR SELECT TO service_role USING (true);
CREATE POLICY "email_secrets_service_insert" ON public.email_connection_secrets
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "email_secrets_service_update" ON public.email_connection_secrets
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "email_secrets_service_delete" ON public.email_connection_secrets
  FOR DELETE TO service_role USING (true);
