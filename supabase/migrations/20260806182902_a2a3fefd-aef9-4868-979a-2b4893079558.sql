ALTER TABLE public.client_workspaces ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE public.client_workspaces DROP CONSTRAINT IF EXISTS client_workspaces_booking_url_https;
ALTER TABLE public.client_workspaces ADD CONSTRAINT client_workspaces_booking_url_https
  CHECK (booking_url IS NULL OR (booking_url ~* '^https://[a-z0-9]' AND length(booking_url) <= 500));

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS meeting_booked_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS meeting_note text;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_meeting_note_len;
ALTER TABLE public.leads ADD CONSTRAINT leads_meeting_note_len CHECK (meeting_note IS NULL OR length(meeting_note) <= 2000);