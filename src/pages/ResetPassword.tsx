import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // Also check hash params
    if (window.location.hash.includes("type=recovery")) setReady(true);

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-strong rounded-2xl p-8 text-center space-y-4">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-display text-xl font-bold">Verifying reset link…</h1>
          <p className="text-sm text-muted-foreground">If this takes too long, your link may have expired.</p>
          <Button variant="outline" onClick={() => navigate("/auth")}>Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-display text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
