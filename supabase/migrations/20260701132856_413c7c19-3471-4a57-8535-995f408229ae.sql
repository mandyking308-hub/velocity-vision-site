
GRANT USAGE ON SCHEMA app_private TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION app_private.user_can_access_workspace(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.user_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_internal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
