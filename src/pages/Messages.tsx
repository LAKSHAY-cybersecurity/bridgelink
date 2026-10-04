import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, UserPlus, Search, Shield, Ban, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNotification } from "@/lib/notifications";
import { formatTime, formatDateTime } from "@/lib/timezone";

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  username: string;
  lastMessage: string;
  canChat: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  read_at: string | null;
}

const Messages = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"chats" | "connections" | "search">("chats");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [tzVersion, setTzVersion] = useState(0);

  useEffect(() => {
    const h = () => setTzVersion((v) => v + 1);
    window.addEventListener("bl:tz-changed", h);
    return () => window.removeEventListener("bl:tz-changed", h);
  }, []);

  // Connection states
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadContacts();
    loadPendingConnections();

    // Global listener: refresh contacts whenever any message involving me arrives
    const inbox = supabase
      .channel(`inbox-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        loadContacts();
      })
      .subscribe();

    return () => { supabase.removeChannel(inbox); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!selectedContact || !user) return;
    loadMessages(selectedContact);

    const channel = supabase
      .channel(`msgs-${user.id}-${selectedContact}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedContact) ||
            (msg.sender_id === selectedContact && msg.receiver_id === user.id)) {
          setMessages((prev) => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
        // Refresh contacts so new conversations appear for the receiver
        loadContacts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedContact, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadContacts = async () => {
    if (!user) return;
    // Get accepted connections
    const { data: conns } = await (supabase.from("connections") as any).select("*").eq("status", "accepted")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    // Also get users who applied to my slots (if referrer)
    const { data: mySlots } = await (supabase.from("referral_slots") as any).select("id").eq("referrer_id", user.id);
    const slotIds = (mySlots || []).map((s: any) => s.id);
    let applicantIds: string[] = [];
    if (slotIds.length > 0) {
      const { data: apps } = await (supabase.from("applications") as any).select("applicant_id").in("slot_id", slotIds);
      applicantIds = (apps || []).map((a: any) => a.applicant_id);
    }

    // Get users who applied to slots I applied to (my referrers)
    const { data: myApps } = await (supabase.from("applications") as any).select("slot_id").eq("applicant_id", user.id);
    let referrerIds: string[] = [];
    if (myApps?.length) {
      const { data: slots } = await (supabase.from("referral_slots") as any).select("referrer_id").in("id", myApps.map((a: any) => a.slot_id));
      referrerIds = (slots || []).map((s: any) => s.referrer_id);
    }

    const connectedIds = new Set<string>();
    (conns || []).forEach((c: Connection) => {
      connectedIds.add(c.requester_id === user.id ? c.receiver_id : c.requester_id);
    });
    applicantIds.forEach(id => connectedIds.add(id));
    referrerIds.forEach(id => connectedIds.add(id));

    // Get all messages and include any message partners as contacts (WhatsApp-style)
    const { data: msgs } = await (supabase.from("messages") as any).select("sender_id, receiver_id, content, created_at")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });

    const lastMsgMap = new Map<string, string>();
    (msgs || []).forEach((m: any) => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      connectedIds.add(otherId);
      if (!lastMsgMap.has(otherId)) lastMsgMap.set(otherId, m.content);
    });

    connectedIds.delete(user.id);

    if (connectedIds.size === 0) { setContacts([]); return; }

    const ids = Array.from(connectedIds);
    const { data: profiles } = await (supabase.from("profiles") as any).select("user_id, full_name, username").in("user_id", ids);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Sort: contacts with messages first (most recent), then others
    ids.sort((a, b) => {
      const aHas = lastMsgMap.has(a) ? 1 : 0;
      const bHas = lastMsgMap.has(b) ? 1 : 0;
      return bHas - aHas;
    });

    setContacts(ids.map(id => {
      const p = profileMap.get(id) as any;
      return {
        id,
        name: (p?.full_name || "Unknown") as string,
        username: (p?.username || "") as string,
        lastMessage: lastMsgMap.get(id) || "",
        canChat: true,
      };
    }));

    if (!selectedContact && ids.length > 0) setSelectedContact(ids[0]);
  };

  const loadPendingConnections = async () => {
    if (!user) return;
    const { data: received } = await (supabase.from("connections") as any).select("*").eq("receiver_id", user.id).eq("status", "pending");
    const { data: sent } = await (supabase.from("connections") as any).select("*").eq("requester_id", user.id).eq("status", "pending");

    // Enrich with profiles
    const allIds = [...(received || []).map((c: any) => c.requester_id), ...(sent || []).map((c: any) => c.receiver_id)];
    if (allIds.length > 0) {
      const { data: profiles } = await (supabase.from("profiles") as any).select("user_id, full_name, username").in("user_id", allIds);
      const pMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setPendingReceived((received || []).map((c: any) => ({ ...c, profile: pMap.get(c.requester_id) })));
      setPendingSent((sent || []).map((c: any) => ({ ...c, profile: pMap.get(c.receiver_id) })));
    } else {
      setPendingReceived([]);
      setPendingSent([]);
    }
  };

  const loadMessages = async (contactId: string) => {
    if (!user) return;
    const { data } = await (supabase.from("messages") as any).select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    // Mark received messages as read
    await (supabase.from("messages") as any).update({ read: true, read_at: new Date().toISOString() })
      .eq("sender_id", contactId).eq("receiver_id", user.id).eq("read", false);
  };

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMsg.trim()) return;
    setSending(true);
    const content = newMsg.trim();
    const { error } = await (supabase.from("messages") as any).insert({
      sender_id: user.id, receiver_id: selectedContact, content,
    });
    if (!error) {
      await createNotification(
        selectedContact,
        "new_message",
        `New message from ${profile?.full_name || "someone"}`,
        content.length > 80 ? content.slice(0, 77) + "..." : content,
        user.id
      );
    }
    setNewMsg("");
    setSending(false);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    const q = searchQuery.trim().toLowerCase();
    const { data } = await (supabase.from("profiles") as any).select("user_id, full_name, username, bridge_code, role, trust_score, skills, bio, verified")
      .or(`username.ilike.%${q}%,bridge_code.ilike.%${q}%,full_name.ilike.%${q}%`)
      .neq("user_id", user.id).limit(20);
    setSearchResults(data || []);
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;

    // Rate limit: 5/day
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { count } = await (supabase.from("connections") as any).select("*", { count: "exact", head: true })
      .eq("requester_id", user.id).gte("created_at", oneDayAgo);
    if ((count || 0) >= 5) {
      toast({ title: "Daily limit reached", description: "Max 5 connection requests per day.", variant: "destructive" });
      return;
    }

    // Check if blocked
    const { data: blocked } = await (supabase.from("user_blocks") as any).select("id")
      .or(`and(blocker_id.eq.${receiverId},blocked_id.eq.${user.id}),and(blocker_id.eq.${user.id},blocked_id.eq.${receiverId})`);
    if (blocked?.length) {
      toast({ title: "Cannot connect", description: "This connection is blocked.", variant: "destructive" });
      return;
    }

    const { error } = await (supabase.from("connections") as any).insert({
      requester_id: user.id, receiver_id: receiverId,
    });
    if (error) {
      if (error.code === "23505") toast({ title: "Request already sent" });
      else toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    await createNotification(receiverId, "connection_request", "New Connection Request",
      `${profile?.full_name || "Someone"} wants to connect with you.`, user.id);
    toast({ title: "Connection request sent!" });
    loadPendingConnections();
  };

  const respondToConnection = async (connId: string, status: "accepted" | "rejected") => {
    await (supabase.from("connections") as any).update({ status }).eq("id", connId);
    const conn = pendingReceived.find(c => c.id === connId);
    if (conn) {
      await createNotification(conn.requester_id, "connection_response", `Connection ${status}`,
        `${profile?.full_name || "Someone"} ${status} your connection request.`);
    }
    toast({ title: `Connection ${status}` });
    loadPendingConnections();
    loadContacts();
  };

  const blockUser = async (userId: string) => {
    await (supabase.from("user_blocks") as any).insert({ blocker_id: user!.id, blocked_id: userId });
    toast({ title: "User blocked" });
  };

  const reportUser = async (userId: string) => {
    await (supabase.from("reports") as any).insert({
      reporter_id: user!.id, reported_user_id: userId, reason: "Reported from messages",
    });
    toast({ title: "Report submitted" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 overflow-hidden -m-4 sm:-m-6 lg:-m-10">
        {/* Sidebar */}
        <div className="w-72 border-r border-border/50 glass-strong flex flex-col">
          <div className="p-4 border-b border-border/50 space-y-2">
            <h2 className="font-display font-semibold">Messages</h2>
            <div className="flex gap-1">
              {(["chats", "connections", "search"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors capitalize ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "chats" && (
              <>
                {contacts.length === 0 && (
                  <div className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet. Search users to connect.</p>
                  </div>
                )}
                {contacts.map((c) => (
                  <button key={c.id} onClick={() => setSelectedContact(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/30 transition-colors ${selectedContact === c.id ? "bg-primary/10" : "hover:bg-secondary/50"}`}>
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">@{c.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </button>
                ))}
              </>
            )}

            {tab === "connections" && (
              <div className="p-3 space-y-3">
                {pendingReceived.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Received</p>
                    {pendingReceived.map(c => (
                      <div key={c.id} className="bg-secondary/30 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium">{c.profile?.full_name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground">@{c.profile?.username}</p>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" className="h-6 text-xs gradient-primary text-primary-foreground" onClick={() => respondToConnection(c.id, "accepted")}>Accept</Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => respondToConnection(c.id, "rejected")}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingSent.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Sent</p>
                    {pendingSent.map(c => (
                      <div key={c.id} className="bg-secondary/30 rounded-lg p-3 mb-2">
                        <p className="text-sm font-medium">{c.profile?.full_name || "Unknown"}</p>
                        <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {pendingReceived.length === 0 && pendingSent.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending connections.</p>
                )}
              </div>
            )}

            {tab === "search" && (
              <div className="p-3 space-y-3">
                <div className="flex gap-1">
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Username or BridgeCode" className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && searchUsers()} />
                  <Button size="sm" className="h-8" onClick={searchUsers}><Search className="h-3 w-3" /></Button>
                </div>
                {searchResults.map(p => (
                  <div key={p.user_id} className="bg-secondary/30 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{p.full_name || "Unknown"}</p>
                      {p.verified && <Shield className="h-3 w-3 text-success" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">@{p.username} · {p.bridge_code}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.role}</p>
                    {p.bio && <p className="text-[10px] text-muted-foreground truncate">{p.bio}</p>}
                    <Badge variant="outline" className="text-[10px]">Trust: {p.trust_score ?? 0}</Badge>
                    {p.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-0.5">
                        {p.skills.slice(0, 3).map((s: string) => <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>)}
                      </div>
                    )}
                    <Button size="sm" className="h-6 text-xs w-full mt-1" onClick={() => sendConnectionRequest(p.user_id)}>
                      <UserPlus className="h-3 w-3 mr-1" /> Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              <div className="border-b border-border/50 glass">
                <div className="p-4 flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-display font-semibold text-sm">
                    {contacts.find((c) => c.id === selectedContact)?.name || "Chat"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => blockUser(selectedContact)}>
                      <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reportUser(selectedContact)}>
                      <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(() => {
                  if (messages.length === 0) {
                    return <p className="text-center text-xs text-muted-foreground py-8">No messages yet.</p>;
                  }
                  return messages.map((m) => {
                    const isMine = m.sender_id === user?.id;
                    const time = formatTime(m.created_at);
                    const sentAt = formatDateTime(m.created_at);
                    return (
                      <div key={m.id + ":" + tzVersion} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMine ? "gradient-primary text-primary-foreground" : "glass"}`} title={`Sent: ${sentAt}`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t border-border/50 flex gap-2">
                <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1" />
                <Button onClick={sendMessage} disabled={sending || !newMsg.trim()} size="icon" className="gradient-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Select a conversation or search for users to connect.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
