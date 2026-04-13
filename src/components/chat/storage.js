import { getConversationId } from "./types";

const STORAGE_KEY = "skillSync.chat.messages";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadConversation(userA, userB) {
  const convId = getConversationId(userA, userB);
  const all = readAll();
  return (all[convId] || []).sort((a, b) => a.timestamp - b.timestamp);
}

export function appendMessage(message) {
  const convId = getConversationId(message.senderId, message.receiverId);
  const all = readAll();
  const list = all[convId] || [];
  all[convId] = [...list, message];
  writeAll(all);
  broadcastChange({ type: "message", conversationId: convId, message });
}

export function markAllRead(conversationId, currentUserId) {
  // For demo, we don't persist read status per-message; rely on client state.
  broadcastChange({ type: "read", conversationId, userId: currentUserId });
}

const channel = typeof window !== "undefined" ? new BroadcastChannel("skillSyncChat") : null;

function broadcastChange(event) {
  channel?.postMessage(event);
  window.dispatchEvent(new CustomEvent("skillSyncChat", { detail: event }));
}

export function onBroadcast(handler) {
  const bcHandler = (e) => handler(e.data);
  const domHandler = (e) => handler(e.detail);
  channel?.addEventListener("message", bcHandler);
  window.addEventListener("skillSyncChat", domHandler);
  return () => {
    channel?.removeEventListener("message", bcHandler);
    window.removeEventListener("skillSyncChat", domHandler);
  };
}

export function emitTyping(conversationId, userId, isTyping) {
  const event = { type: "typing", conversationId, userId, isTyping };
  broadcastChange(event);
}

export function deleteMessage(messageId, userA, userB) {
  const convId = getConversationId(userA, userB);
  const all = readAll();
  const list = all[convId] || [];
  all[convId] = list.filter(m => m.id !== messageId);
  writeAll(all);
  broadcastChange({ type: "message_deleted", conversationId: convId, messageId });
}
