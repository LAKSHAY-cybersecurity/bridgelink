import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Lock, Bell, Trash2, Flag, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ reported_user_id: "", reason: "", description: "" });
  const [submittingReport, setSubmittingReport] = useState(false);

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated!" }); setNewPassword(""); }
    setChangingPw(false);
  };

  const submitReport = async () => {
    if (!user || !reportForm.reason) {
      toast({ title: "Please fill in the reason", variant: "destructive" });
      return;
    }
    setSubmittingReport(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: reportForm.reported_user_id || user.id,
      reason: reportForm.reason,
      description: reportForm.description || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Report submitted", description: "Our team will review it shortly." });
      setShowReport(false);
      setReportForm({ reported_user_id: "", reason: "", description: "" });
    }
    setSubmittingReport(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences and platform compliance.</p>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary" /> Account</h2>
          <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled className="opacity-60" /></div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</h2>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
          <Button onClick={changePassword} disabled={changingPw} className="gradient-primary text-primary-foreground">{changingPw ? "Updating..." : "Update Password"}</Button>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates about applications and referrals</p></div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
        </div>

        {/* Ethics & Compliance - Report */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Ethics & Compliance</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>No paid referrals</strong> — monetizing referrals is strictly prohibited</p>
            <p>• <strong>No discrimination</strong> — all users are evaluated on merit only</p>
            <p>• <strong>Transparent moderation</strong> — all actions are logged and reviewable</p>
            <p>• <strong>Anti-bias monitoring</strong> — AI systems are audited for fairness</p>
          </div>
          <Button variant="outline" onClick={() => setShowReport(!showReport)} className="gap-2">
            <Flag className="h-4 w-4" /> Report a Violation
          </Button>
          {showReport && (
            <div className="space-y-3 border-t border-border/30 pt-4">
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={reportForm.reason} onValueChange={(v) => setReportForm({ ...reportForm, reason: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid_referral">Paid Referral Solicitation</SelectItem>
                    <SelectItem value="discrimination">Discrimination</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="fake_profile">Fake Profile</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>User ID (optional)</Label>
                <Input value={reportForm.reported_user_id} onChange={(e) => setReportForm({ ...reportForm, reported_user_id: e.target.value })} placeholder="Paste the user ID if known" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} placeholder="Describe the violation..." rows={3} />
              </div>
              <Button onClick={submitReport} disabled={submittingReport} className="gradient-primary text-primary-foreground">
                {submittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 space-y-4 border-destructive/30">
          <h2 className="font-display font-semibold flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /> Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
