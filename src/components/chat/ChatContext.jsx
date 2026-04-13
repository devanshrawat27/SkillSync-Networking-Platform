import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getConversationId } from "./types";
import { appendMessage, emitTyping, loadConversation, markAllRead, onBroadcast, deleteMessage } from "./storage";
import { toast } from "sonner";
import { subscribeMessagesRealtime, tryInsertMessageToDb, tryLoadConversationFromDb, markConversationAsRead, getUnreadCounts, deleteMessageFromDb, loadConversationSummariesFromDb } from "./supabase-messages";

const ChatContext = createContext(undefined);

export function ChatProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [open, setOpen] = useState(false);
  const [openWithUserId, setOpenWithUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dbConversations, setDbConversations] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [typingMap, setTypingMap] = useState({});

  const activeConversationId = useMemo(() => {
    if (!currentUserId || !openWithUserId) return null;
    return getConversationId(currentUserId, openWithUserId);
  }, [currentUserId, openWithUserId]);

  const activeOtherUserId = openWithUserId;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load messages for active conversation
  useEffect(() => {
    if (!currentUserId || !openWithUserId) {
      setMessages([]);
      return;
    }
    let isCancelled = false;
    (async () => {
      // Try DB first; fallback to local
      const fromDb = await tryLoadConversationFromDb(currentUserId, openWithUserId);
      const list = fromDb ?? loadConversation(currentUserId, openWithUserId);
      if (!isCancelled) {
        setMessages(list);
        // Mark all messages as read when conversation is opened
        await markConversationAsRead(currentUserId, openWithUserId, currentUserId);
        // Clear unread count for this conversation
        const conversationId = getConversationId(currentUserId, openWithUserId);
        setUnreadMap((m) => ({ ...m, [conversationId]: 0 }));
      }
    })();
    return () => { isCancelled = true; };
  }, [currentUserId, openWithUserId]);

  // Listen for broadcasted events (new messages, typing, read)
  useEffect(() => {
    const off = onBroadcast((event) => {
      if (!currentUserId) return;
      if (event.type === "message") {
        const { message, conversationId } = event;
        if (activeConversationId === conversationId) {
          setMessages((prev) => (prev.some(m => m.id === message.id) ? prev : [...prev, message]));
        } else {
          // Increment unread for other conversations where current user is receiver
          const involvesUser = message.senderId === currentUserId || message.receiverId === currentUserId;
          if (involvesUser && message.receiverId === currentUserId) {
            setUnreadMap((m) => ({ ...m, [conversationId]: (m[conversationId] || 0) + 1 }));
            // Notify user if the drawer is not focused on this conversation
            notifyIncoming(message);
          }
        }
      }
      if (event.type === "typing") {
        if (event.conversationId === activeConversationId && event.userId !== currentUserId) {
          setTypingMap((m) => ({ ...m, [event.conversationId]: event.isTyping }));
        }
      }
      if (event.type === "message_deleted") {
        if (event.conversationId === activeConversationId) {
          setMessages((prev) => prev.filter(m => m.id !== event.messageId));
        }
      }
    });
    return off;
  }, [currentUserId, activeConversationId]);

  // Load unread counts from database on mount
  useEffect(() => {
    if (!currentUserId) return;
    let isCancelled = false;
    (async () => {
      const counts = await getUnreadCounts(currentUserId);
      if (!isCancelled) {
        setUnreadMap(counts);
      }
    })();
    return () => { isCancelled = true; };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setDbConversations([]);
      return;
    }

    let isCancelled = false;
    const loadConversationSummaries = async () => {
      const summaries = await loadConversationSummariesFromDb(currentUserId);
      if (!isCancelled) {
        setDbConversations(summaries);
      }
    };

    loadConversationSummaries();
    return () => {
      isCancelled = true;
    };
  }, [currentUserId, messages, unreadMap]);

  // Supabase realtime subscription for INSERTs
  useEffect(() => {
    const off = subscribeMessagesRealtime((message) => {
      if (!currentUserId) return;
      const conversationId = getConversationId(message.senderId, message.receiverId);
      if (activeConversationId === conversationId) {
        setMessages((prev) => (prev.some(m => m.id === message.id) ? prev : [...prev, message]));
        // If conversation is open, mark as read immediately
        markConversationAsRead(message.senderId, message.receiverId, currentUserId);
      } else if (message.receiverId === currentUserId) {
        // Only increment if message is unread (is_read = false)
        setUnreadMap((m) => ({ ...m, [conversationId]: (m[conversationId] || 0) + 1 }));
        notifyIncoming(message);
      }
      loadConversationSummariesFromDb(currentUserId).then(setDbConversations).catch(() => {});
    }, currentUserId);
    return off;
  }, [currentUserId, activeConversationId]);

  const openChatWith = useCallback((userId) => {
    setOpen(true);
    setOpenWithUserId(userId);
  }, []);

  const sendMessage = useCallback((text) => {
    if (!currentUserId || !openWithUserId || !text.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      receiverId: openWithUserId,
      text: text.trim(),
      timestamp: Date.now(),
      status: "sent",
    };
    // Try DB insert; also keep local for optimistic + fallback
    appendMessage(msg);
    tryInsertMessageToDb(msg, currentUserId);
  }, [currentUserId, openWithUserId]);

  const setTyping = useCallback((isTyping) => {
    if (!activeConversationId || !currentUserId) return;
    emitTyping(activeConversationId, currentUserId, isTyping);
  }, [activeConversationId, currentUserId]);

  const isOtherTyping = !!(activeConversationId && typingMap[activeConversationId]);

  const clearUnread = useCallback((conversationId) => {
    setUnreadMap((m) => ({ ...m, [conversationId]: 0 }));
    if (currentUserId && openWithUserId) {
      // Mark as read in database
      markConversationAsRead(currentUserId, openWithUserId, currentUserId);
      // Also mark in local storage
      markAllRead(conversationId, currentUserId);
    }
  }, [currentUserId, openWithUserId]);

  const clearAllUnread = useCallback(() => {
    setUnreadMap({});
  }, []);

  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!currentUserId || !openWithUserId) return;
    
    // Delete from database
    await deleteMessageFromDb(messageId, currentUserId);
    
    // Delete from local storage
    deleteMessage(messageId, currentUserId, openWithUserId);
    
    // Update messages state
    setMessages((prev) => prev.filter(m => m.id !== messageId));
  }, [currentUserId, openWithUserId]);

  // Compute conversation summaries from storage on demand
  const conversations = useMemo(() => {
    if (!currentUserId) return [];
    const items = dbConversations.map((conversation) => ({
      ...conversation,
      unreadCount: unreadMap[conversation.conversationId] || 0,
    }));

    return items.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
  }, [currentUserId, dbConversations, unreadMap]);

  // Update favicon red dot based on total unread
  useEffect(() => {
    const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    if (totalUnread > 0) {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // base circle light gray bell placeholder
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        // red dot
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(size * 0.78, size * 0.22, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
      link.href = canvas.toDataURL("image/png");
    }
  }, [unreadMap]);

  const value = {
    currentUserId,
    open,
    openWithUserId,
    setOpen,
    openChatWith,
    conversations,
    messages,
    activeConversationId,
    activeOtherUserId,
    sendMessage,
    setTyping,
    isOtherTyping,
    unreadMap,
    clearUnread,
    clearAllUnread,
    deleteMessage: handleDeleteMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

function notifyIncoming(message) {
  try {
    // Toast notification
    toast.message("New message", {
      description: message.text.length > 80 ? message.text.slice(0, 80) + "…" : message.text,
      duration: 3000,
    });
    // Sound
    playPing();
    // Browser notification (if allowed)
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("New message", { body: message.text });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  } catch {
    // no-op
  }
}

function playPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    o.start();
    o.stop(ctx.currentTime + 0.22);
  } catch {
    // ignore
  }
}

// Optional enhancement: Update tab title with unread count
if (typeof window !== "undefined") {
  const originalTitle = document.title;
  window.addEventListener("skillSyncChat", (e) => {
    const ev = e.detail;
    if (ev?.type === "message" && document.visibilityState === "hidden") {
      const m = document.title.match(/^\((\d+)\)\s/);
      const current = m ? parseInt(m[1], 10) : 0;
      const next = current + 1;
      document.title = `(${next}) ${originalTitle}`;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      document.title = originalTitle;
    }
  });
}
