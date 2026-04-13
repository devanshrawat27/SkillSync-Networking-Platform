import { useMemo } from "react";
import { useChat } from "./ChatContext";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function MessageBell() {
  const { conversations, unreadMap, openChatWith, setOpen } = useChat();
  const totalUnread = useMemo(() => Object.values(unreadMap || {}).reduce((a, b) => a + b, 0), [unreadMap]);
  const unreadConvos = useMemo(() => conversations.filter(c => (unreadMap[c.conversationId] || 0) > 0).slice(0, 6), [conversations, unreadMap]);
  const userIds = Array.from(new Set(unreadConvos.map(c => c.otherUserId)));
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (userIds.length === 0) {
        setProfiles({});
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("user_id,name,avatar_url")
        .in("user_id", userIds);
      if (!cancelled) {
        const map = {};
        (data || []).forEach((p) => (map[p.user_id] = p));
        setProfiles(map);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userIds.join(",")]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-accent text-foreground/80" aria-label="Messages notifications">
          <Bell className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] px-1.5 min-w-[18px] h-[18px]">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm">Unread messages</h4>
        </div>
        {unreadConvos.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No new messages</div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="p-2 space-y-1">
              {unreadConvos.map((c) => {
                const p = profiles[c.otherUserId];
                return (
                  <button
                    key={c.conversationId}
                    className="w-full text-left p-2 rounded-md hover:bg-accent/50 flex items-center gap-3"
                    onClick={() => {
                      openChatWith(c.otherUserId);
                      setOpen(true);
                    }}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={p?.avatar_url || undefined} />
                      <AvatarFallback>{p?.name?.[0]?.toUpperCase() || c.otherUserId.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{p?.name || c.otherUserId}</span>
                        {c.lastMessage && (
                          <span className="text-[10px] text-muted-foreground">{new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{c.lastMessage?.text}</div>
                    </div>
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] px-1.5 min-w-[18px] h-[18px]">
                      {unreadMap[c.conversationId]}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
