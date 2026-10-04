import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TrustScoreCard from "@/components/dashboard/TrustScoreCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, CheckCircle, Clock, TrendingUp, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [appCount, setAppCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    (supabase.from("applications") as any).select("id, status").eq("applicant_id", user.id)
      .then(({ data }: any) => {
        const apps = data || [];
        setAppCount(apps.length);
        setPendingCount(apps.filter((a: any) => a.status === "applied").length);
        setAcceptedCount(apps.filter((a: any) => a.status === "accepted").length);
      });

    (supabase.from("notifications") as any).select("*").eq("user_id", user.id).eq("read", false)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }: any) => setNotifications(data || []));

    // Mark all as read when leaving the dashboard
    return () => {
      (supabase.from("notifications") as any)
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false)
        .then(() => {});
    };
  }, [user]);

  const markRead = async (id: string) => {
    await (supabase.from("notifications") as any).update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const stats = [
    { icon: Send, label: "Applications Sent", value: String(appCount) },
    { icon: Clock, label: "Pending Reviews", value: String(pendingCount) },
    { icon: CheckCircle, label: "Referrals Received", value: String(acceptedCount) },
    { icon: TrendingUp, label: "Trust Score", value: String(profile?.trust_score ?? 0) },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Welcome back, {profile?.full_name || "there"}</h1>
          <p className="text-sm text-muted-foreground">
            Your BridgeCode: <span className="font-mono text-primary">{profile?.bridge_code || "—"}</span>
            {" · "}Username: <span className="font-mono text-primary">@{profile?.username || "—"}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="glass rounded-2xl p-6 space-y-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications
              <Badge variant="destructive" className="text-xs">{notifications.length}</Badge>
            </h3>
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between bg-secondary/30 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                </div>
                <button onClick={() => markRead(n.id)} className="text-xs text-primary hover:underline shrink-0 ml-2">Dismiss</button>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <TrustScoreCard score={profile?.trust_score ?? 0} profile={profile} />
          </div>
          <div className="lg:col-span-3">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
