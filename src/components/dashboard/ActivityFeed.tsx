import { useEffect, useState } from "react";
import { CheckCircle, Send, Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  icon: typeof Send;
  color: string;
  title: string;
  time: string;
}

const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;
    (supabase.from("applications") as any)
      .select("status, created_at, slot_id")
      .eq("applicant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(async ({ data }: any) => {
        if (!data?.length) return;
        const slotIds = data.map((a: any) => a.slot_id);
        const { data: slots } = await (supabase.from("referral_slots") as any).select("id, role_title, company").in("id", slotIds);
        const slotMap = new Map((slots || []).map((s: any) => [s.id, s]));

        const items: Activity[] = data.map((a: any) => {
          const slot = slotMap.get(a.slot_id) as any;
          const label = slot ? `${slot.role_title} at ${slot.company}` : "a slot";
          const iconMap: Record<string, { icon: typeof Send; color: string; verb: string }> = {
            applied: { icon: Clock, color: "text-warning", verb: "Applied to" },
            accepted: { icon: CheckCircle, color: "text-success", verb: "Accepted for" },
            rejected: { icon: X, color: "text-destructive", verb: "Rejected from" },
          };
          const m = iconMap[a.status] || iconMap.applied;
          return { icon: m.icon, color: m.color, title: `${m.verb} ${label}`, time: new Date(a.created_at).toLocaleDateString() };
        });
        setActivities(items);
      });
  }, [user]);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet. Start by applying to referral slots!</p>}
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 ${a.color}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm">{a.title}</p>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
