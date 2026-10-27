-- has_role is only needed by signed-in users (RLS policies and the admin check).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
-- admin_exists intentionally stays public: it only returns true/false so the
-- sign-in page knows whether to offer first-time owner setup.
