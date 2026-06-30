
DROP FUNCTION IF EXISTS public.agency_pooled_sends_today(uuid);

CREATE OR REPLACE FUNCTION public.agency_pooled_sends_today()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*), 0)::int
  FROM public.email_sends es
  WHERE es.sent_at IS NOT NULL
    AND es.sent_at >= date_trunc('day', now())
    AND es.workspace_id IN (
      SELECT cw.id FROM public.client_workspaces cw
      WHERE cw.agency_company_id = app_private.user_company(auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION public.agency_pooled_sends_today() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.agency_pooled_sends_today() TO authenticated, service_role;
