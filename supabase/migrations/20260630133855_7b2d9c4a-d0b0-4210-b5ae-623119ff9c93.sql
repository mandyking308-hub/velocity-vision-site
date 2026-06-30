CREATE TABLE public.send_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID,
  campaign_id UUID,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.send_audit_log TO authenticated;
GRANT ALL ON public.send_audit_log TO service_role;
ALTER TABLE public.send_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own send audit log"
  ON public.send_audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own send audit log"
  ON public.send_audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX send_audit_log_user_idx ON public.send_audit_log(user_id, created_at DESC);