ALTER TABLE public.email_connections
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'not_connected',
  ADD COLUMN IF NOT EXISTS mx_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS dmarc_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS dns_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_errors jsonb,
  ADD COLUMN IF NOT EXISTS sending_enabled boolean NOT NULL DEFAULT false;

-- Backfill domain from from_email when NULL (safe; does not imply verification).
UPDATE public.email_connections
   SET domain = lower(split_part(from_email, '@', 2))
 WHERE domain IS NULL AND from_email IS NOT NULL;

-- Constrain verification_status to a known set.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_connections_verification_status_check'
  ) THEN
    ALTER TABLE public.email_connections
      ADD CONSTRAINT email_connections_verification_status_check
      CHECK (verification_status IN (
        'not_connected','needs_dns_setup','checking','verified','failed','reconnect_required','unknown'
      ));
  END IF;
END $$;