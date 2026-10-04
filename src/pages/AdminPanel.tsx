import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, Users, AlertTriangle, CheckCircle, Ban, Search, Flag, MessageSquare, Trash2, Mail, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"users" | "fraud" | "reports" | "slots">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "referrer" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "suspended" | "pending">("all");
  const [trustMin, setTrustMin] = useState("");
  const [trustMax, setTrustMax] = useState("");
  type SortKey = "name" | "username" | "role" | "trust_score" | "status" | "work_email";
  const [sortKey, setSortKey] = useState<SortKey>("trust_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "trust_score" ? "desc" : "asc"); }
  };
  const statusRank = (u: any) => u.suspended ? 2 : u.verified ? 0 : 1;

  const { session, roles, loading: authLoading } = useAuth();
  const isAdmin = !!session && roles.includes("admin");

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate("/mgmt"); return; }
    fetchUsers(); fetchFraudLogs(); fetchReports(); fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data } = await (supabase.from("profiles") as any).select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };
  const fetchFraudLogs = async () => {
    const { data } = await (supabase.from("fraud_logs") as any).select("*").order("created_at", { ascending: false });
    setFraudLogs(data || []);
  };
  const fetchReports = async () => {
    const { data } = await (supabase.from("reports") as any).select("*").order("created_at", { ascending: false });
    setReports(data || []);
  };
  const fetchSlots = async () => {
    const { data } = await (supabase.from("referral_slots") as any).select("*").order("created_at", { ascending: false });
    setAllSlots(data || []);
  };

  const toggleVerified = async (profile: any) => {
    await (supabase.from("profiles") as any).update({ verified: !profile.verified }).eq("id", profile.id);
    fetchUsers();
  };
  const toggleSuspended = async (profile: any) => {
    await (supabase.from("profiles") as any).update({ suspended: !profile.suspended }).eq("id", profile.id);
    fetchUsers();
    toast({ title: profile.suspended ? "User unsuspended" : "User suspended" });
  };
  const resolveFraud = async (logId: string) => {
    await (supabase.from("fraud_logs") as any).update({ resolved: true }).eq("id", logId);
    fetchFraudLogs();
  };
  const resolveReport = async (reportId: string) => {
    await (supabase.from("reports") as any).update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", reportId);
    fetchReports();
    toast({ title: "Report resolved" });
  };
  const deleteSlot = async (slotId: string) => {
    await (supabase.from("referral_slots") as any).delete().eq("id", slotId);
    fetchSlots();
    toast({ title: "Slot deleted" });
  };

  const filteredUsers = users.filter((u: any) => {
    const q = search.toLowerCase();
    const matchesText = !q || (u.full_name || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.bridge_code || "").toLowerCase().includes(q) ||
      (u.work_email || "").toLowerCase().includes(q) ||
      (u.company || "").toLowerCase().includes(q) ||
      (u.college || "").toLowerCase().includes(q) ||
      (u.skills || []).some((s: string) => s.toLowerCase().includes(q));
    const matchesRole = roleFilter === "all" || (u.role || "student") === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && u.verified) ||
      (statusFilter === "suspended" && u.suspended) ||
      (statusFilter === "pending" && !u.verified && !u.suspended);
    const score = u.trust_score ?? 0;
    const matchesMin = trustMin === "" || score >= Number(trustMin);
    const matchesMax = trustMax === "" || score <= Number(trustMax);
    return matchesText && matchesRole && matchesStatus && matchesMin && matchesMax;
  });

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    const dir = sortDir === "asc" ? 1 : -1;
    let av: any, bv: any;
    switch (sortKey) {
      case "name": av = (a.full_name || "").toLowerCase(); bv = (b.full_name || "").toLowerCase(); break;
      case "username": av = (a.username || "").toLowerCase(); bv = (b.username || "").toLowerCase(); break;
      case "role": av = a.role || "student"; bv = b.role || "student"; break;
      case "trust_score": av = a.trust_score ?? 0; bv = b.trust_score ?? 0; break;
      case "status": av = statusRank(a); bv = statusRank(b); break;
      case "work_email": av = (a.work_email || "").toLowerCase(); bv = (b.work_email || "").toLowerCase(); break;
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => {
    const Icon = sortKey !== k ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label} <Icon className="h-3 w-3" />
      </button>
    );
  };

  if (!isAdmin) return null;

  const handleLogout = () => {
    sessionStorage.removeItem("bl_mgmt_token");
    navigate("/mgmt");
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Management Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users, investigate fraud, review reports, and monitor slots.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users },
            { label: "Verified", value: users.filter((u: any) => u.verified).length, icon: CheckCircle },
            { label: "Suspended", value: users.filter((u: any) => u.suspended).length, icon: Ban },
            { label: "Open Fraud", value: fraudLogs.filter((f: any) => !f.resolved).length, icon: AlertTriangle },
            { label: "Open Reports", value: reports.filter((r: any) => r.status === "pending").length, icon: Flag },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { key: "users" as const, icon: Users, label: "Users" },
            { key: "fraud" as const, icon: AlertTriangle, label: "Fraud Logs" },
            { key: "reports" as const, icon: Flag, label: "Reports" },
            { key: "slots" as const, icon: MessageSquare, label: "Slots" },
          ].map((t) => (
            <Button key={t.key} variant={tab === t.key ? "default" : "outline"} onClick={() => setTab(t.key)} size="sm">
              <t.icon className="h-4 w-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "users" && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, username, bridge code, email, company, college, skill..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="text-xs h-9 rounded-md border border-input bg-background px-2">
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="referrer">Referrer</option>
                  <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="text-xs h-9 rounded-md border border-input bg-background px-2">
                  <option value="all">All statuses</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <Input type="number" placeholder="Min trust" value={trustMin} onChange={(e) => setTrustMin(e.target.value)} className="h-9 w-28 text-xs" />
                <Input type="number" placeholder="Max trust" value={trustMax} onChange={(e) => setTrustMax(e.target.value)} className="h-9 w-28 text-xs" />
                {(search || roleFilter !== "all" || statusFilter !== "all" || trustMin || trustMax) && (
                  <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); setTrustMin(""); setTrustMax(""); }}>
                    Clear
                  </Button>
                )}
                <span className="text-xs text-muted-foreground ml-auto">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><SortHeader k="name" label="Name" /></TableHead>
                    <TableHead><SortHeader k="username" label="Username" /></TableHead>
                    <TableHead><SortHeader k="work_email" label="Email" /></TableHead>
                    <TableHead><SortHeader k="role" label="Role" /></TableHead>
                    <TableHead><SortHeader k="trust_score" label="Trust" /></TableHead>
                    <TableHead><SortHeader k="status" label="Status" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">@{u.username || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{u.work_email || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{u.role || "student"}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{u.trust_score ?? 0}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {u.verified && <Badge className="bg-success/20 text-success text-xs">Verified</Badge>}
                          {u.suspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
                          {!u.verified && !u.suspended && <Badge variant="secondary" className="text-xs">Pending</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => toggleVerified(u)} className="text-xs h-7">{u.verified ? "Unverify" : "Verify"}</Button>
                          <Button size="sm" variant="ghost" onClick={() => toggleSuspended(u)} className="text-xs h-7 text-destructive">{u.suspended ? "Unsuspend" : "Suspend"}</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {tab === "fraud" && (
          <div className="space-y-3">
            {fraudLogs.length === 0 && <p className="text-sm text-muted-foreground">No fraud logs.</p>}
            {fraudLogs.map((log: any) => (
              <div key={log.id} className={`glass rounded-xl p-4 flex items-start justify-between ${log.resolved ? "opacity-50" : ""}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.severity === "critical" || log.severity === "high" ? "destructive" : "secondary"} className="text-xs capitalize">{log.severity}</Badge>
                    <span className="font-medium text-sm">{log.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                </div>
                {!log.resolved && <Button size="sm" variant="outline" onClick={() => resolveFraud(log.id)} className="text-xs">Resolve</Button>}
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports.</p>}
            {reports.map((r: any) => (
              <div key={r.id} className={`glass rounded-xl p-4 ${r.status === "resolved" ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant={r.status === "pending" ? "destructive" : "secondary"} className="text-xs capitalize">{r.status}</Badge>
                    <p className="font-medium text-sm">{r.reason}</p>
                    {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  {r.status === "pending" && <Button size="sm" variant="outline" onClick={() => resolveReport(r.id)} className="text-xs">Resolve</Button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "slots" && (
          <div className="space-y-3">
            {allSlots.length === 0 && <p className="text-sm text-muted-foreground">No slots.</p>}
            {allSlots.map((slot: any) => (
              <div key={slot.id} className="glass rounded-xl p-4 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{slot.role_title} at {slot.company}</p>
                  <p className="text-xs text-muted-foreground">{slot.location} · {slot.slots_remaining}/{slot.total_slots} slots</p>
                  <Badge variant={slot.is_active ? "default" : "secondary"} className="text-xs">{slot.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => deleteSlot(slot.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
