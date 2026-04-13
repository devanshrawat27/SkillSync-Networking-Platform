import { supabase } from "@/integrations/supabase/client";
import { getConversationId } from "./types";

export async function tryLoadConversationFromDb(userA, userB) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id,sender_id,receiver_id,content,created_at,is_read")
      .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
      .order("created_at", { ascending: true });
    if (error) return null;
    return (data || []).map(toChatMessage);
  } catch {
    return null;
  }
}

export async function loadConversationSummariesFromDb(currentUserId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id,sender_id,receiver_id,content,created_at,is_read")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const seen = new Set();
    const summaries = [];

    for (const row of data) {
      const otherUserId = row.sender_id === currentUserId ? row.receiver_id : row.sender_id;
      const conversationId = getConversationId(currentUserId, otherUserId);

      if (seen.has(conversationId)) continue;
      seen.add(conversationId);

      summaries.push({
        conversationId,
        otherUserId,
        lastMessage: toChatMessage(row),
      });
    }

    return summaries;
  } catch {
    return [];
  }
}

export async function tryInsertMessageToDb(msg, currentUserId) {
  try {
    // Set is_read = false for receiver (new unread message)
    // Set is_read = true for sender (they sent it, so it's "read" for them)
    const isRead = msg.senderId === currentUserId ? true : false;
    
    const { error } = await supabase.from("messages").insert({
      id: msg.id,
      sender_id: msg.senderId,
      receiver_id: msg.receiverId,
      content: msg.text,
      created_at: new Date(msg.timestamp).toISOString(),
      is_read: isRead,
    });
    return !error;
  } catch {
    return false;
  }
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(userA, userB, currentUserId) {
  try {
    // Only mark messages where current user is the receiver as read
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .or(`and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
    
    return !error;
  } catch {
    return false;
  }
}

// Delete a message from database
export async function deleteMessageFromDb(messageId, currentUserId) {
  try {
    // Only allow deleting messages where current user is the sender
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", currentUserId);
    
    return !error;
  } catch {
    return false;
  }
}

// Get unread message count per conversation
export async function getUnreadCounts(currentUserId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
    
    if (error || !data) return {};
    
    const counts = {};
    data.forEach((msg) => {
      const conversationId = getConversationId(msg.sender_id, msg.receiver_id);
      counts[conversationId] = (counts[conversationId] || 0) + 1;
    });
    
    return counts;
  } catch {
    return {};
  }
}

export function subscribeMessagesRealtime(callback, currentUserId) {
  try {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new;
          callback(toChatMessage(row));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new;
          // Only notify if is_read was updated and current user is receiver
          if (row.receiver_id === currentUserId && row.is_read === true) {
            // Message was marked as read, we can update UI if needed
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}

function toChatMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    text: row.content,
    timestamp: Date.parse(row.created_at),
    status: "sent",
  };
}
