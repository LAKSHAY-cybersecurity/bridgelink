import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "referrer" | "student";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  bridge_code: string | null;
  full_name: string | null;
  bio: string | null;
  skills: string[] | null;
  trust_score: number | null;
  github_username: string | null;
  leetcode_username: string | null;
  resume_url: string | null;
  company: string | null;
  job_title: string | null;
  work_email: string | null;
  linkedin_url: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  role: string | null;
  credibility_score: number | null;
  github_integrity_score: number | null;
  leetcode_authenticity_score: number | null;
  behavioral_score: number | null;
  portfolio_strength_score: number | null;
  referral_readiness_score: number | null;
  education: string | null;
  cgpa: number | null;
  college: string | null;
  branch: string | null;
  graduation_year: number | null;
  certifications: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, profile: null, roles: [], loading: true, signOut: async () => {}, refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    setProfile(data as unknown as Profile);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles((data?.map((r: any) => r.role) || []) as AppRole[]);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const loadUserData = async (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    if (!currentSession?.user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.all([
      fetchProfile(currentSession.user.id),
      fetchRoles(currentSession.user.id),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      void loadUserData(currentSession);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void loadUserData(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, roles, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
