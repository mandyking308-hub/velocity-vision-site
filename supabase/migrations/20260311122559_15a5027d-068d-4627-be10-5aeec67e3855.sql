
-- Add 'client' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- Add company_id to profiles for client-company linking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Campaign type enum
CREATE TYPE public.campaign_type AS ENUM ('email', 'social_media', 'paid_advertising', 'influencer', 'pr');

-- Campaign status enum
CREATE TYPE public.campaign_status AS ENUM ('active', 'scheduled', 'completed', 'paused');

-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');

-- Campaign request status enum
CREATE TYPE public.campaign_request_status AS ENUM ('pending', 'reviewed', 'approved', 'rejected');

-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  type public.campaign_type NOT NULL DEFAULT 'email',
  start_date date,
  end_date date,
  status public.campaign_status NOT NULL DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns viewable by authenticated" ON public.campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Campaigns insertable by authenticated" ON public.campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Campaigns updatable by authenticated" ON public.campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Campaigns deletable by authenticated" ON public.campaigns FOR DELETE TO authenticated USING (true);

-- Campaign metrics table
CREATE TABLE public.campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  emails_sent integer DEFAULT 0,
  open_rate numeric(5,2) DEFAULT 0,
  click_through_rate numeric(5,2) DEFAULT 0,
  leads_generated integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0,
  ad_spend numeric(12,2) DEFAULT 0,
  cost_per_lead numeric(10,2) DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Metrics viewable by authenticated" ON public.campaign_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Metrics insertable by authenticated" ON public.campaign_metrics FOR INSERT TO authenticated WITH CHECK (true);

-- Client documents table
CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  file_url text NOT NULL,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents viewable by authenticated" ON public.client_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Documents insertable by authenticated" ON public.client_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Documents deletable by authenticated" ON public.client_documents FOR DELETE TO authenticated USING (true);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  file_url text,
  is_from_client boolean NOT NULL DEFAULT true,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by authenticated" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Messages insertable by authenticated" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Messages updatable by authenticated" ON public.messages FOR UPDATE TO authenticated USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  invoice_number text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  due_date date,
  paid_date date,
  description text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices viewable by authenticated" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Invoices insertable by authenticated" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Invoices updatable by authenticated" ON public.invoices FOR UPDATE TO authenticated USING (true);

-- Campaign requests table
CREATE TABLE public.campaign_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  objective text NOT NULL,
  target_audience text,
  budget_range text,
  timeline text,
  notes text,
  status public.campaign_request_status NOT NULL DEFAULT 'pending',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_campaign_requests_updated_at BEFORE UPDATE ON public.campaign_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.campaign_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests viewable by authenticated" ON public.campaign_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Requests insertable by authenticated" ON public.campaign_requests FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Notifications insertable by authenticated" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-documents');
CREATE POLICY "Authenticated users can view" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'client-documents');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-documents');
