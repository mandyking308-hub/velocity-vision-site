
-- QA workspace seed + reset RPCs, admin-only via has_role
CREATE OR REPLACE FUNCTION public.provision_qa_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  admin_ok boolean;
  qa_company uuid;
  qa_ws uuid;
  upload_id uuid;
  camp_id uuid;
  c_ids uuid[] := ARRAY[]::uuid[];
  contact_ids uuid[] := ARRAY[]::uuid[];
  tmp uuid;
  co RECORD;
  i int;
  first_names text[] := ARRAY['Alex','Priya','Sam','Maria','Theo','Jordan','Nadia','Kai','Ines','Diego','Rhea','Owen','Lena','Marcus','Sofia','Yuki','Ravi','Camille','Noor','Erik'];
  last_names text[] := ARRAY['Demo','Testson','Example','Sample','Sandbox'];
  qual text[] := ARRAY['valid','valid','valid','valid','needs_review','risky','blocked','valid','valid','needs_review','valid','risky'];
  companies_seed text[] := ARRAY[
    'Northstar Example Ltd','Bluefield Example Group','Orchard Example Services',
    'Meridian Example Partners','Atlas Example Studio','Redwood Example Systems',
    'Harbour Example Co','Summit Example Labs'
  ];
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  admin_ok := public.has_role(uid, 'admin');
  IF NOT admin_ok THEN RAISE EXCEPTION 'admin only'; END IF;

  -- Reuse existing QA company if present, else create one
  SELECT id INTO qa_company FROM public.companies
    WHERE name = 'Velocity QA Test Company' LIMIT 1;
  IF qa_company IS NULL THEN
    INSERT INTO public.companies (name, account_type, status, country, created_by, industry, website)
    VALUES ('Velocity QA Test Company','business','active_client','GB', uid,'Internal QA','https://example.com')
    RETURNING id INTO qa_company;
  END IF;

  -- Reuse existing QA workspace if present
  SELECT id INTO qa_ws FROM public.client_workspaces
    WHERE name = 'TEST WORKSPACE — Velocity QA' AND agency_company_id = qa_company LIMIT 1;
  IF qa_ws IS NULL THEN
    INSERT INTO public.client_workspaces (agency_company_id, name, industry, website, default_country)
    VALUES (qa_company,'TEST WORKSPACE — Velocity QA','Internal QA','https://example.com','GB')
    RETURNING id INTO qa_ws;
  END IF;

  -- Clean any prior seeded rows scoped to THIS ws only
  DELETE FROM public.opportunities WHERE workspace_id = qa_ws;
  DELETE FROM public.leads WHERE workspace_id = qa_ws;
  DELETE FROM public.campaigns WHERE workspace_id = qa_ws;
  DELETE FROM public.data_uploads WHERE workspace_id = qa_ws;
  -- Contacts/companies have no workspace scope; scope by qa_company + example. domain
  DELETE FROM public.contacts
    WHERE company_id = qa_company OR (email IS NOT NULL AND email ILIKE '%@example.%');
  DELETE FROM public.companies
    WHERE id <> qa_company AND (name ILIKE '% Example %' OR name ILIKE '%Example Ltd' OR name ILIKE '%Example Group' OR name ILIKE '%Example Services' OR name ILIKE '%Example Partners' OR name ILIKE '%Example Studio' OR name ILIKE '%Example Systems' OR name ILIKE '%Example Co' OR name ILIKE '%Example Labs');

  -- Seed a data_upload for import history
  INSERT INTO public.data_uploads (owner_id, workspace_id, file_name, file_type, row_count, status, summary)
  VALUES (uid, qa_ws, 'qa_seed_contacts.csv','csv', 16,'imported',
    jsonb_build_object('rows',16,'valid',10,'needs_review',3,'risky',2,'blocked',1,'duplicates',0))
  RETURNING id INTO upload_id;

  -- Seed companies
  FOR i IN 1..array_length(companies_seed,1) LOOP
    INSERT INTO public.companies (name, account_type, status, country, created_by, industry, website, source_upload_id)
    VALUES (companies_seed[i],'business','prospect','GB', uid,'Internal QA','https://example.com', upload_id)
    RETURNING id INTO tmp;
    c_ids := array_append(c_ids, tmp);
  END LOOP;

  -- Seed contacts (16)
  FOR i IN 1..16 LOOP
    INSERT INTO public.contacts (
      first_name, last_name, email, company_id, created_by,
      quality_status, source_upload_id, country, job_title
    )
    VALUES (
      first_names[((i-1) % array_length(first_names,1)) + 1],
      last_names[((i-1) % array_length(last_names,1)) + 1],
      lower(first_names[((i-1) % array_length(first_names,1)) + 1]) || '.demo+' || i::text || '@example.' ||
        CASE (i % 3) WHEN 0 THEN 'com' WHEN 1 THEN 'org' ELSE 'net' END,
      c_ids[((i-1) % array_length(c_ids,1)) + 1],
      uid,
      qual[((i-1) % array_length(qual,1)) + 1],
      upload_id, 'GB','Head of Example'
    )
    RETURNING id INTO tmp;
    contact_ids := array_append(contact_ids, tmp);
  END LOOP;

  -- Seed a draft campaign
  INSERT INTO public.campaigns (name, description, type, status, created_by, owner_id, workspace_id, company_id, goal, campaign_kind, cadence_type)
  VALUES ('QA Draft — Example Outreach','Internal QA seeded campaign','email','draft', uid, uid, qa_ws, qa_company,'awareness','email','one_off')
  RETURNING id INTO camp_id;

  -- Seed a planning campaign
  INSERT INTO public.campaigns (name, description, type, status, created_by, owner_id, workspace_id, company_id, goal, campaign_kind, cadence_type, start_at)
  VALUES ('QA Planning — Weekly Nurture','Internal QA seeded weekly cadence','email','scheduled', uid, uid, qa_ws, qa_company,'nurture','email','weekly', now() + interval '2 days');

  -- Seed leads in various states
  FOR i IN 1..6 LOOP
    INSERT INTO public.leads (source, contact_id, company_id, created_by, campaign_id, name, email, workspace_id,
      status, follow_up_state, follow_up_at, last_email_sent_at)
    VALUES (
      'qa_seed', contact_ids[i], c_ids[((i-1) % array_length(c_ids,1)) + 1], uid, camp_id,
      'Lead ' || i, 'lead' || i || '@example.com', qa_ws,
      CASE i WHEN 1 THEN 'new'::lead_status WHEN 2 THEN 'contacted'::lead_status WHEN 3 THEN 'qualified'::lead_status ELSE 'new'::lead_status END,
      CASE i WHEN 1 THEN 'due'::lead_follow_state WHEN 2 THEN 'overdue'::lead_follow_state WHEN 3 THEN 'warm'::lead_follow_state ELSE 'none'::lead_follow_state END,
      CASE i WHEN 1 THEN now() WHEN 2 THEN now() - interval '3 days' ELSE NULL END,
      CASE WHEN i <= 3 THEN now() - (i || ' days')::interval ELSE NULL END
    );
  END LOOP;

  -- Seed one opportunity
  INSERT INTO public.opportunities (company_id, contact_id, service, estimated_value, probability, stage, created_by, owner_id, workspace_id, source_campaign_id, stage_changed_at)
  VALUES (c_ids[1], contact_ids[1],'Example services', 5000, 30,'discovery', uid, uid, qa_ws, camp_id, now());

  RETURN qa_ws;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_qa_workspace()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  qa_company uuid;
  qa_ws uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.has_role(uid,'admin') THEN RAISE EXCEPTION 'admin only'; END IF;

  SELECT id INTO qa_company FROM public.companies WHERE name = 'Velocity QA Test Company' LIMIT 1;
  IF qa_company IS NULL THEN RETURN false; END IF;
  SELECT id INTO qa_ws FROM public.client_workspaces
    WHERE name = 'TEST WORKSPACE — Velocity QA' AND agency_company_id = qa_company LIMIT 1;

  IF qa_ws IS NOT NULL THEN
    DELETE FROM public.opportunities WHERE workspace_id = qa_ws;
    DELETE FROM public.leads WHERE workspace_id = qa_ws;
    DELETE FROM public.email_sends WHERE workspace_id = qa_ws;
    DELETE FROM public.campaigns WHERE workspace_id = qa_ws;
    DELETE FROM public.data_uploads WHERE workspace_id = qa_ws;
  END IF;

  DELETE FROM public.contacts
    WHERE company_id = qa_company OR (email IS NOT NULL AND email ILIKE '%@example.%');
  DELETE FROM public.companies
    WHERE id <> qa_company AND (name ILIKE '%Example Ltd' OR name ILIKE '%Example Group' OR name ILIKE '%Example Services' OR name ILIKE '%Example Partners' OR name ILIKE '%Example Studio' OR name ILIKE '%Example Systems' OR name ILIKE '%Example Co' OR name ILIKE '%Example Labs');

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.provision_qa_workspace() FROM public, anon;
REVOKE ALL ON FUNCTION public.reset_qa_workspace() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.provision_qa_workspace() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_qa_workspace() TO authenticated;
