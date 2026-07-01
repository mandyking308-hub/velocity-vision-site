
CREATE OR REPLACE FUNCTION public.provision_first_workspace(_name text, _industry text DEFAULT NULL::text, _website text DEFAULT NULL::text, _country text DEFAULT NULL::text)
 RETURNS client_workspaces
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  existing_company uuid;
  new_company uuid;
  ws public.client_workspaces;
  clean_name text := NULLIF(btrim(_name), '');
  user_plan_row public.user_plans;
  ws_count int := 0;
  is_admin boolean := false;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF clean_name IS NULL THEN
    RAISE EXCEPTION 'workspace name required';
  END IF;

  is_admin := public.has_role(uid, 'admin');

  SELECT company_id INTO existing_company FROM public.profiles WHERE user_id = uid LIMIT 1;

  -- Plan-aware workspace limit: starter/growth = 1, agency = unlimited.
  -- Admins bypass the check for founder/QA tooling.
  IF NOT is_admin AND existing_company IS NOT NULL THEN
    SELECT COUNT(*) INTO ws_count
    FROM public.client_workspaces
    WHERE agency_company_id = existing_company;

    SELECT * INTO user_plan_row FROM public.user_plans WHERE user_id = uid LIMIT 1;

    IF user_plan_row.plan IS DISTINCT FROM 'agency' AND ws_count >= 1 THEN
      RAISE EXCEPTION 'Your plan allows only 1 workspace. Upgrade to Agency for multiple client workspaces.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF existing_company IS NULL THEN
    INSERT INTO public.companies (name, account_type, status, country, created_by)
    VALUES (clean_name, 'business', 'active_client', _country, uid)
    RETURNING id INTO new_company;

    UPDATE public.profiles SET company_id = new_company WHERE user_id = uid;
  ELSE
    new_company := existing_company;
  END IF;

  INSERT INTO public.client_workspaces (agency_company_id, name, industry, website, default_country)
  VALUES (new_company, clean_name, _industry, _website, _country)
  RETURNING * INTO ws;

  RETURN ws;
END;
$function$;
