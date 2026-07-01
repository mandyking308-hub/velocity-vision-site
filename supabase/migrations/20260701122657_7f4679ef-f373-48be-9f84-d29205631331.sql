CREATE OR REPLACE FUNCTION public.provision_first_workspace(
  _name text,
  _industry text DEFAULT NULL,
  _website text DEFAULT NULL,
  _country text DEFAULT NULL
)
RETURNS public.client_workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existing_company uuid;
  new_company uuid;
  ws public.client_workspaces;
  clean_name text := NULLIF(btrim(_name), '');
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF clean_name IS NULL THEN
    RAISE EXCEPTION 'workspace name required';
  END IF;

  SELECT company_id INTO existing_company FROM public.profiles WHERE user_id = uid LIMIT 1;

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
$$;

REVOKE ALL ON FUNCTION public.provision_first_workspace(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.provision_first_workspace(text, text, text, text) TO authenticated;