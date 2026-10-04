-- Prevent tampered or malformed signup metadata from aborting the auth trigger.
-- Only student and referrer may be selected during public signup; admin must be assigned separately.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _username TEXT;
  _bridge_code TEXT;
  _role public.app_role;
BEGIN
  _username := LOWER(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)) || '_' || SUBSTR(gen_random_uuid()::TEXT, 1, 4);
  _bridge_code := 'BL-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8));
  _role := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'referrer' THEN 'referrer'::public.app_role
    ELSE 'student'::public.app_role
  END;

  INSERT INTO public.profiles (user_id, username, bridge_code, full_name, role)
  VALUES (NEW.id, _username, _bridge_code, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), _role::text);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;
