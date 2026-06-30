
-- User-centric self-serve plans
CREATE TABLE public.user_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT ALL ON public.user_plans TO service_role;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plan select" ON public.user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own plan insert" ON public.user_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plan update" ON public.user_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_user_plans BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Credit ledger (source of truth for balance)
CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_ledger_user_idx ON public.credit_ledger(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ledger select" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ledger insert" ON public.credit_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Human review purchases
CREATE TABLE public.human_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'purchased',
  amount numeric(10,2) NOT NULL DEFAULT 199,
  notes text,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX human_reviews_user_idx ON public.human_reviews(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.human_reviews TO authenticated;
GRANT ALL ON public.human_reviews TO service_role;
ALTER TABLE public.human_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own review select" ON public.human_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own review insert" ON public.human_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own review update" ON public.human_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_human_reviews BEFORE UPDATE ON public.human_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Top-up purchases (record + ledger entry mirrored)
CREATE TABLE public.credit_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack text NOT NULL,
  credits integer NOT NULL,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_topups_user_idx ON public.credit_topups(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.credit_topups TO authenticated;
GRANT ALL ON public.credit_topups TO service_role;
ALTER TABLE public.credit_topups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own topup select" ON public.credit_topups FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own topup insert" ON public.credit_topups FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
