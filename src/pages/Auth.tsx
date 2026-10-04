import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type ViewMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [view, setView] = useState<ViewMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "referrer">("student");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/dashboard");
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setView("login");
      }
      setLoading(false);
      return;
    }

    if (view === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setNeedsConfirmation(error.code === "email_not_confirmed" || error.message.toLowerCase().includes("email not confirmed"));
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        setNeedsConfirmation(false);
        navigate("/dashboard");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        setPassword("");
        toast({ title: "Check your email", description: "We sent you a verification link. You must verify your email before signing in." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">
            {view === "login" ? "Welcome back" : view === "signup" ? "Create account" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {view === "login"
              ? "Sign in to your BridgeLink account"
              : view === "signup"
              ? "Join the trust-based referral network"
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Johnson" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          {view !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
          )}
          {view === "signup" && (
            <div className="space-y-2">
              <Label>I am a…</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["student", "referrer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {r === "student" ? "🎓 Student" : "🤝 Referrer"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading
              ? "Loading..."
              : view === "login"
              ? "Sign In"
              : view === "signup"
              ? "Create Account"
              : "Send Reset Link"}
          </Button>
        </form>

        {view === "login" && needsConfirmation && (
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const { error } = await supabase.auth.resend({ type: "signup", email });
              toast(error
                ? { title: "Could not resend email", description: error.message, variant: "destructive" }
                : { title: "Verification email resent", description: "Check your inbox and spam folder for the new link." });
              setLoading(false);
            }}
            className="block w-full text-center text-xs text-primary hover:underline disabled:opacity-50"
          >
            Resend verification email
          </button>
        )}

        {view === "login" && (
          <button onClick={() => setView("forgot")} className="block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors">
            Forgot your password?
          </button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {view === "forgot" ? (
            <button onClick={() => setView("login")} className="text-primary hover:underline">Back to sign in</button>
          ) : view === "login" ? (
            <>Don't have an account?{" "}<button onClick={() => setView("signup")} className="text-primary hover:underline">Sign up</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => setView("login")} className="text-primary hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
