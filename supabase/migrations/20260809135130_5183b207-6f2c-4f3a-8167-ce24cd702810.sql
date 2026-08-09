create or replace function public.refund_campaign_credits(_ledger_id uuid)
 returns boolean
 language plpgsql
 security definer
 set search_path = 'public'
as $function$
DECLARE
  uid uuid := auth.uid();
  deleted int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  DELETE FROM public.credit_ledger
    WHERE id = _ledger_id AND user_id = uid
      AND (reason LIKE 'spend_%' OR reason IN ('free_preview_spend', 'paid_topup_spend'))
      AND (meta->>'reserved')::boolean IS TRUE;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted > 0;
END;
$function$;