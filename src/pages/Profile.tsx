import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileText, Upload, Trash2, Loader2, Download, Sparkles, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "", bio: "", github_username: "", leetcode_username: "", skills: "",
    company: "", job_title: "", work_email: "", linkedin_url: "",
    education: "", cgpa: "", college: "", branch: "", graduation_year: "", certifications: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParsePreview, setShowParsePreview] = useState(false);

  // My applications with completions
  const [myApplications, setMyApplications] = useState<any[]>([]);

  const isReferrer = profile?.role === "referrer";

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        github_username: profile.github_username || "",
        leetcode_username: profile.leetcode_username || "",
        skills: profile.skills?.join(", ") || "",
        company: profile.company || "",
        job_title: profile.job_title || "",
        work_email: profile.work_email || "",
        linkedin_url: profile.linkedin_url || "",
        education: profile.education || "",
        cgpa: profile.cgpa?.toString() || "",
        college: profile.college || "",
        branch: profile.branch || "",
        graduation_year: profile.graduation_year?.toString() || "",
        certifications: profile.certifications?.join(", ") || "",
      });
      setResumeUrl(profile.resume_url);
    }
  }, [profile]);

  useEffect(() => {
    if (user) loadMyApplications();
  }, [user]);

  const loadMyApplications = async () => {
    const { data: apps } = await (supabase.from("applications") as any).select("id, status, slot_id, created_at").eq("applicant_id", user!.id).order("created_at", { ascending: false });
    if (!apps?.length) { setMyApplications([]); return; }

    // Load slot info
    const slotIds = apps.map((a: any) => a.slot_id);
    const { data: slots } = await (supabase.from("referral_slots") as any).select("id, company, role_title").in("id", slotIds);
    const slotMap = new Map((slots || []).map((s: any) => [s.id, s]));

    // Load completions
    const appIds = apps.map((a: any) => a.id);
    const { data: completions } = await (supabase.from("referral_completions") as any).select("*").in("application_id", appIds);
    const compMap = new Map((completions || []).map((c: any) => [c.application_id, c]));

    setMyApplications(apps.map((a: any) => ({
      ...a,
      slot: slotMap.get(a.slot_id),
      completion: compMap.get(a.id),
    })));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updateData: any = {
      full_name: form.full_name, bio: form.bio,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      company: form.company, job_title: form.job_title,
      work_email: form.work_email, linkedin_url: form.linkedin_url,
      education: form.education,
      cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
      college: form.college, branch: form.branch,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
    };

    // Only include github/leetcode for students
    if (!isReferrer) {
      updateData.github_username = form.github_username;
      updateData.leetcode_username = form.leetcode_username;
    }

    const { error } = await (supabase.from("profiles") as any).update(updateData).eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Profile updated!" }); refreshProfile(); }
    setSaving(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" }); return; }
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) { toast({ title: "Invalid file type", variant: "destructive" }); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/resume.${ext}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(path);
    await (supabase.from("profiles") as any).update({ resume_url: urlData.publicUrl }).eq("user_id", user.id);
    setResumeUrl(urlData.publicUrl);
    toast({ title: "Resume uploaded!" });
    setUploading(false);

    // Auto-parse resume with AI
    setParsingResume(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("parse-resume", {
        body: { resume_url: urlData.publicUrl },
      });
      if (fnError) throw fnError;
      if (fnData?.data) {
        setParsedData(fnData.data);
        setShowParsePreview(true);
        toast({ title: "Resume parsed!", description: "Review the extracted info below." });
      } else if (fnData?.error) {
        toast({ title: "Parsing issue", description: fnData.error, variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Resume parse error:", err);
      toast({ title: "Could not parse resume", description: "You can fill in your profile manually.", variant: "destructive" });
    } finally {
      setParsingResume(false);
    }
  };

  const handleConfirmParsedData = () => {
    if (!parsedData) return;
    setForm((prev) => ({
      ...prev,
      full_name: parsedData.full_name || prev.full_name,
      skills: parsedData.skills?.join(", ") || prev.skills,
      education: parsedData.education || prev.education,
      cgpa: parsedData.cgpa?.toString() || prev.cgpa,
      college: parsedData.college || prev.college,
      branch: parsedData.branch || prev.branch,
      graduation_year: parsedData.graduation_year?.toString() || prev.graduation_year,
      certifications: parsedData.certifications?.join(", ") || prev.certifications,
      bio: parsedData.bio || prev.bio,
      company: parsedData.company || prev.company,
      job_title: parsedData.job_title || prev.job_title,
    }));
    setShowParsePreview(false);
    setParsedData(null);
    toast({ title: "Profile pre-filled!", description: "Review and click Save Changes to confirm." });
  };

  const handleRemoveResume = async () => {
    if (!user) return;
    setUploading(true);
    await supabase.storage.from("resumes").remove([`${user.id}/resume.pdf`, `${user.id}/resume.docx`, `${user.id}/resume.doc`]);
    await (supabase.from("profiles") as any).update({ resume_url: null }).eq("user_id", user.id);
    setResumeUrl(null);
    toast({ title: "Resume removed." });
    setUploading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            BridgeCode: <span className="font-mono text-primary">{profile?.bridge_code || "—"}</span>
            {" · "}@{profile?.username || "—"}
            {" · "}<Badge variant={isReferrer ? "default" : "secondary"} className="text-xs capitalize">{profile?.role || "student"}</Badge>
          </p>
        </div>

        {/* Trust Score (Students only) */}
        {!isReferrer && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Trust Score
              </h2>
              <span className="text-3xl font-bold gradient-text">{profile?.trust_score ?? 0}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "GitHub Integrity", val: profile?.github_integrity_score ?? 0 },
                { label: "LeetCode Authenticity", val: profile?.leetcode_authenticity_score ?? 0 },
                { label: "Behavioral Score", val: profile?.behavioral_score ?? 0 },
                { label: "Portfolio Strength", val: profile?.portfolio_strength_score ?? 0 },
              ].map(m => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span>{m.val}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-full rounded-full gradient-primary" style={{ width: `${m.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referrer Credibility Score */}
        {isReferrer && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Credibility Score
              </h2>
              <div className="text-right">
                <span className="text-3xl font-bold gradient-text">{profile?.credibility_score ?? 0}</span>
                <p className="text-xs text-muted-foreground">Based on referral success & activity</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p>• Verified work email: {profile?.work_email ? "✅" : "❌ Please add your work email"}</p>
              <p>• LinkedIn: {profile?.linkedin_url ? "✅" : "❌ Please add your LinkedIn URL"}</p>
              <p>• Verification: {profile?.verified ? <Badge className="text-[10px] bg-success/20 text-success">Verified</Badge> : <Badge variant="secondary" className="text-[10px]">Pending</Badge>}</p>
            </div>
          </div>
        )}

        {/* Resume Upload with Auto-parsing */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Resume</h2>
          <p className="text-xs text-muted-foreground">Upload your resume — we'll auto-extract your info and pre-fill your profile.</p>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          {resumeUrl ? (
            <div className="flex items-center gap-3">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline"><FileText className="h-4 w-4" /> View Resume</a>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8" onClick={handleRemoveResume} disabled={uploading}><Trash2 className="h-3.5 w-3.5 mr-1" /> Remove</Button>
            </div>
          ) : <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || parsingResume} className="text-sm">
            {parsingResume ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Parsing resume...</> :
             uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> :
             <><Upload className="h-4 w-4 mr-2" /> Upload Resume (PDF/Word, max 5MB)</>}
          </Button>
        </div>

        {/* My Applications & Referral Letters */}
        {!isReferrer && myApplications.length > 0 && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">My Applications</h2>
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div key={app.id} className="bg-secondary/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{app.slot?.role_title || "—"} at {app.slot?.company || "—"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"} className="text-xs capitalize">{app.status}</Badge>
                  </div>
                  {app.completion && (
                    <div className="border-t border-border/30 pt-2 space-y-2">
                      <p className="text-sm text-success font-medium">🎉 Referral Completed!</p>
                      <p className="text-sm bg-secondary/50 rounded-lg p-3">{app.completion.referrer_message}</p>
                      {app.completion.referral_file_url && (
                        <a href={app.completion.referral_file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-primary/10 px-3 py-2 rounded-lg">
                          <Download className="h-4 w-4" /> Download Referral Letter ({app.completion.referral_file_name})
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled className="opacity-60" /></div>
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div className="space-y-2"><Label>Job Title</Label><Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
            {isReferrer && (
              <>
                <div className="space-y-2"><Label>Work Email (for verification)</Label><Input value={form.work_email} onChange={(e) => setForm({ ...form, work_email: e.target.value })} placeholder="you@company.com" /></div>
                <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." /></div>
              </>
            )}
            {!isReferrer && (
              <>
                <div className="space-y-2"><Label>GitHub Username</Label><Input value={form.github_username} onChange={(e) => setForm({ ...form, github_username: e.target.value })} /></div>
                <div className="space-y-2"><Label>LeetCode Username</Label><Input value={form.leetcode_username} onChange={(e) => setForm({ ...form, leetcode_username: e.target.value })} /></div>
                <div className="space-y-2"><Label>Education</Label><Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="B.Tech CSE" /></div>
                <div className="space-y-2"><Label>CGPA</Label><Input type="number" step="0.01" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} placeholder="8.5" /></div>
                <div className="space-y-2"><Label>College</Label><Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
                <div className="space-y-2"><Label>Branch</Label><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="CSE, ECE..." /></div>
                <div className="space-y-2"><Label>Graduation Year</Label><Input type="number" value={form.graduation_year} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} /></div>
                <div className="space-y-2"><Label>Certifications (comma-separated)</Label><Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} /></div>
              </>
            )}
          </div>
          <div className="space-y-2"><Label>Skills (comma-separated)</Label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Go, Python" /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} /></div>
          <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">{saving ? "Saving..." : "Save Changes"}</Button>
        </div>

        {/* AI Resume Parse Preview Dialog */}
        <Dialog open={showParsePreview} onOpenChange={setShowParsePreview}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Resume Data Extracted
              </DialogTitle>
            </DialogHeader>
            {parsedData && (
              <div className="space-y-3 text-sm">
                {[
                  { label: "Full Name", value: parsedData.full_name },
                  { label: "Education", value: parsedData.education },
                  { label: "College", value: parsedData.college },
                  { label: "Branch", value: parsedData.branch },
                  { label: "CGPA", value: parsedData.cgpa },
                  { label: "Graduation Year", value: parsedData.graduation_year },
                  { label: "Company", value: parsedData.company },
                  { label: "Job Title", value: parsedData.job_title },
                  { label: "Skills", value: parsedData.skills?.join(", ") },
                  { label: "Certifications", value: parsedData.certifications?.join(", ") },
                  { label: "Bio", value: parsedData.bio },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex gap-2">
                    <span className="text-muted-foreground min-w-[120px] shrink-0">{f.label}:</span>
                    <span className="font-medium">{f.value}</span>
                  </div>
                ))}
                {Object.values(parsedData).every(v => !v) && (
                  <p className="text-muted-foreground">No data could be extracted from this resume.</p>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setShowParsePreview(false); setParsedData(null); }}>
                <X className="h-4 w-4 mr-1" /> Discard
              </Button>
              <Button onClick={handleConfirmParsedData} className="gradient-primary text-primary-foreground">
                <Check className="h-4 w-4 mr-1" /> Apply to Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
