import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Check, X, Building2, MapPin, Clock, Upload, FileText, Calendar, Trash2 } from "lucide-react";
import { createNotification } from "@/lib/notifications";

interface Slot {
  id: string;
  company: string;
  role_title: string;
  location: string;
  description: string | null;
  required_skills: string[] | null;
  min_trust_score: number | null;
  total_slots: number;
  slots_remaining: number;
  is_active: boolean;
  expires_at: string | null;
  dynamic_criteria: any;
  required_uploads: any;
  created_at: string;
}

interface Application {
  id: string;
  applicant_id: string;
  slot_id: string;
  cover_note: string | null;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null; trust_score: number | null; skills: string[] | null; username: string | null } | null;
  uploads?: { id: string; file_name: string; file_url: string; upload_label: string }[];
}

const ReferrerPanel = () => {
  const { user, roles, profile } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "", role_title: "", location: "", description: "", required_skills: "",
    min_trust_score: 0, total_slots: 1, expires_at: "",
    min_cgpa: "", college_tier: "", branch: "", year: "", certifications: "",
    custom_fields: "" as string,
  });
  const [requiredUploads, setRequiredUploads] = useState<string[]>(["Resume"]);
  const [newUploadLabel, setNewUploadLabel] = useState("");

  // Completion state
  const [completingApp, setCompletingApp] = useState<string | null>(null);
  const [completionMsg, setCompletionMsg] = useState("");
  const completionFileRef = useRef<HTMLInputElement>(null);
  const [completionFileUrl, setCompletionFileUrl] = useState<string | null>(null);
  const [completionFileName, setCompletionFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const isReferrer = roles.includes("referrer");

  useEffect(() => { if (user) fetchSlots(); }, [user]);
  useEffect(() => { if (selectedSlot) fetchApplications(selectedSlot); }, [selectedSlot]);

  const fetchSlots = async () => {
    const { data } = await (supabase.from("referral_slots") as any).select("*").eq("referrer_id", user!.id).order("created_at", { ascending: false });
    setSlots(data || []);
    if (data?.length && !selectedSlot) setSelectedSlot(data[0].id);
  };

  const fetchApplications = async (slotId: string) => {
    const { data: apps } = await (supabase.from("applications") as any).select("*").eq("slot_id", slotId).order("created_at", { ascending: false });
    if (!apps?.length) { setApplications([]); return; }
    const applicantIds = apps.map((a: any) => a.applicant_id);
    const { data: profiles } = await (supabase.from("profiles") as any).select("user_id, full_name, trust_score, skills, username").in("user_id", applicantIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Load uploads for each application
    const appIds = apps.map((a: any) => a.id);
    const { data: uploads } = await (supabase.from("application_uploads") as any).select("*").in("application_id", appIds);
    const uploadMap = new Map<string, any[]>();
    (uploads || []).forEach((u: any) => {
      const arr = uploadMap.get(u.application_id) || [];
      arr.push(u);
      uploadMap.set(u.application_id, arr);
    });

    setApplications(apps.map((a: any) => ({
      ...a,
      profiles: profileMap.get(a.applicant_id) || null,
      uploads: uploadMap.get(a.id) || [],
    })));
  };

  const createSlot = async () => {
    if (!user) return;
    const dynamicCriteria: any = {};
    if (form.min_cgpa) dynamicCriteria.min_cgpa = parseFloat(form.min_cgpa);
    if (form.college_tier) dynamicCriteria.college_tier = form.college_tier;
    if (form.branch) dynamicCriteria.branch = form.branch;
    if (form.year) dynamicCriteria.year = parseInt(form.year);
    if (form.certifications) dynamicCriteria.certifications = form.certifications.split(",").map(s => s.trim()).filter(Boolean);
    if (form.custom_fields) {
      dynamicCriteria.custom_fields = form.custom_fields.split(",").map(s => s.trim()).filter(Boolean);
    }

    const { error } = await (supabase.from("referral_slots") as any).insert({
      referrer_id: user.id, company: form.company, role_title: form.role_title || form.company || "Role", location: form.location || "—",
      description: form.description,
      required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
      min_trust_score: form.min_trust_score, total_slots: Math.max(form.total_slots || 1, 1), slots_remaining: Math.max(form.total_slots || 1, 1),
      expires_at: form.expires_at || null,
      dynamic_criteria: dynamicCriteria,
      required_uploads: requiredUploads.map(label => ({ label, required: true })),
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Slot created!" });
      setShowCreate(false);
      setForm({ company: "", role_title: "", location: "", description: "", required_skills: "", min_trust_score: 0, total_slots: 1, expires_at: "", min_cgpa: "", college_tier: "", branch: "", year: "", certifications: "", custom_fields: "" });
      setRequiredUploads(["Resume"]);
      fetchSlots();
    }
  };

  const deleteSlot = async (slotId: string) => {
    await (supabase.from("referral_slots") as any).delete().eq("id", slotId);
    toast({ title: "Slot deleted" });
    if (selectedSlot === slotId) setSelectedSlot(null);
    fetchSlots();
  };

  const updateStatus = async (appId: string, status: string) => {
    const { error } = await (supabase.from("applications") as any).update({ status }).eq("id", appId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    const app = applications.find(a => a.id === appId);
    if (app) {
      await createNotification(app.applicant_id, "application_update", `Application ${status}`, `Your application has been ${status}.`, appId);
    }

    if (status === "accepted") {
      setCompletingApp(appId);
      toast({ title: "Application accepted!", description: "Now write a referral message and upload a referral letter." });
    } else {
      toast({ title: `Application ${status}` });
    }

    if (selectedSlot) fetchApplications(selectedSlot);
  };

  const handleCompletionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast({ title: "File too large (max 10MB)", variant: "destructive" }); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("referral-files").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("referral-files").getPublicUrl(path);
    setCompletionFileUrl(urlData.publicUrl);
    setCompletionFileName(file.name);
    setUploading(false);
    toast({ title: "File uploaded!" });
  };

  const submitCompletion = async (appId: string) => {
    if (!completionMsg.trim()) { toast({ title: "Please write a referral message", variant: "destructive" }); return; }
    if (!completionFileUrl) { toast({ title: "Please upload a referral letter (PDF/Word/Image)", variant: "destructive" }); return; }

    const { error } = await (supabase.from("referral_completions") as any).insert({
      application_id: appId,
      referrer_message: completionMsg.trim(),
      referral_file_url: completionFileUrl,
      referral_file_name: completionFileName,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    const app = applications.find(a => a.id === appId);
    if (app) {
      await createNotification(app.applicant_id, "referral_complete", "Referral Completed!", "Your referral has been completed. Check your applications to download the referral letter.", appId);
    }

    toast({ title: "Referral completed!" });
    setCompletingApp(null);
    setCompletionMsg("");
    setCompletionFileUrl(null);
    setCompletionFileName("");
  };

  if (!isReferrer) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-10 text-center max-w-md space-y-4">
            <Users className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-xl font-bold">Referrer Access Required</h2>
            <p className="text-sm text-muted-foreground">Contact an admin to upgrade your role.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Referrer Panel</h1>
            <p className="text-sm text-muted-foreground">Manage slots, review candidates, and complete referrals.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1" /> Create Slot
          </Button>
        </div>

        {showCreate && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold">New Referral Slot</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min Trust Score</Label><Input type="number" value={form.min_trust_score} onChange={(e) => setForm({ ...form, min_trust_score: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Total Slots</Label><Input type="number" value={form.total_slots} onChange={(e) => setForm({ ...form, total_slots: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Required Skills (comma-separated)</Label><Input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            </div>

            {/* Dynamic Criteria */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold mb-3">Dynamic Criteria (Optional)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min CGPA</Label><Input type="number" step="0.01" value={form.min_cgpa} onChange={(e) => setForm({ ...form, min_cgpa: e.target.value })} placeholder="e.g. 7.5" /></div>
                <div className="space-y-2"><Label>College Tier</Label><Input value={form.college_tier} onChange={(e) => setForm({ ...form, college_tier: e.target.value })} placeholder="e.g. Tier 1, Tier 2" /></div>
                <div className="space-y-2"><Label>Branch</Label><Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. CSE, ECE" /></div>
                <div className="space-y-2"><Label>Graduation Year</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2025" /></div>
                <div className="space-y-2"><Label>Certifications (comma-separated)</Label><Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="e.g. AWS, GCP" /></div>
                <div className="space-y-2"><Label>Custom Fields (comma-separated)</Label><Input value={form.custom_fields} onChange={(e) => setForm({ ...form, custom_fields: e.target.value })} placeholder="e.g. Portfolio URL, Cover Letter" /></div>
              </div>
            </div>

            {/* Required Uploads */}
            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold mb-3">Required Uploads from Applicant</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {requiredUploads.map((label, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {label}
                    <button onClick={() => setRequiredUploads(prev => prev.filter((_, j) => j !== i))} className="ml-1 text-destructive hover:text-destructive/80"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newUploadLabel} onChange={(e) => setNewUploadLabel(e.target.value)} placeholder="e.g. Project Report, Certificates" className="max-w-xs" />
                <Button variant="outline" size="sm" onClick={() => { if (newUploadLabel.trim()) { setRequiredUploads(prev => [...prev, newUploadLabel.trim()]); setNewUploadLabel(""); } }}>Add</Button>
              </div>
            </div>

            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button onClick={createSlot} className="gradient-primary text-primary-foreground">Create</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">Your Slots</h3>
            {slots.map((slot) => (
              <div key={slot.id} className={`w-full text-left glass rounded-xl p-4 transition-all cursor-pointer ${selectedSlot === slot.id ? "glow-border" : "hover:bg-secondary/50"}`}>
                <div onClick={() => setSelectedSlot(slot.id)}>
                  <p className="font-medium text-sm">{slot.role_title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Building2 className="h-3 w-3" />{slot.company}
                    <MapPin className="h-3 w-3 ml-1" />{slot.location}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{slot.slots_remaining}/{slot.total_slots} slots left</p>
                  {slot.expires_at && (
                    <p className="text-xs text-warning mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Expires: {new Date(slot.expires_at).toLocaleDateString()}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-destructive text-xs mt-2 h-6 px-2" onClick={() => deleteSlot(slot.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            ))}
            {slots.length === 0 && <p className="text-sm text-muted-foreground">No slots yet.</p>}
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">Applications</h3>
            {applications.length === 0 && <p className="text-sm text-muted-foreground">No applications for this slot.</p>}
            {applications.map((app) => (
              <div key={app.id} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{app.profiles?.full_name || "Unknown"} <span className="text-xs text-muted-foreground">@{app.profiles?.username || "—"}</span></p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">Trust: {app.profiles?.trust_score ?? 0}</Badge>
                      <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"} className="text-xs capitalize">{app.status}</Badge>
                    </div>
                  </div>
                  {app.status === "applied" && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => updateStatus(app.id, "accepted")}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(app.id, "rejected")}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {app.profiles?.skills && (
                  <div className="flex flex-wrap gap-1">
                    {app.profiles.skills.slice(0, 5).map((s) => (
                      <span key={s} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                )}

                {/* Uploaded documents */}
                {app.uploads && app.uploads.length > 0 && (
                  <div className="border-t border-border/30 pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Uploaded Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {app.uploads.map((u) => (
                        <a key={u.id} href={u.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline bg-secondary/50 px-2 py-1 rounded">
                          <FileText className="h-3 w-3" /> {u.upload_label}: {u.file_name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion form */}
                {completingApp === app.id && (
                  <div className="border-t border-border/30 pt-3 space-y-3">
                    <h4 className="text-sm font-semibold">Complete Referral</h4>
                    <div className="space-y-2">
                      <Label>Referral Message</Label>
                      <Textarea value={completionMsg} onChange={(e) => setCompletionMsg(e.target.value)}
                        placeholder="Congratulations on completing the referral process..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Upload Referral Letter (PDF/Word/Image) — Mandatory</Label>
                      <input ref={completionFileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleCompletionFileUpload} />
                      {completionFileUrl ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs gap-1"><FileText className="h-3 w-3" />{completionFileName}</Badge>
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { setCompletionFileUrl(null); setCompletionFileName(""); }}>Remove</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => completionFileRef.current?.click()} disabled={uploading}>
                          <Upload className="h-3 w-3 mr-1" /> {uploading ? "Uploading..." : "Upload File"}
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => submitCompletion(app.id)} className="gradient-primary text-primary-foreground text-sm">Submit Completion</Button>
                      <Button variant="outline" onClick={() => setCompletingApp(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReferrerPanel;
