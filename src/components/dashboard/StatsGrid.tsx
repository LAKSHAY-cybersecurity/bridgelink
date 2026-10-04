import { Send, CheckCircle, Clock, TrendingUp } from "lucide-react";

const stats = [
  { icon: Send, label: "Applications Sent", value: "12", change: "+3 this week", up: true },
  { icon: Clock, label: "Pending Reviews", value: "4", change: "2 expiring soon", up: false },
  { icon: CheckCircle, label: "Referrals Received", value: "3", change: "+1 this month", up: true },
  { icon: TrendingUp, label: "Profile Views", value: "89", change: "+24%", up: true },
];

const StatsGrid = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((s) => (
      <div key={s.label} className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <s.icon className="h-5 w-5 text-primary" />
          <span className={`text-[11px] font-medium ${s.up ? "text-success" : "text-warning"}`}>{s.change}</span>
        </div>
        <div className="font-display text-2xl font-bold">{s.value}</div>
        <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
      </div>
    ))}
  </div>
);

export default StatsGrid;
