import { api } from "./api";

export const chatService = {
  getConversations: () => api.get("/conversations"),
  getOrCreateDirectConversation: (recipientId) =>
    api.post("/conversations/direct", { recipientId }),
  getConversationById: (id) => api.get(`/conversations/${id}`),
  getMessages: (conversationId, cursor = null, limit = 30) => {
    let url = `/messages/${conversationId}?limit=${limit}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
    return api.get(url);
  },
  sendMessage: (payload) => api.post("/messages", payload),
  markAsRead: (conversationId) => api.patch(`/messages/${conversationId}/read`),
};
