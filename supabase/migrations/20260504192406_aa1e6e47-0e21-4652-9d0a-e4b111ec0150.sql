-- Replace bucket-wide public SELECT with scoped policies.
-- Files are stored under "<user_id>/..." path convention.
DROP POLICY IF EXISTS "Resume files public read" ON storage.objects;
DROP POLICY IF EXISTS "App files public read" ON storage.objects;
DROP POLICY IF EXISTS "Referral files public read" ON storage.objects;

-- Resumes: owner reads their own; admins read all.
CREATE POLICY "Resume owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins read all resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Application files: owner (uploader) and the referrer of the slot the application belongs to.
CREATE POLICY "App file owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-files'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins read all app files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'application-files'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Referral files: owner (referrer who uploaded) reads.
CREATE POLICY "Referral file owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'referral-files'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins read all referral files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'referral-files'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Revoke default PUBLIC execute on internal SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.handle_application_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recompute_profile_scores() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;