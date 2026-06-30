
-- USER_ROLES: remove overlapping permissive SELECT
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;

-- QA_TEST_RESULTS: remove duplicate permissive policies
DROP POLICY IF EXISTS "QA results viewable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results insertable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results updatable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA results deletable by authenticated" ON public.qa_test_results;

-- LEADS
DROP POLICY IF EXISTS "Leads viewable by authenticated" ON public.leads;
DROP POLICY IF EXISTS "Leads insertable by authenticated" ON public.leads;
DROP POLICY IF EXISTS "Leads updatable by authenticated" ON public.leads;
DROP POLICY IF EXISTS "Leads deletable by authenticated" ON public.leads;
DROP POLICY IF EXISTS "Anonymous can insert leads" ON public.leads;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "leads_insert_auth" ON public.leads FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "leads_insert_anon" ON public.leads FOR INSERT TO anon
  WITH CHECK (company_id IS NULL AND created_by IS NULL);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));
GRANT INSERT ON public.leads TO anon;

-- OPPORTUNITIES
DROP POLICY IF EXISTS "Opportunities viewable by authenticated" ON public.opportunities;
DROP POLICY IF EXISTS "Opportunities insertable by authenticated" ON public.opportunities;
DROP POLICY IF EXISTS "Opportunities updatable by authenticated" ON public.opportunities;
DROP POLICY IF EXISTS "Opportunities deletable by authenticated" ON public.opportunities;
CREATE POLICY "opps_select" ON public.opportunities FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "opps_insert" ON public.opportunities FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "opps_update" ON public.opportunities FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "opps_delete" ON public.opportunities FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));

-- CLIENT_ONBOARDING
DROP POLICY IF EXISTS "Onboarding viewable by authenticated" ON public.client_onboarding;
DROP POLICY IF EXISTS "Onboarding insertable by authenticated" ON public.client_onboarding;
DROP POLICY IF EXISTS "Onboarding updatable by authenticated" ON public.client_onboarding;
CREATE POLICY "onboarding_select" ON public.client_onboarding FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "onboarding_insert" ON public.client_onboarding FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "onboarding_update" ON public.client_onboarding FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));

-- CAMPAIGN_REQUESTS
DROP POLICY IF EXISTS "Requests viewable by authenticated" ON public.campaign_requests;
DROP POLICY IF EXISTS "Requests insertable by authenticated" ON public.campaign_requests;
CREATE POLICY "creq_select" ON public.campaign_requests FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "creq_insert" ON public.campaign_requests FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "creq_update" ON public.campaign_requests FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "creq_delete" ON public.campaign_requests FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- CLIENT_WORKSPACES
DROP POLICY IF EXISTS "Workspaces viewable by authenticated" ON public.client_workspaces;
DROP POLICY IF EXISTS "Workspaces insertable by authenticated" ON public.client_workspaces;
DROP POLICY IF EXISTS "Workspaces updatable by authenticated" ON public.client_workspaces;
DROP POLICY IF EXISTS "Workspaces deletable by authenticated" ON public.client_workspaces;
CREATE POLICY "ws_select" ON public.client_workspaces FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR agency_company_id = app_private.user_company(auth.uid()));
CREATE POLICY "ws_insert" ON public.client_workspaces FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR agency_company_id = app_private.user_company(auth.uid()));
CREATE POLICY "ws_update" ON public.client_workspaces FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR agency_company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR agency_company_id = app_private.user_company(auth.uid()));
CREATE POLICY "ws_delete" ON public.client_workspaces FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR agency_company_id = app_private.user_company(auth.uid()));

-- CAMPAIGNS
DROP POLICY IF EXISTS "Campaigns viewable by authenticated" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns insertable by authenticated" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns updatable by authenticated" ON public.campaigns;
DROP POLICY IF EXISTS "Campaigns deletable by authenticated" ON public.campaigns;
CREATE POLICY "camp_select" ON public.campaigns FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "camp_insert" ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "camp_update" ON public.campaigns FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "camp_delete" ON public.campaigns FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));

-- CAMPAIGN_METRICS (scope via parent campaign)
DROP POLICY IF EXISTS "Metrics viewable by authenticated" ON public.campaign_metrics;
DROP POLICY IF EXISTS "Metrics insertable by authenticated" ON public.campaign_metrics;
CREATE POLICY "cm_select" ON public.campaign_metrics FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "cm_insert" ON public.campaign_metrics FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "cm_update" ON public.campaign_metrics FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())))
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "cm_delete" ON public.campaign_metrics FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- CAMPAIGN_ASSETS (scope via parent campaign)
DROP POLICY IF EXISTS "Assets viewable by authenticated" ON public.campaign_assets;
DROP POLICY IF EXISTS "Assets insertable by authenticated" ON public.campaign_assets;
DROP POLICY IF EXISTS "Assets deletable by authenticated" ON public.campaign_assets;
CREATE POLICY "ca_select" ON public.campaign_assets FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "ca_insert" ON public.campaign_assets FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "ca_update" ON public.campaign_assets FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())))
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "ca_delete" ON public.campaign_assets FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())));

-- CAMPAIGN_ATTRIBUTIONS (scope via linked contact's company)
DROP POLICY IF EXISTS "Attributions viewable by authenticated" ON public.campaign_attributions;
DROP POLICY IF EXISTS "Attributions insertable by authenticated" ON public.campaign_attributions;
CREATE POLICY "cattr_select" ON public.campaign_attributions FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id
                    AND ct.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "cattr_insert" ON public.campaign_attributions FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id
                         AND ct.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "cattr_update" ON public.campaign_attributions FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "cattr_delete" ON public.campaign_attributions FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- NOTES (scope by author, plus internal)
DROP POLICY IF EXISTS "Notes viewable by authenticated" ON public.notes;
DROP POLICY IF EXISTS "Notes insertable by authenticated" ON public.notes;
DROP POLICY IF EXISTS "Notes deletable by authenticated" ON public.notes;
CREATE POLICY "notes_select" ON public.notes FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "notes_insert" ON public.notes FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "notes_update" ON public.notes FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid())
  WITH CHECK (app_private.is_internal(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "notes_delete" ON public.notes FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid());

-- ACTIVITIES (scope by author or related contact's company)
DROP POLICY IF EXISTS "Activities viewable by authenticated" ON public.activities;
DROP POLICY IF EXISTS "Activities insertable by authenticated" ON public.activities;
CREATE POLICY "act_select" ON public.activities FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR created_by = auth.uid()
         OR (contact_id IS NOT NULL AND EXISTS (
             SELECT 1 FROM public.contacts ct WHERE ct.id = contact_id
             AND ct.company_id = app_private.user_company(auth.uid()))));
CREATE POLICY "act_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "act_update" ON public.activities FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid())
  WITH CHECK (app_private.is_internal(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "act_delete" ON public.activities FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid());

-- TASKS (scope by assignee, author, or internal)
DROP POLICY IF EXISTS "Tasks viewable by authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Tasks insertable by authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Tasks updatable by authenticated" ON public.tasks;
DROP POLICY IF EXISTS "Tasks deletable by authenticated" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid() OR assigned_to = auth.uid())
  WITH CHECK (app_private.is_internal(auth.uid()) OR created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR created_by = auth.uid());
