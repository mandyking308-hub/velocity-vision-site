-- buffer_connection_secrets + buffer_oauth_states: absolute server-only lockdown.
-- RLS (enabled, zero policies) already denies everything to non-service roles;
-- this removes table-level privileges too so a future stray policy cannot expose writes or reads.
REVOKE ALL ON public.buffer_connection_secrets FROM anon, authenticated;
REVOKE ALL ON public.buffer_oauth_states FROM anon, authenticated;

-- buffer_connections: signed-in users read their own status row only (RLS enforces).
-- Strip everything else, including all anonymous access and every client write path.
REVOKE ALL ON public.buffer_connections FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.buffer_connections FROM authenticated;