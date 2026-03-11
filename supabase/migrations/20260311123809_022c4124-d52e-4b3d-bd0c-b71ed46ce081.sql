
-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'starter',
  monthly_price numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  renewal_date date,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions viewable by authenticated" ON public.subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subscriptions insertable by authenticated" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Subscriptions updatable by authenticated" ON public.subscriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Subscriptions deletable by authenticated" ON public.subscriptions FOR DELETE TO authenticated USING (true);

-- Payment history table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments viewable by authenticated" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payments insertable by authenticated" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);

-- Credits/adjustments table
CREATE TABLE public.billing_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'credit',
  amount numeric NOT NULL DEFAULT 0,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adjustments viewable by authenticated" ON public.billing_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Adjustments insertable by authenticated" ON public.billing_adjustments FOR INSERT TO authenticated WITH CHECK (true);
