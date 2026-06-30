
-- =========================================
-- DATA VAULT TABLES
-- =========================================

CREATE TABLE public.data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  workspace_id uuid REFERENCES public.client_workspaces(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT 'csv',
  source_path text,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'uploaded',
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_uploads TO authenticated;
GRANT ALL ON public.data_uploads TO service_role;

ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_uploads_owner_all ON public.data_uploads
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX data_uploads_owner_idx ON public.data_uploads(owner_id, created_at DESC);

CREATE TRIGGER trg_data_uploads_updated_at
  BEFORE UPDATE ON public.data_uploads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================

CREATE TABLE public.data_upload_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES public.data_uploads(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  row_number integer NOT NULL,
  raw_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  mapped_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_status text NOT NULL DEFAULT 'valid',
  duplicate_status text NOT NULL DEFAULT 'none',
  duplicate_of_contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  imported_contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  import_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_upload_rows TO authenticated;
GRANT ALL ON public.data_upload_rows TO service_role;

ALTER TABLE public.data_upload_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_upload_rows_owner_all ON public.data_upload_rows
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE INDEX data_upload_rows_upload_idx ON public.data_upload_rows(upload_id, row_number);

-- =========================================

CREATE TABLE public.data_upload_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES public.data_uploads(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  source_column text NOT NULL,
  destination_field text,
  ignored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (upload_id, source_column)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_upload_mappings TO authenticated;
GRANT ALL ON public.data_upload_mappings TO service_role;

ALTER TABLE public.data_upload_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_upload_mappings_owner_all ON public.data_upload_mappings
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- =========================================
-- EXTEND contacts
-- =========================================
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS source_upload_id uuid REFERENCES public.data_uploads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quality_status text DEFAULT 'valid',
  ADD COLUMN IF NOT EXISTS duplicate_flag boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suppressed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz;

CREATE INDEX IF NOT EXISTS contacts_source_upload_idx ON public.contacts(source_upload_id);
CREATE INDEX IF NOT EXISTS contacts_quality_status_idx ON public.contacts(quality_status);

-- =========================================
-- EXTEND companies
-- =========================================
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS source_upload_id uuid REFERENCES public.data_uploads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS language text;

-- companies already has 'country' column from earlier schema
