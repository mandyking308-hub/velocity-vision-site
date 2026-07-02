
-- 1) Server-side credit reservation for campaign pack generation
CREATE OR REPLACE FUNCTION public.reserve_campaign_credits(_cost integer, _action text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  plan_row public.user_plans;
  period_start_ts timestamptz;
  inc int := 0;
  used_c int := 0;
  topup int := 0;
  remaining int := 0;
  ledger_id uuid;
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
  period_start_ts := COALESCE(plan_row.period_start, 'epoch'::timestamptz);

  SELECT COALESCE(SUM(delta),0) INTO inc
    FROM public.credit_ledger
    WHERE user_id = uid AND reason = 'plan_grant' AND created_at >= period_start_ts;
  SELECT COALESCE(SUM(-delta),0) INTO used_c
    FROM public.credit_ledger
    WHERE user_id = uid AND reason LIKE 'spend_%' AND created_at >= period_start_ts;
  SELECT COALESCE(SUM(delta),0) INTO topup
    FROM public.credit_ledger
    WHERE user_id = uid AND reason IN ('topup','qa_manual_grant','manual_grant');

  remaining := inc - used_c + topup;
  IF remaining < _cost THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.credit_ledger (user_id, delta, reason, meta)
  VALUES (uid, -_cost, 'spend_' || _action, jsonb_build_object('action', _action, 'cost', _cost, 'reserved', true))
  RETURNING id INTO ledger_id;

  RETURN ledger_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_campaign_credits(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_campaign_credits(integer, text) TO authenticated, service_role;

-- Refund by deleting the reservation row when generation fails.
CREATE OR REPLACE FUNCTION public.refund_campaign_credits(_ledger_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  deleted int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  DELETE FROM public.credit_ledger
    WHERE id = _ledger_id AND user_id = uid AND reason LIKE 'spend_%'
      AND (meta->>'reserved')::boolean IS TRUE;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_campaign_credits(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_campaign_credits(uuid) TO authenticated, service_role;

-- Mark a reservation as consumed (clears the reserved flag so it isn't refundable).
CREATE OR REPLACE FUNCTION public.finalise_campaign_credits(_ledger_id uuid, _ref_id uuid, _label text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  updated int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.credit_ledger
    SET ref_id = COALESCE(_ref_id, ref_id),
        meta = COALESCE(meta, '{}'::jsonb) - 'reserved'
               || jsonb_build_object('label', COALESCE(_label, meta->>'label'))
    WHERE id = _ledger_id AND user_id = uid;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.finalise_campaign_credits(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalise_campaign_credits(uuid, uuid, text) TO authenticated, service_role;

-- 2) Allow internal/admin staff to read legal_acceptances and send_audit_log
CREATE POLICY "Internal staff can view all legal acceptances"
  ON public.legal_acceptances FOR SELECT
  TO authenticated
  USING (app_private.is_internal(auth.uid()));

CREATE POLICY "Internal staff can view all send audit log"
  ON public.send_audit_log FOR SELECT
  TO authenticated
  USING (app_private.is_internal(auth.uid()));
