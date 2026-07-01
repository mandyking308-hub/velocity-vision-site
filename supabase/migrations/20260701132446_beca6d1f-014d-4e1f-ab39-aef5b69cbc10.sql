
-- 1. Add columns
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE SET NULL;
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE SET NULL;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS contacts_workspace_id_idx ON public.contacts(workspace_id);
CREATE INDEX IF NOT EXISTS companies_workspace_id_idx ON public.companies(workspace_id);

-- 3. Backfill from data_uploads via source_upload_id (do not overwrite existing)
UPDATE public.contacts c
SET workspace_id = du.workspace_id
FROM public.data_uploads du
WHERE c.source_upload_id = du.id
  AND c.workspace_id IS NULL
  AND du.workspace_id IS NOT NULL;

UPDATE public.companies co
SET workspace_id = du.workspace_id
FROM public.data_uploads du
WHERE co.source_upload_id = du.id
  AND co.workspace_id IS NULL
  AND du.workspace_id IS NOT NULL;

-- 4. Helper: user can access workspace (workspace under their agency company)
CREATE OR REPLACE FUNCTION app_private.user_can_access_workspace(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _workspace_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.client_workspaces cw
    WHERE cw.id = _workspace_id
      AND cw.agency_company_id = (
        SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
      )
  )
$$;

-- 5. Update RLS policies on contacts
DROP POLICY IF EXISTS contacts_select ON public.contacts;
DROP POLICY IF EXISTS contacts_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_update ON public.contacts;
DROP POLICY IF EXISTS contacts_delete ON public.contacts;

CREATE POLICY contacts_select ON public.contacts FOR SELECT TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR company_id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY contacts_insert ON public.contacts FOR INSERT TO authenticated
WITH CHECK (
  app_private.is_internal(auth.uid())
  OR company_id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY contacts_update ON public.contacts FOR UPDATE TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR company_id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
)
WITH CHECK (
  app_private.is_internal(auth.uid())
  OR company_id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY contacts_delete ON public.contacts FOR DELETE TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR company_id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

-- 6. Update RLS policies on companies
DROP POLICY IF EXISTS companies_select ON public.companies;
DROP POLICY IF EXISTS companies_insert ON public.companies;
DROP POLICY IF EXISTS companies_update ON public.companies;
DROP POLICY IF EXISTS companies_delete ON public.companies;

CREATE POLICY companies_select ON public.companies FOR SELECT TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY companies_insert ON public.companies FOR INSERT TO authenticated
WITH CHECK (
  app_private.is_internal(auth.uid())
  OR id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY companies_update ON public.companies FOR UPDATE TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
)
WITH CHECK (
  app_private.is_internal(auth.uid())
  OR id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY companies_delete ON public.companies FOR DELETE TO authenticated
USING (
  app_private.is_internal(auth.uid())
  OR id = app_private.user_company(auth.uid())
  OR app_private.user_can_access_workspace(auth.uid(), workspace_id)
);
