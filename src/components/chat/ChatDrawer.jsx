import { useEffect, useMemo, useState } from "react";
import { useChat } from "./ChatContext";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Smile, X, Trash2, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

async function fetchProfiles(userIds) {
  if (userIds.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,name,email")
    .in("user_id", userIds);
  if (error || !data) return {};
  const map = {};
  data.forEach((p) => { map[p.user_id] = p; });
  return map;
}

function displayName(p) {
  // Never show UUIDs to users; if profile not loaded yet, show placeholder
  return p?.name || p?.email || "Unknown User";
}

async function fetchSingleProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,name,email")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data;
}

export function ChatButtonIcon() {
  const { open, setOpen } = useChat();
  return (
    <Button variant="ghost" className="relative" onClick={() => setOpen(!open)} aria-label="Open messages">
      <MessageCircle className="w-5 h-5" />
    </Button>
  );
}

export default function ChatDrawer() {
  const {
    open,
    setOpen,
    conversations,
    openChatWith,
    activeOtherUserId,
    messages,
    sendMessage,
    setTyping,
    isOtherTyping,
    activeConversationId,
    clearUnread,
    clearAllUnread,
    unreadMap,
  } = useChat();
  const [input, setInput] = useState("");
  const [otherProfile, setOtherProfile] = useState(null);
  const [profileMap, setProfileMap] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const totalUnread = useMemo(() => Object.values(unreadMap || {}).reduce((a, b) => a + b, 0), [unreadMap]);

  useEffect(() => {
    let timer;
    if (activeConversationId) {
      clearUnread(activeConversationId);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeConversationId, clearUnread]);

  // Clear all unread as soon as drawer is opened
  useEffect(() => {
    if (open) {
      clearAllUnread();
    }
  }, [open, clearAllUnread]);

  // Load profiles for conversation list and active user
  useEffect(() => {
    let isCancelled = false;
    const ids = Array.from(new Set([
      ...(conversations.map(c => c.otherUserId) || []),
      ...(activeOtherUserId ? [activeOtherUserId] : []),
    ]));
    fetchProfiles(ids).then((map) => {
      if (!isCancelled) {
        setProfileMap((prev) => ({ ...prev, ...map }));
        if (activeOtherUserId) {
          const found = map[activeOtherUserId];
          if (found) {
            setOtherProfile(found);
          } else {
            // Fallback: fetch single if bulk query missed due to policy/network edge
            fetchSingleProfile(activeOtherUserId).then((p) => {
              if (!isCancelled) setOtherProfile(p);
              if (p) setProfileMap((prev) => ({ ...prev, [p.user_id]: p }));
            });
          }
        } else {
          setOtherProfile(null);
        }
      }
    });
    return () => { isCancelled = true; };
  }, [conversations, activeOtherUserId]);

  // Load current user's profile to show their name in bubbles
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("profiles")
        .select("user_id,name,email")
        .eq("user_id", uid)
        .single();
      if (!ignore && data) setCurrentProfile({ user_id: data.user_id, name: data.name, email: data.email, avatar_url: null });
    })();
    return () => { ignore = true; };
  }, []);

  // Fetch any profiles still missing in list
  useEffect(() => {
    const missingIds = Array.from(new Set(conversations.map(c => c.otherUserId).filter(uid => !profileMap[uid])));
    if (missingIds.length > 0) {
      fetchProfiles(missingIds).then((map) => {
        setProfileMap((prev) => ({ ...prev, ...map }));
      });
    }
  }, [conversations, profileMap]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
    setTyping(false);
  };

  const onInputChange = (v) => {
    setInput(v);
    setTyping(v.trim().length > 0);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span />
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl md:max-w-4xl p-0 sm:p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="hidden sm:flex w-72 border-r h-full flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Messages</h3>
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-medium min-w-[22px] h-[22px] px-1">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">No conversations yet</div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.conversationId}
                      className="w-full text-left p-3 rounded-lg hover:bg-accent/50 mb-1"
                      onClick={() => openChatWith(c.otherUserId)}
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar 
                          profile={profileMap[c.otherUserId] || { user_id: c.otherUserId, name: profileMap[c.otherUserId]?.name, email: profileMap[c.otherUserId]?.email }}
                          currentUserId={null}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{displayName(profileMap[c.otherUserId])}</p>
                            {c.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{c.lastMessage?.text || "Start chatting"}</p>
                        </div>
                        {c.unreadCount > 0 && <span className="ml-2 w-2.5 h-2.5 rounded-full bg-red-600" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main chat area */}
          <div className="flex-1 h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </Button>
              <ProfileAvatar 
                profile={otherProfile || { user_id: activeOtherUserId || "", name: otherProfile?.name, email: otherProfile?.email }}
                currentUserId={null}
                size="lg"
              />
              <div className="flex flex-col">
                <span className="font-semibold">{displayName(otherProfile || undefined)}</span>
                {isOtherTyping && <span className="text-xs text-muted-foreground">typing...</span>}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {messages.map((m) => (
                  <ChatBubble
                    key={m.id}
                    message={m}
                    avatarUrl={!otherProfile ? undefined : otherProfile.avatar_url || undefined}
                    otherInitial={((otherProfile?.name || otherProfile?.email || activeOtherUserId || "U").slice(0, 1).toUpperCase())}
                    displayName={
                      m.senderId === (currentProfile?.user_id || "")
                        ? (currentProfile?.name || currentProfile?.email || "You")
                        : (otherProfile?.name || otherProfile?.email || activeOtherUserId || "User")
                    }
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Emoji">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Type a message"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} aria-label="Send">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ChatBubble({ message, avatarUrl, otherInitial, displayName }) {
  const { currentUserId, deleteMessage } = useChat();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMine = message.senderId === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMessage(message.id);
      toast.success("Message deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={`flex items-end gap-2 group ${isMine ? "justify-end" : "justify-start"}`}>
        {!isMine && (
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{otherInitial}</AvatarFallback>
          </Avatar>
        )}
        <div className="relative">
          <Card className={`max-w-[75%] p-3 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <div className={`text-[11px] mb-1 ${isMine ? "opacity-80" : "text-muted-foreground"}`}>{isMine ? "You" : displayName}</div>
            <div className="whitespace-pre-wrap break-words">{message.text}</div>
            <div className={`text-[10px] mt-1 ${isMine ? "opacity-80" : "text-muted-foreground"}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </Card>
          {isMine && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background rounded-full p-1 shadow-sm"
                  aria-label="Message options"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
