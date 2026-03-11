
-- ===========================================
-- CRM DATABASE SCHEMA FOR VELOCITY INFLUENCE
-- ===========================================

-- Enums
CREATE TYPE public.company_status AS ENUM ('prospect', 'active_client', 'past_client');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'demo_scheduled', 'proposal_sent', 'closed_won', 'closed_lost');
CREATE TYPE public.opportunity_stage AS ENUM ('discovery', 'demo', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'marketing', 'founder');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.activity_type AS ENUM ('email', 'call', 'meeting', 'note', 'campaign_interaction');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===========================================
-- PROFILES TABLE
-- ===========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- USER ROLES TABLE
-- ===========================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'founder'));

-- ===========================================
-- COMPANIES TABLE
-- ===========================================
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  country TEXT,
  company_size TEXT,
  status company_status NOT NULL DEFAULT 'prospect',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies viewable by authenticated" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Companies insertable by authenticated" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Companies updatable by authenticated" ON public.companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Companies deletable by authenticated" ON public.companies FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- CONTACTS TABLE
-- ===========================================
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  decision_maker_level TEXT,
  linkedin_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contacts viewable by authenticated" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Contacts insertable by authenticated" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Contacts updatable by authenticated" ON public.contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Contacts deletable by authenticated" ON public.contacts FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- LEADS TABLE
-- ===========================================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'manual',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  marketing_interest TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads viewable by authenticated" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leads insertable by authenticated" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Leads updatable by authenticated" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Leads deletable by authenticated" ON public.leads FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow anonymous inserts for website form submissions
CREATE POLICY "Anonymous can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- ===========================================
-- OPPORTUNITIES TABLE
-- ===========================================
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  service TEXT,
  estimated_value NUMERIC(12,2) DEFAULT 0,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  stage opportunity_stage NOT NULL DEFAULT 'discovery',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Opportunities viewable by authenticated" ON public.opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Opportunities insertable by authenticated" ON public.opportunities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Opportunities updatable by authenticated" ON public.opportunities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Opportunities deletable by authenticated" ON public.opportunities FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- ACTIVITIES TABLE (Contact Timeline)
-- ===========================================
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  type activity_type NOT NULL DEFAULT 'note',
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities viewable by authenticated" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Activities insertable by authenticated" ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- ===========================================
-- NOTES TABLE
-- ===========================================
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes viewable by authenticated" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Notes insertable by authenticated" ON public.notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Notes deletable by authenticated" ON public.notes FOR DELETE TO authenticated USING (true);

-- ===========================================
-- TASKS TABLE
-- ===========================================
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  status task_status NOT NULL DEFAULT 'pending',
  entity_type TEXT,
  entity_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks viewable by authenticated" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks insertable by authenticated" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks updatable by authenticated" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tasks deletable by authenticated" ON public.tasks FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- CAMPAIGN ATTRIBUTIONS TABLE
-- ===========================================
CREATE TABLE public.campaign_attributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  engagement_level TEXT DEFAULT 'low',
  converted_to_opportunity BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attributions viewable by authenticated" ON public.campaign_attributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Attributions insertable by authenticated" ON public.campaign_attributions FOR INSERT TO authenticated WITH CHECK (true);

-- Allow anonymous inserts for contacts/companies from website forms
CREATE POLICY "Anonymous can insert contacts" ON public.contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anonymous can insert companies" ON public.companies FOR INSERT TO anon WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX idx_contacts_company ON public.contacts(company_id);
CREATE INDEX idx_activities_contact ON public.activities(contact_id);
CREATE INDEX idx_notes_entity ON public.notes(entity_type, entity_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
