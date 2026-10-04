-- has_role() is referenced from RLS policies; PostgREST executes them as anon/authenticated.
-- Re-grant EXECUTE so policies don't fail with "permission denied for function has_role".
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;