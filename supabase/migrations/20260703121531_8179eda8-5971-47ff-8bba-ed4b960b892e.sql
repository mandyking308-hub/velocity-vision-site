-- Hard-enforce Free Preview 25-contact limit at the database level.
-- Any insert path (import, manual, edge function, direct SQL) hits this trigger.
CREATE OR REPLACE FUNCTION public.enforce_free_preview_contact_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_val text;
  cnt int;
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT plan::text INTO plan_val
  FROM public.user_plans
  WHERE user_id = NEW.created_by
  LIMIT 1;

  -- Only enforce for free_preview plan; paid plans (starter/growth/agency) unaffected.
  IF plan_val IS DISTINCT FROM 'free_preview' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO cnt
  FROM public.contacts
  WHERE created_by = NEW.created_by;

  IF cnt >= 25 THEN
    RAISE EXCEPTION 'free_preview_contact_limit_reached'
      USING ERRCODE = 'P0001',
            HINT = 'Free Preview supports up to 25 contacts. Upgrade to Growth to work with larger audiences.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_preview_contact_limit ON public.contacts;
CREATE TRIGGER trg_enforce_free_preview_contact_limit
  BEFORE INSERT ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_preview_contact_limit();