import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Access denied", description: error.message, variant: "destructive" });
    } else {
      const { data: currentUser } = await supabase.auth.getUser();
      const { data: roleRows, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.user?.id ?? data.user?.id ?? "");
      if (roleError) {
        await supabase.auth.signOut();
        toast({ title: "Admin check failed", description: roleError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const isAdmin = !roleError && roleRows?.some((row) => row.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "Your account does not have administrator access.", variant: "destructive" });
      } else {
        navigate("/mgmt-panel");
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
          <h1 className="font-display text-2xl font-bold">Management Access</h1>
          <p className="text-sm text-muted-foreground">Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mgmt-email">Email</Label>
            <Input id="mgmt-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mgmt-pass">Password</Label>
            <Input id="mgmt-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? "Verifying..." : "Access Panel"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
