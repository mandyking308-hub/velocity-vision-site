DROP POLICY IF EXISTS "anon can insert public-site tickets" ON public.support_tickets;
CREATE POLICY "anon can insert public or demo tickets"
ON public.support_tickets
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND source IN ('public_site','demo'));