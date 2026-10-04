-- Required when Supabase Data API automatic table exposure is disabled.
-- RLS still limits reads to the current user's own roles.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
