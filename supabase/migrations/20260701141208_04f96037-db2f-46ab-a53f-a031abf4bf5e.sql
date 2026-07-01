-- Idempotency for credit grants + human_reviews + credit_topups
ALTER TABLE public.credit_ledger ADD COLUMN IF NOT EXISTS dedupe_key text;
CREATE UNIQUE INDEX IF NOT EXISTS credit_ledger_dedupe_key_uidx
  ON public.credit_ledger(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

ALTER TABLE public.credit_topups ADD COLUMN IF NOT EXISTS stripe_session_id text;
CREATE UNIQUE INDEX IF NOT EXISTS credit_topups_stripe_session_uidx
  ON public.credit_topups(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.human_reviews ADD COLUMN IF NOT EXISTS stripe_session_id text;
CREATE UNIQUE INDEX IF NOT EXISTS human_reviews_stripe_session_uidx
  ON public.human_reviews(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;