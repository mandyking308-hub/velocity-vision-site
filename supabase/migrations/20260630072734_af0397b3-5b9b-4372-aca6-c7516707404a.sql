
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO postgres, service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION app_private.is_internal(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','sales','marketing','founder')
  )
$$;

CREATE OR REPLACE FUNCTION app_private.user_company(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- PROFILES
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insertable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by self" ON public.profiles;
CREATE POLICY "profiles_select_own_or_internal" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR app_private.is_internal(auth.uid()));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_self_or_internal" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR app_private.is_internal(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR app_private.is_internal(auth.uid()));

-- USER_ROLES
DROP POLICY IF EXISTS "User roles viewable by authenticated" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "user_roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'))
  WITH CHECK (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));

-- COMPANIES
DROP POLICY IF EXISTS "Companies viewable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies insertable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies updatable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies deletable by authenticated" ON public.companies;
CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR id = app_private.user_company(auth.uid()));
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR id = app_private.user_company(auth.uid()));
CREATE POLICY "companies_delete" ON public.companies FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- CONTACTS
DROP POLICY IF EXISTS "Contacts viewable by authenticated" ON public.contacts;
DROP POLICY IF EXISTS "Contacts insertable by authenticated" ON public.contacts;
DROP POLICY IF EXISTS "Contacts updatable by authenticated" ON public.contacts;
DROP POLICY IF EXISTS "Contacts deletable by authenticated" ON public.contacts;
DROP POLICY IF EXISTS "Contacts manageable by authenticated" ON public.contacts;
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "contacts_insert" ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "contacts_update" ON public.contacts FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));

-- CAMPAIGN_AUDIENCES
DROP POLICY IF EXISTS "Audiences viewable by authenticated" ON public.campaign_audiences;
DROP POLICY IF EXISTS "Audiences insertable by authenticated" ON public.campaign_audiences;
DROP POLICY IF EXISTS "Audiences updatable by authenticated" ON public.campaign_audiences;
DROP POLICY IF EXISTS "Audiences deletable by authenticated" ON public.campaign_audiences;
CREATE POLICY "audiences_select" ON public.campaign_audiences FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "audiences_insert" ON public.campaign_audiences FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "audiences_update" ON public.campaign_audiences FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())))
  WITH CHECK (app_private.is_internal(auth.uid())
              OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                         AND c.company_id = app_private.user_company(auth.uid())));
CREATE POLICY "audiences_delete" ON public.campaign_audiences FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid())
         OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id
                    AND c.company_id = app_private.user_company(auth.uid())));

-- INVOICES
DROP POLICY IF EXISTS "Invoices viewable by authenticated" ON public.invoices;
DROP POLICY IF EXISTS "Invoices insertable by authenticated" ON public.invoices;
DROP POLICY IF EXISTS "Invoices updatable by authenticated" ON public.invoices;
DROP POLICY IF EXISTS "Invoices deletable by authenticated" ON public.invoices;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())) WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- PAYMENTS
DROP POLICY IF EXISTS "Payments viewable by authenticated" ON public.payments;
DROP POLICY IF EXISTS "Payments insertable by authenticated" ON public.payments;
DROP POLICY IF EXISTS "Payments updatable by authenticated" ON public.payments;
DROP POLICY IF EXISTS "Payments deletable by authenticated" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "payments_update" ON public.payments FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())) WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "payments_delete" ON public.payments FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- BILLING_ADJUSTMENTS
DROP POLICY IF EXISTS "Adjustments viewable by authenticated" ON public.billing_adjustments;
DROP POLICY IF EXISTS "Adjustments insertable by authenticated" ON public.billing_adjustments;
DROP POLICY IF EXISTS "Adjustments updatable by authenticated" ON public.billing_adjustments;
DROP POLICY IF EXISTS "Adjustments deletable by authenticated" ON public.billing_adjustments;
CREATE POLICY "adjustments_select" ON public.billing_adjustments FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "adjustments_insert" ON public.billing_adjustments FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "adjustments_update" ON public.billing_adjustments FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())) WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "adjustments_delete" ON public.billing_adjustments FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Subscriptions viewable by authenticated" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions insertable by authenticated" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions updatable by authenticated" ON public.subscriptions;
DROP POLICY IF EXISTS "Subscriptions deletable by authenticated" ON public.subscriptions;
CREATE POLICY "subs_select" ON public.subscriptions FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "subs_insert" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "subs_update" ON public.subscriptions FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid())) WITH CHECK (app_private.is_internal(auth.uid()));
CREATE POLICY "subs_delete" ON public.subscriptions FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- MESSAGES
DROP POLICY IF EXISTS "Messages viewable by authenticated" ON public.messages;
DROP POLICY IF EXISTS "Messages insertable by authenticated" ON public.messages;
DROP POLICY IF EXISTS "Messages updatable by authenticated" ON public.messages;
DROP POLICY IF EXISTS "Messages deletable by authenticated" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()
              AND (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid())));
CREATE POLICY "messages_update" ON public.messages FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "messages_delete" ON public.messages FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Notifications viewable by user" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insertable by authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Notifications updatable by user" ON public.notifications;
DROP POLICY IF EXISTS "Notifications deletable by user" ON public.notifications;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_self_or_internal" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR app_private.is_internal(auth.uid()));
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- CLIENT_DOCUMENTS
DROP POLICY IF EXISTS "Documents viewable by authenticated" ON public.client_documents;
DROP POLICY IF EXISTS "Documents insertable by authenticated" ON public.client_documents;
DROP POLICY IF EXISTS "Documents deletable by authenticated" ON public.client_documents;
CREATE POLICY "docs_select" ON public.client_documents FOR SELECT TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "docs_insert" ON public.client_documents FOR INSERT TO authenticated
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "docs_update" ON public.client_documents FOR UPDATE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()))
  WITH CHECK (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));
CREATE POLICY "docs_delete" ON public.client_documents FOR DELETE TO authenticated
  USING (app_private.is_internal(auth.uid()) OR company_id = app_private.user_company(auth.uid()));

-- ERROR_LOGS
DROP POLICY IF EXISTS "Error logs viewable by authenticated" ON public.error_logs;
DROP POLICY IF EXISTS "Error logs insertable by authenticated" ON public.error_logs;
DROP POLICY IF EXISTS "Error logs updatable by authenticated" ON public.error_logs;
CREATE POLICY "elogs_select" ON public.error_logs FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "elogs_insert" ON public.error_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "elogs_update" ON public.error_logs FOR UPDATE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'))
  WITH CHECK (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "elogs_delete" ON public.error_logs FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));

-- QA_TEST_RESULTS
DROP POLICY IF EXISTS "QA viewable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA insertable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA updatable by authenticated" ON public.qa_test_results;
DROP POLICY IF EXISTS "QA deletable by authenticated" ON public.qa_test_results;
CREATE POLICY "qa_select" ON public.qa_test_results FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "qa_insert" ON public.qa_test_results FOR INSERT TO authenticated
  WITH CHECK (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "qa_update" ON public.qa_test_results FOR UPDATE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'))
  WITH CHECK (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));
CREATE POLICY "qa_delete" ON public.qa_test_results FOR DELETE TO authenticated
  USING (app_private.has_role(auth.uid(),'admin') OR app_private.has_role(auth.uid(),'founder'));

-- STORAGE policies
DROP POLICY IF EXISTS "Authenticated users can view" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "client_docs_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-documents' AND (
    app_private.is_internal(auth.uid())
    OR (storage.foldername(name))[1] = app_private.user_company(auth.uid())::text));
CREATE POLICY "client_docs_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-documents' AND (
    app_private.is_internal(auth.uid())
    OR (storage.foldername(name))[1] = app_private.user_company(auth.uid())::text));
CREATE POLICY "client_docs_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-documents' AND (
    app_private.is_internal(auth.uid())
    OR (storage.foldername(name))[1] = app_private.user_company(auth.uid())::text));
