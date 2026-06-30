
ALTER TABLE public.email_connections
  ADD COLUMN IF NOT EXISTS spf_status text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS dkim_status text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS domain_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS domain_verification_details jsonb;

CREATE OR REPLACE FUNCTION public.agency_pooled_sends_today(_company uuid)
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
    AND (
      es.workspace_id IN (
        SELECT cw.id FROM public.client_workspaces cw
        WHERE cw.agency_company_id = _company
      )
    );
$$;

REVOKE ALL ON FUNCTION public.agency_pooled_sends_today(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.agency_pooled_sends_today(uuid) TO authenticated, service_role;
