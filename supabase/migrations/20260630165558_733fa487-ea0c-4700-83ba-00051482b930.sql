
-- human_reviews: remove user UPDATE policy to prevent self-escalation of status/amount
DROP POLICY IF EXISTS "own review update" ON public.human_reviews;

-- user_plans: explicitly block authenticated INSERT/UPDATE/DELETE
REVOKE INSERT, UPDATE, DELETE ON public.user_plans FROM authenticated;

CREATE POLICY "no user insert" ON public.user_plans
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "no user update" ON public.user_plans
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "no user delete" ON public.user_plans
  FOR DELETE TO authenticated USING (false);
