
-- Remove anonymous insert on companies and contacts (lead capture uses leads only)
DROP POLICY IF EXISTS "Anonymous can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Anonymous can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Anonymous can insert leads" ON public.leads;

-- Defensive drops of any legacy permissive policies (no-op if already gone)
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "User roles viewable by authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "QA results viewable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results insertable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results updatable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results deletable by authenticated" ON public.qa_test_results;

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'leads','opportunities','activities','notes','tasks','campaigns',
    'campaign_metrics','campaign_assets','campaign_attributions','campaign_requests',
    'client_onboarding','client_workspaces','companies','contacts','user_roles','qa_test_results'
  ])
  LOOP
    FOR p IN
      SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename=t
        AND (qual = 'true' OR with_check = 'true')
        AND 'authenticated' = ANY(roles)
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;
END$$;
