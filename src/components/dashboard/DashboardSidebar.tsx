import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Search, MessageSquare, User, BarChart3, Settings, Users, ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const { roles, signOut } = useAuth();

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/marketplace", icon: Search, label: "Marketplace" },
    { to: "/dashboard/profile", icon: User, label: "Profile" },
    { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    ...(roles.includes("referrer") ? [{ to: "/dashboard/referrer", icon: Users, label: "Referrer Panel" }] : []),
    
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen glass-strong border-r border-border/50 p-4">
      <Link to="/" className="flex items-center gap-2 px-3 py-4 mb-4">
        <Shield className="h-7 w-7 text-primary" />
        <span className="font-display text-lg font-bold">BridgeLink</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {links.map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
