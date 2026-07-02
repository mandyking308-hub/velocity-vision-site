
-- 1) SUPA_anon_security_definer_function_executable
-- Revoke EXECUTE from anon/public on the credit RPCs; keep authenticated + service_role.
REVOKE EXECUTE ON FUNCTION public.reserve_campaign_credits(integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.refund_campaign_credits(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalise_campaign_credits(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_campaign_credits(integer, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_campaign_credits(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finalise_campaign_credits(uuid, uuid, text) TO authenticated, service_role;

-- 2) campaign_audiences_no_tenant_select
-- Add tenant-scoped SELECT so members of the owning company/workspace can read their own audience rows.
DROP POLICY IF EXISTS "audiences_tenant_select" ON public.campaign_audiences;
CREATE POLICY "audiences_tenant_select"
ON public.campaign_audiences
FOR SELECT
TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_audiences.campaign_id
      AND (
        c.company_id = app_private.user_company(auth.uid())
        OR c.workspace_id IN (
          SELECT cw.id FROM public.client_workspaces cw
          WHERE cw.agency_company_id = app_private.user_company(auth.uid())
        )
      )
  )
);

-- 3) email_connections_missing_workspace_scope
-- Keep credentials owner-only (per-user), and additionally require workspace_id (when set)
-- to belong to the user's own company so credentials can't be attached to another tenant's workspace.
DROP POLICY IF EXISTS "users manage own email connections" ON public.email_connections;
CREATE POLICY "users manage own email connections"
ON public.email_connections
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    workspace_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.client_workspaces cw
      WHERE cw.id = email_connections.workspace_id
        AND cw.agency_company_id = app_private.user_company(auth.uid())
    )
  )
);

-- 4) leads_hosted_form_anon_insert_no_rate_limit_check
-- Require the anonymous submission's company_id/workspace_id (when set) to match the campaign's.
DROP POLICY IF EXISTS "leads_insert_hosted_form_anon" ON public.leads;
CREATE POLICY "leads_insert_hosted_form_anon"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (
  source = 'hosted_form'
  AND campaign_id IS NOT NULL
  AND created_by IS NULL
  AND EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = leads.campaign_id
      AND c.lead_form_published = true
      AND (leads.company_id IS NULL OR leads.company_id = c.company_id)
      AND (leads.workspace_id IS NULL OR leads.workspace_id = c.workspace_id)
  )
);

-- 5) support_tickets_diagnostics_anon_insert
-- Sanitise anon-submitted tickets: strip account_reference (prevents spoofing another customer),
-- cap diagnostics jsonb size, and truncate free-text fields to reasonable lengths.
CREATE OR REPLACE FUNCTION public.support_tickets_sanitise_anon()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    -- Anonymous submissions cannot claim to belong to a specific account.
    NEW.account_reference := NULL;
    NEW.workspace_id := NULL;
    NEW.assigned_to := NULL;
    NEW.resolution_notes := NULL;
    NEW.assistant_answer := NULL;
    -- Cap diagnostics payload to prevent abuse (keep small metadata only).
    IF NEW.diagnostics IS NOT NULL AND length(NEW.diagnostics::text) > 4000 THEN
      NEW.diagnostics := '{"truncated": true}'::jsonb;
    END IF;
    -- Truncate free-text fields.
    IF NEW.message IS NOT NULL AND length(NEW.message) > 5000 THEN
      NEW.message := left(NEW.message, 5000);
    END IF;
    IF NEW.subject IS NOT NULL AND length(NEW.subject) > 300 THEN
      NEW.subject := left(NEW.subject, 300);
    END IF;
    IF NEW.contact_name IS NOT NULL AND length(NEW.contact_name) > 200 THEN
      NEW.contact_name := left(NEW.contact_name, 200);
    END IF;
    IF NEW.contact_phone IS NOT NULL AND length(NEW.contact_phone) > 40 THEN
      NEW.contact_phone := left(NEW.contact_phone, 40);
    END IF;
    IF NEW.company_name IS NOT NULL AND length(NEW.company_name) > 200 THEN
      NEW.company_name := left(NEW.company_name, 200);
    END IF;
    IF NEW.email IS NOT NULL AND length(NEW.email) > 320 THEN
      NEW.email := left(NEW.email, 320);
    END IF;
    IF NEW.browser_info IS NOT NULL AND length(NEW.browser_info) > 500 THEN
      NEW.browser_info := left(NEW.browser_info, 500);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_support_tickets_sanitise_anon ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_sanitise_anon
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.support_tickets_sanitise_anon();
