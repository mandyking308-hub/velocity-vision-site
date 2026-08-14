-- 1. Buffer secrets: explicit service-role-only access (mirrors email_connection_secrets)
GRANT ALL ON public.buffer_connection_secrets TO service_role;
REVOKE ALL ON public.buffer_connection_secrets FROM anon, authenticated;

CREATE POLICY "buffer_secrets_service_select" ON public.buffer_connection_secrets
  FOR SELECT TO service_role USING (true);
CREATE POLICY "buffer_secrets_service_insert" ON public.buffer_connection_secrets
  FOR INSERT TO service_role WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "buffer_secrets_service_update" ON public.buffer_connection_secrets
  FOR UPDATE TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "buffer_secrets_service_delete" ON public.buffer_connection_secrets
  FOR DELETE TO service_role USING (auth.role() = 'service_role');

-- 2. Buffer OAuth handshake state: service-role only (edge functions own this flow)
GRANT ALL ON public.buffer_oauth_states TO service_role;
REVOKE ALL ON public.buffer_oauth_states FROM anon, authenticated;

CREATE POLICY "buffer_oauth_states_service_all" ON public.buffer_oauth_states
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. error_logs: only staff may insert from the client; edge functions use service_role
DROP POLICY IF EXISTS "elogs_insert" ON public.error_logs;
CREATE POLICY "elogs_insert" ON public.error_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    app_private.has_role(auth.uid(), 'admin'::app_role)
    OR app_private.has_role(auth.uid(), 'founder'::app_role)
  );

-- 4. SECURITY DEFINER functions must not be callable by signed-out visitors
REVOKE EXECUTE ON FUNCTION public.credit_balance_for_user(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.effective_plan_for_actions(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_current_credit_balance() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.plan_entitlement_active(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.credit_balance_for_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.effective_plan_for_actions(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_credit_balance() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.plan_entitlement_active(uuid) TO authenticated, service_role;

-- Trigger-only functions need no direct caller at all
REVOKE EXECUTE ON FUNCTION public.enforce_recurring_cadence_plan() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_workspace_plan_limit() FROM anon, authenticated, public;