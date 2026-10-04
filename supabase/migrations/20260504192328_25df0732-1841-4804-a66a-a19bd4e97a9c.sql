-- 1. Tighten overly-permissive RLS INSERT policies
-- application_uploads: already has applicant check via subquery; the "Applicants upload files" is fine.
-- The lint flagged 4 "true" policies. Fix the system-insert ones by restricting to service_role only,
-- since they are written by triggers / edge functions (which run as service_role).

DROP POLICY IF EXISTS "System creates notifications" ON public.notifications;
CREATE POLICY "System creates notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System creates fraud logs" ON public.fraud_logs;
CREATE POLICY "System creates fraud logs"
  ON public.fraud_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System creates moderation logs" ON public.moderation_logs;
CREATE POLICY "System creates moderation logs"
  ON public.moderation_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System creates credits" ON public.referrer_credits;
CREATE POLICY "System creates credits"
  ON public.referrer_credits FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2. Restrict listing on public storage buckets.
-- Files remain accessible by direct URL (bucket is public) but anon cannot enumerate.
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public read application-files" ON storage.objects;
DROP POLICY IF EXISTS "Public read referral-files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view application-files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view referral-files" ON storage.objects;

-- 3. Lock down SECURITY DEFINER function execution.
-- These are trigger functions or internally-used helpers and should not be callable via PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_application_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_profile_scores() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
-- has_role is used inside RLS policies (runs as the policy owner), so it doesn't need direct EXECUTE for clients.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;