CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NULL,
  workspace_id uuid NULL,
  route text NULL,
  category text NULL,
  severity text NULL,
  status text NOT NULL DEFAULT 'open',
  subject text NULL,
  message text NOT NULL,
  assistant_answer text NULL,
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,
  browser_info text NULL,
  source text NOT NULL DEFAULT 'app',
  assigned_to text NULL,
  resolution_notes text NULL
);

GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT INSERT ON public.support_tickets TO anon;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Anonymous public-site tickets: allow insert only with source='public_site' and no user_id
CREATE POLICY "anon can insert public-site tickets"
ON public.support_tickets FOR INSERT TO anon
WITH CHECK (source = 'public_site' AND user_id IS NULL);

-- Authenticated users can insert their own tickets
CREATE POLICY "users can insert own tickets"
ON public.support_tickets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR (user_id IS NULL AND source = 'public_site'));

-- Users see only their own tickets
CREATE POLICY "users can read own tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admins/founders see all tickets
CREATE POLICY "admins can read all tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

-- Admins/founders can update all tickets
CREATE POLICY "admins can update tickets"
ON public.support_tickets FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);