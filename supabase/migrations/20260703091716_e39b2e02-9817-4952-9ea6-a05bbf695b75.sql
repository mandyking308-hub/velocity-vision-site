
-- 1. Tracking table
CREATE TABLE IF NOT EXISTS public.free_preview_accounts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_welcome_at timestamptz NOT NULL DEFAULT now(),
  last_daily_grant_at timestamptz,
  preview_started_at timestamptz NOT NULL DEFAULT now(),
  preview_expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  contact_limit int NOT NULL DEFAULT 25,
  campaign_pack_limit int NOT NULL DEFAULT 1,
  signup_email_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.free_preview_accounts TO authenticated;
GRANT ALL ON public.free_preview_accounts TO service_role;

ALTER TABLE public.free_preview_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own free preview record"
  ON public.free_preview_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Welcome grant RPC (idempotent)
CREATE OR REPLACE FUNCTION public.grant_free_preview_welcome()
RETURNS public.free_preview_accounts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  VALUES (uid, encode(digest(lower(coalesce(email_val,'')), 'sha256'), 'hex'))
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
$$;

GRANT EXECUTE ON FUNCTION public.grant_free_preview_welcome() TO authenticated;

-- 3. Daily grant (cron / service role)
CREATE OR REPLACE FUNCTION public.grant_free_daily_credits()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  bal int;
  add_amt int;
  cnt int := 0;
BEGIN
  FOR r IN
    SELECT fpa.user_id, fpa.preview_expires_at
    FROM public.free_preview_accounts fpa
    WHERE fpa.preview_expires_at > now()
      AND (fpa.last_daily_grant_at IS NULL OR fpa.last_daily_grant_at < date_trunc('day', now()))
  LOOP
    SELECT COALESCE(SUM(
      CASE
        WHEN reason IN ('free_welcome_grant','free_daily_grant') THEN delta
        WHEN reason = 'free_preview_spend' THEN delta
        ELSE 0
      END
    ), 0)::int INTO bal
    FROM public.credit_ledger
    WHERE user_id = r.user_id;

    add_amt := LEAST(2, GREATEST(0, 10 - bal));
    IF add_amt > 0 THEN
      INSERT INTO public.credit_ledger (user_id, delta, reason, meta)
      VALUES (r.user_id, add_amt, 'free_daily_grant', jsonb_build_object('source','free_preview','not_stripe',true));
    END IF;
    UPDATE public.free_preview_accounts SET last_daily_grant_at = now() WHERE user_id = r.user_id;
    cnt := cnt + 1;
  END LOOP;
  RETURN cnt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_free_daily_credits() TO service_role;

-- 4. Update reserve_campaign_credits to (a) reject expired free preview, (b) tag free spends.
CREATE OR REPLACE FUNCTION public.reserve_campaign_credits(_cost integer, _action text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  plan_row public.user_plans;
  fpa public.free_preview_accounts;
  period_start_ts timestamptz;
  inc int := 0;
  used_c int := 0;
  topup int := 0;
  free_bal int := 0;
  remaining int := 0;
  ledger_id uuid;
  spend_reason text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000'; END IF;
  IF _cost IS NULL OR _cost <= 0 THEN RAISE EXCEPTION 'invalid_cost'; END IF;
  IF _action IS NULL OR btrim(_action) = '' THEN RAISE EXCEPTION 'invalid_action'; END IF;

  SELECT * INTO plan_row FROM public.user_plans WHERE user_id = uid LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no_plan' USING ERRCODE = 'P0002';
  END IF;
  IF plan_row.plan = 'starter' AND plan_row.period_end IS NOT NULL AND plan_row.period_end < now() THEN
    RAISE EXCEPTION 'starter_expired' USING ERRCODE = 'P0001';
  END IF;
  IF plan_row.plan = 'free_preview' THEN
    SELECT * INTO fpa FROM public.free_preview_accounts WHERE user_id = uid;
    IF FOUND AND fpa.preview_expires_at < now() THEN
      RAISE EXCEPTION 'free_preview_expired' USING ERRCODE = 'P0001';
    END IF;
    spend_reason := 'free_preview_spend';
  ELSE
    spend_reason := 'spend_' || _action;
  END IF;

  period_start_ts := COALESCE(plan_row.period_start, 'epoch'::timestamptz);

  SELECT COALESCE(SUM(delta),0) INTO inc
    FROM public.credit_ledger
    WHERE user_id = uid AND reason = 'plan_grant' AND created_at >= period_start_ts;
  SELECT COALESCE(SUM(-delta),0) INTO used_c
    FROM public.credit_ledger
    WHERE user_id = uid AND reason LIKE 'spend_%' AND created_at >= period_start_ts;
  SELECT COALESCE(SUM(delta),0) INTO topup
    FROM public.credit_ledger
    WHERE user_id = uid AND reason IN ('topup','stripe_topup','qa_manual_grant','manual_grant');
  SELECT COALESCE(SUM(
    CASE WHEN reason IN ('free_welcome_grant','free_daily_grant') THEN delta
         WHEN reason = 'free_preview_spend' THEN delta
         ELSE 0 END
  ),0) INTO free_bal
    FROM public.credit_ledger WHERE user_id = uid;

  remaining := inc - used_c + topup + free_bal;
  IF remaining < _cost THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.credit_ledger (user_id, delta, reason, meta)
  VALUES (uid, -_cost, spend_reason,
    jsonb_build_object('action', _action, 'cost', _cost, 'reserved', true))
  RETURNING id INTO ledger_id;

  RETURN ledger_id;
END;
$function$;
