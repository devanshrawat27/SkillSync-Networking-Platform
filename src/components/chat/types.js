export function getConversationId(a, b) {
  return [a, b].sort().join("__");
}
