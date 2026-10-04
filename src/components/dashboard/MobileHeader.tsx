import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Search, MessageSquare, User, BarChart3, Settings, Users, ShieldAlert, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const MobileHeader = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { roles, signOut } = useAuth();

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/marketplace", icon: Search, label: "Marketplace" },
    { to: "/dashboard/profile", icon: User, label: "Profile" },
    { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    ...(roles.includes("referrer") ? [{ to: "/dashboard/referrer", icon: Users, label: "Referrer Panel" }] : []),
    ...(roles.includes("admin") ? [{ to: "/dashboard/admin", icon: ShieldAlert, label: "Admin Panel" }] : []),
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <header className="lg:hidden sticky top-0 z-50 glass-strong border-b border-border/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold">BridgeLink</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mt-3 pb-2 space-y-1 border-t border-border/50 pt-3">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>
      )}
    </header>
  );
};

export default MobileHeader;
