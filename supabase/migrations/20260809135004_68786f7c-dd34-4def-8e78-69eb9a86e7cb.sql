create or replace function public.grant_free_preview_welcome()
 returns free_preview_accounts
 language plpgsql
 security definer
 set search_path = 'public'
as $function$
DECLARE
  uid uuid := auth.uid();
  existing public.free_preview_accounts;
  email_val text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT * INTO existing FROM public.free_preview_accounts WHERE user_id = uid;
  IF FOUND THEN RETURN existing; END IF;

  SELECT email INTO email_val FROM auth.users WHERE id = uid;

  INSERT INTO public.free_preview_accounts (user_id, signup_email_hash)
  VALUES (uid, encode(extensions.digest(lower(coalesce(email_val,'')), 'sha256'), 'hex'))
  RETURNING * INTO existing;

  -- Provision plan if the user has none
  INSERT INTO public.user_plans (user_id, plan, status, period_start, period_end)
  VALUES (uid, 'free_preview', 'active', now(), existing.preview_expires_at)
  ON CONFLICT (user_id) DO NOTHING;

  -- Welcome credit grant
  INSERT INTO public.credit_ledger (user_id, delta, reason, meta)
  VALUES (uid, 10, 'free_welcome_grant', jsonb_build_object('source','free_preview','not_stripe',true));

  RETURN existing;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$function$;