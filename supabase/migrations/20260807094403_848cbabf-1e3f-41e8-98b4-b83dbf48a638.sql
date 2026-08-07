-- 1) Free Preview: authoritative single full-campaign-pack cap, enforced at
--    credit-reservation time so no credits are spent on a rejected attempt.
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
  pack_count int := 0;
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

    -- Free Preview includes exactly ONE full campaign pack. Reject before any
    -- ledger row is written so a blocked attempt never costs credits.
    IF _action = 'full_campaign_pack' THEN
      SELECT COUNT(*) INTO pack_count
      FROM public.campaigns
      WHERE created_by = uid AND pack IS NOT NULL;
      IF pack_count >= 1 THEN
        RAISE EXCEPTION 'free_preview_pack_limit' USING ERRCODE = 'P0001',
          HINT = 'Free Preview includes one full campaign pack. Upgrade to generate more.';
      END IF;
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

-- 2) Recurring cadence is a Growth/Agency capability. Free Preview and Starter
--    may only persist one-off campaigns. Enforced in the database so the rule
--    holds regardless of which client writes the row.
CREATE OR REPLACE FUNCTION public.enforce_recurring_cadence_plan()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  plan_val text;
  owner uuid := COALESCE(NEW.created_by, NEW.owner_id);
BEGIN
  IF NEW.cadence_type IS NULL OR NEW.cadence_type = 'one_off' THEN
    RETURN NEW;
  END IF;
  IF owner IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT plan::text INTO plan_val FROM public.user_plans WHERE user_id = owner LIMIT 1;

  -- Fail closed: unknown plan does not get a recurring campaign.
  IF plan_val IS NULL OR plan_val IN ('free_preview', 'starter') THEN
    RAISE EXCEPTION 'recurring_cadence_requires_growth'
      USING ERRCODE = 'check_violation',
            HINT = 'Recurring cadence is available on Growth and Agency. Starter and Free Preview support one-off campaigns.';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_recurring_cadence_plan ON public.campaigns;
CREATE TRIGGER trg_enforce_recurring_cadence_plan
BEFORE INSERT OR UPDATE OF cadence_type ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.enforce_recurring_cadence_plan();