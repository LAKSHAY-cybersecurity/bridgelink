
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'referrer', 'student');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT UNIQUE,
  bridge_code TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  skills TEXT[],
  trust_score INTEGER DEFAULT 0,
  github_username TEXT,
  leetcode_username TEXT,
  resume_url TEXT,
  company TEXT,
  job_title TEXT,
  work_email TEXT,
  linkedin_url TEXT,
  verified BOOLEAN DEFAULT false,
  suspended BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'student',
  credibility_score INTEGER DEFAULT 0,
  github_integrity_score INTEGER DEFAULT 0,
  leetcode_authenticity_score INTEGER DEFAULT 0,
  behavioral_score INTEGER DEFAULT 0,
  portfolio_strength_score INTEGER DEFAULT 0,
  referral_readiness_score INTEGER DEFAULT 0,
  education TEXT,
  cgpa NUMERIC(4,2),
  college TEXT,
  branch TEXT,
  graduation_year INTEGER,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Connections
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral slots
CREATE TABLE public.referral_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role_title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  description TEXT,
  required_skills TEXT[],
  min_trust_score INTEGER DEFAULT 0,
  total_slots INTEGER NOT NULL DEFAULT 1,
  slots_remaining INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  dynamic_criteria JSONB DEFAULT '{}',
  required_uploads JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Applications
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.referral_slots(id) ON DELETE CASCADE NOT NULL,
  cover_note TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application uploads
CREATE TABLE public.application_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  upload_label TEXT NOT NULL DEFAULT 'document',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral completions (when referrer approves)
CREATE TABLE public.referral_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL UNIQUE,
  referrer_message TEXT NOT NULL,
  referral_file_url TEXT,
  referral_file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  related_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fraud logs
CREATE TABLE public.fraud_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderation logs
CREATE TABLE public.moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reason TEXT,
  toxicity_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User blocks
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Referrer credits
CREATE TABLE public.referrer_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== ENABLE RLS ON ALL TABLES =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrer_credits ENABLE ROW LEVEL SECURITY;

-- ===== SECURITY DEFINER FOR ROLE CHECKS =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== RLS POLICIES =====

-- Profiles
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Connections
CREATE POLICY "Users see own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users create connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users update own connections" ON public.connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users delete own connections" ON public.connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Messages
CREATE POLICY "Users see own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Referral slots
CREATE POLICY "Slots viewable by all" ON public.referral_slots FOR SELECT USING (true);
CREATE POLICY "Referrers manage own slots" ON public.referral_slots FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "Referrers update own slots" ON public.referral_slots FOR UPDATE USING (auth.uid() = referrer_id);
CREATE POLICY "Referrers delete own slots" ON public.referral_slots FOR DELETE USING (auth.uid() = referrer_id);

-- Applications
CREATE POLICY "Applicants see own apps" ON public.applications FOR SELECT USING (
  auth.uid() = applicant_id OR
  auth.uid() IN (SELECT referrer_id FROM public.referral_slots WHERE id = slot_id)
);
CREATE POLICY "Users apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Referrers update apps" ON public.applications FOR UPDATE USING (
  auth.uid() IN (SELECT referrer_id FROM public.referral_slots WHERE id = slot_id)
);

-- Application uploads
CREATE POLICY "Upload owners and referrers view" ON public.application_uploads FOR SELECT USING (
  auth.uid() IN (
    SELECT applicant_id FROM public.applications WHERE id = application_id
    UNION
    SELECT rs.referrer_id FROM public.applications a JOIN public.referral_slots rs ON a.slot_id = rs.id WHERE a.id = application_id
  )
);
CREATE POLICY "Applicants upload files" ON public.application_uploads FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT applicant_id FROM public.applications WHERE id = application_id)
);

-- Referral completions
CREATE POLICY "Completion viewable by parties" ON public.referral_completions FOR SELECT USING (
  auth.uid() IN (
    SELECT applicant_id FROM public.applications WHERE id = application_id
    UNION
    SELECT rs.referrer_id FROM public.applications a JOIN public.referral_slots rs ON a.slot_id = rs.id WHERE a.id = application_id
  )
);
CREATE POLICY "Referrers create completions" ON public.referral_completions FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT rs.referrer_id FROM public.applications a JOIN public.referral_slots rs ON a.slot_id = rs.id WHERE a.id = application_id
  )
);

-- Notifications
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System creates notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins view reports" ON public.reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Fraud logs
CREATE POLICY "Admins view fraud" ON public.fraud_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System creates fraud logs" ON public.fraud_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins update fraud" ON public.fraud_logs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Moderation logs
CREATE POLICY "Admins view moderation" ON public.moderation_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System creates moderation logs" ON public.moderation_logs FOR INSERT WITH CHECK (true);

-- User blocks
CREATE POLICY "Users see own blocks" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users create blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users delete own blocks" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Referrer credits
CREATE POLICY "Users see own credits" ON public.referrer_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System creates credits" ON public.referrer_credits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all credits" ON public.referrer_credits FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ===== STORAGE BUCKETS =====
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('application-files', 'application-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('referral-files', 'referral-files', true);

-- Storage policies
CREATE POLICY "Resume files public read" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Users upload own resume" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own resume" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own resume" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "App files public read" ON storage.objects FOR SELECT USING (bucket_id = 'application-files');
CREATE POLICY "Users upload app files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'application-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Referral files public read" ON storage.objects FOR SELECT USING (bucket_id = 'referral-files');
CREATE POLICY "Users upload referral files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'referral-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== TRIGGER FOR AUTO PROFILE CREATION ON SIGNUP =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _username TEXT;
  _bridge_code TEXT;
  _role TEXT;
BEGIN
  _username := LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTR(gen_random_uuid()::TEXT, 1, 4);
  _bridge_code := 'BL-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8));
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  INSERT INTO public.profiles (user_id, username, bridge_code, full_name, role)
  VALUES (NEW.id, _username, _bridge_code, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), _role);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role::app_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== UPDATED_AT TRIGGER =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referral_slots_updated_at BEFORE UPDATE ON public.referral_slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== INDEXES =====
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_bridge_code ON public.profiles(bridge_code);
CREATE INDEX idx_connections_users ON public.connections(requester_id, receiver_id);
CREATE INDEX idx_messages_users ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_applications_slot ON public.applications(slot_id);
CREATE INDEX idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_referral_slots_active ON public.referral_slots(is_active, expires_at);
