import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["hsl(175, 80%, 50%)", "hsl(260, 60%, 60%)", "hsl(38, 90%, 55%)", "hsl(0, 72%, 55%)"];

const Analytics = () => {
  const { user } = useAuth();
  const [appsByStatus, setAppsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [slotsByCompany, setSlotsByCompany] = useState<{ company: string; count: number }[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    (supabase.from("applications") as any).select("status").then(({ data }: any) => {
      const counts: Record<string, number> = {};
      (data || []).forEach((a: any) => { counts[a.status] = (counts[a.status] || 0) + 1; });
      setAppsByStatus(Object.entries(counts).map(([name, value]) => ({ name, value })));
      setTotalApps(data?.length || 0);
      setAcceptedCount((data || []).filter((a: any) => a.status === "accepted").length);
      setRejectedCount((data || []).filter((a: any) => a.status === "rejected").length);
    });

    (supabase.from("referral_slots") as any).select("company").eq("is_active", true).then(({ data }: any) => {
      const counts: Record<string, number> = {};
      (data || []).forEach((s: any) => { counts[s.company] = (counts[s.company] || 0) + 1; });
      setSlotsByCompany(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([company, count]) => ({ company, count })));
    });
  }, [user]);

  const acceptanceRate = totalApps > 0 ? Math.round((acceptedCount / totalApps) * 100) : 0;
  const rejectionRate = totalApps > 0 ? Math.round((rejectedCount / totalApps) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Simple overview of application metrics.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold gradient-text">{totalApps}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Applications</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-success">{acceptanceRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Acceptance Rate</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-3xl font-bold text-destructive">{rejectionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Rejection Rate</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> Application Status
            </h3>
            {appsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={appsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {appsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">No application data yet.</p>}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Active Slots by Company
            </h3>
            {slotsByCompany.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={slotsByCompany}>
                  <XAxis dataKey="company" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 14%, 16%)", borderRadius: 8, color: "hsl(200, 20%, 92%)" }} />
                  <Bar dataKey="count" fill="hsl(175, 80%, 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-10">No slot data yet.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
