-- 1. Pin search_path on queue helper functions
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = pg_catalog, public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = pg_catalog, public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = pg_catalog, public;

-- 2. Revoke anon/public EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_free_daily_credits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_free_daily_credits() TO service_role;

-- Trigger-only functions: never callable directly by clients
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_free_preview_contact_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_customer_feedback_touch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.support_tickets_sanitise_anon() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- User-callable definer function: signed-in users only
REVOKE ALL ON FUNCTION public.grant_free_preview_welcome() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_free_preview_welcome() TO authenticated, service_role;

-- 3. customer_feedback: drop duplicate/overlapping policies, keep has_role set
DROP POLICY IF EXISTS "anon can insert feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "auth users insert own feedback" ON public.customer_feedback;
DROP POLICY IF EXISTS "feedback_read_staff" ON public.customer_feedback;
DROP POLICY IF EXISTS "feedback_update_staff" ON public.customer_feedback;

-- 4. Email operational tables: scope policies to service_role explicitly
DROP POLICY IF EXISTS "Service role can insert send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Service role can read send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Service role can update send log" ON public.email_send_log;
CREATE POLICY "email_send_log_service_insert" ON public.email_send_log FOR INSERT TO service_role WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "email_send_log_service_select" ON public.email_send_log FOR SELECT TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "email_send_log_service_update" ON public.email_send_log FOR UPDATE TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage send state" ON public.email_send_state;
CREATE POLICY "email_send_state_service_all" ON public.email_send_state FOR ALL TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert suppressed emails" ON public.suppressed_emails;
DROP POLICY IF EXISTS "Service role can read suppressed emails" ON public.suppressed_emails;
CREATE POLICY "suppressed_emails_service_insert" ON public.suppressed_emails FOR INSERT TO service_role WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "suppressed_emails_service_select" ON public.suppressed_emails FOR SELECT TO service_role USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can mark tokens as used" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can read tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "unsub_tokens_service_insert" ON public.email_unsubscribe_tokens FOR INSERT TO service_role WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "unsub_tokens_service_update" ON public.email_unsubscribe_tokens FOR UPDATE TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "unsub_tokens_service_select" ON public.email_unsubscribe_tokens FOR SELECT TO service_role USING (auth.role() = 'service_role');

-- 5. Replace always-true write policies with an explicit service-role check
DROP POLICY IF EXISTS "service_role_all_stripe_subs" ON public.stripe_subscriptions;
CREATE POLICY "service_role_all_stripe_subs" ON public.stripe_subscriptions FOR ALL TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_payments" ON public.payment_intents;
CREATE POLICY "service_role_all_payments" ON public.payment_intents FOR ALL TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "email_secrets_service_delete" ON public.email_connection_secrets;
DROP POLICY IF EXISTS "email_secrets_service_insert" ON public.email_connection_secrets;
DROP POLICY IF EXISTS "email_secrets_service_update" ON public.email_connection_secrets;
CREATE POLICY "email_secrets_service_delete" ON public.email_connection_secrets FOR DELETE TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "email_secrets_service_insert" ON public.email_connection_secrets FOR INSERT TO service_role WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "email_secrets_service_update" ON public.email_connection_secrets FOR UPDATE TO service_role USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');