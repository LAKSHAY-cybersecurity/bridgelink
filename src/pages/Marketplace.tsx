import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Building2, MapPin, Code, Users, ShieldAlert, Upload, FileText, Loader2, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/lib/notifications";

interface Slot {
  id: string; company: string; role_title: string; location: string; description: string | null;
  required_skills: string[] | null; min_trust_score: number | null; total_slots: number;
  slots_remaining: number; is_active: boolean; expires_at: string | null;
  dynamic_criteria: any; required_uploads: any; referrer_id: string; created_at: string;
}

const Marketplace = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSlots, setAppliedSlots] = useState<Set<string>>(new Set());
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Map<string, File>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (supabase.from("referral_slots") as any).select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }: any) => {
        // Filter out expired
        const now = new Date();
        const active = (data || []).filter((s: Slot) => !s.expires_at || new Date(s.expires_at) > now);
        setSlots(active);
      });

    if (user) {
      (supabase.from("applications") as any).select("slot_id").eq("applicant_id", user.id)
        .then(({ data }: any) => setAppliedSlots(new Set((data || []).map((a: any) => a.slot_id))));
    }
  }, [user]);

  const isEligible = (slot: Slot) => {
    if ((profile?.trust_score ?? 0) < (slot.min_trust_score ?? 0)) return false;
    const dc = slot.dynamic_criteria || {};
    if (dc.min_cgpa && (profile?.cgpa ?? 0) < dc.min_cgpa) return false;
    if (dc.year && profile?.graduation_year !== dc.year) return false;
    return true;
  };

  const getIneligibilityReason = (slot: Slot) => {
    if ((profile?.trust_score ?? 0) < (slot.min_trust_score ?? 0)) return `Trust score ${slot.min_trust_score} required (yours: ${profile?.trust_score ?? 0})`;
    const dc = slot.dynamic_criteria || {};
    if (dc.min_cgpa && (profile?.cgpa ?? 0) < dc.min_cgpa) return `CGPA ${dc.min_cgpa} required`;
    if (dc.year && profile?.graduation_year !== dc.year) return `Graduation year ${dc.year} required`;
    return "";
  };

  const handleFileChange = (label: string, file: File | null) => {
    setUploadFiles(prev => {
      const next = new Map(prev);
      if (file) next.set(label, file);
      else next.delete(label);
      return next;
    });
  };

  const submitApplication = async (slot: Slot) => {
    if (!user) return;
    const requiredUploads: any[] = slot.required_uploads || [];
    const requiredLabels = requiredUploads.filter((u: any) => u.required).map((u: any) => u.label);

    // Check all required uploads are present
    for (const label of requiredLabels) {
      if (!uploadFiles.has(label)) {
        toast({ title: `Missing required upload: ${label}`, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);

    // Create application
    const { data: appData, error } = await (supabase.from("applications") as any).insert({
      applicant_id: user.id, slot_id: slot.id,
    }).select("id").single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Upload files
    for (const [label, file] of uploadFiles.entries()) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${appData.id}/${Date.now()}_${label}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("application-files").upload(path, file);
      if (uploadErr) {
        toast({ title: `Upload failed for ${label}`, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("application-files").getPublicUrl(path);
      await (supabase.from("application_uploads") as any).insert({
        application_id: appData.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        upload_label: label,
      });
    }

    // Notify referrer
    await createNotification(slot.referrer_id, "new_application", "New Application", `A student applied to your ${slot.role_title} slot.`, appData.id);

    toast({ title: "Application submitted!" });
    setAppliedSlots(prev => new Set([...prev, slot.id]));
    setApplyingTo(null);
    setUploadFiles(new Map());
    setSubmitting(false);
  };

  const filtered = slots.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.role_title.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) ||
      (s.required_skills || []).some(sk => sk.toLowerCase().includes(q));
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Referral Marketplace</h1>
          <p className="text-sm text-muted-foreground">Browse verified referral slots from top companies.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search roles, companies, skills..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} slot{filtered.length !== 1 ? "s" : ""} found</p>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const eligible = isEligible(s);
            const hasApplied = appliedSlots.has(s.id);
            const dc = s.dynamic_criteria || {};
            const ru: any[] = s.required_uploads || [];

            return (
              <div key={s.id} className="glass rounded-2xl p-5 hover:glow-border transition-all duration-300 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-semibold">{s.role_title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{s.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Trust ≥ {s.min_trust_score ?? 0}</span>
                </div>

                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {(s.required_skills || []).map((sk) => (
                    <span key={sk} className="text-[11px] bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground flex items-center gap-1">
                      <Code className="h-3 w-3" />{sk}
                    </span>
                  ))}
                </div>

                {/* Dynamic criteria display */}
                {Object.keys(dc).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dc.min_cgpa && <Badge variant="outline" className="text-[10px]">CGPA ≥ {dc.min_cgpa}</Badge>}
                    {dc.college_tier && <Badge variant="outline" className="text-[10px]">{dc.college_tier}</Badge>}
                    {dc.branch && <Badge variant="outline" className="text-[10px]">{dc.branch}</Badge>}
                    {dc.year && <Badge variant="outline" className="text-[10px]">Year: {dc.year}</Badge>}
                    {dc.certifications?.map((c: string) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                  </div>
                )}

                {/* Required uploads info */}
                {ru.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-muted-foreground">Required:</span>
                    {ru.map((u: any, i: number) => <Badge key={i} variant="secondary" className="text-[10px]"><Upload className="h-2.5 w-2.5 mr-0.5" />{u.label}</Badge>)}
                  </div>
                )}

                {s.expires_at && <p className="text-[10px] text-warning">Expires: {new Date(s.expires_at).toLocaleDateString()}</p>}

                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />{s.slots_remaining}/{s.total_slots} remaining
                  </span>

                  {hasApplied ? (
                    <Badge variant="secondary" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Applied</Badge>
                  ) : !eligible ? (
                    <Badge variant="destructive" className="text-xs"><ShieldAlert className="h-3 w-3 mr-1" /> {getIneligibilityReason(s)}</Badge>
                  ) : applyingTo === s.id ? null : (
                    <Button size="sm" onClick={() => setApplyingTo(s.id)} className="gradient-primary text-primary-foreground text-xs h-8">Apply</Button>
                  )}
                </div>

                {/* Apply form with uploads */}
                {applyingTo === s.id && (
                  <div className="border-t border-border/30 pt-3 space-y-3">
                    <h4 className="text-sm font-semibold">Upload Required Documents</h4>
                    {ru.map((u: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-xs">{u.label} {u.required && <span className="text-destructive">*</span>}</Label>
                        <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(u.label, e.target.files?.[0] || null)} className="text-xs h-9" />
                        {uploadFiles.has(u.label) && <p className="text-[10px] text-success">✓ {uploadFiles.get(u.label)?.name}</p>}
                      </div>
                    ))}
                    {ru.length === 0 && <p className="text-xs text-muted-foreground">No specific uploads required for this slot.</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => submitApplication(s)} disabled={submitting} className="gradient-primary text-primary-foreground text-xs h-8">
                        {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Submit Application
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setApplyingTo(null); setUploadFiles(new Map()); }} className="text-xs h-8">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No slots found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
