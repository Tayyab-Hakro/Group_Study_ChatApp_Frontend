import { create } from "zustand";
import { chatService } from "../services/chatService";

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {}, // conversationId -> Message[]
  pagination: {}, // conversationId -> { nextCursor, hasMore, isLoading }
  typingStatus: {}, // conversationId -> Map(userId -> userName)
  isLoadingConversations: false,

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await chatService.getConversations();
      set({
        conversations: res.data.conversations || [],
        isLoadingConversations: false,
      });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set({ isLoadingConversations: false });
    }
  },

  setActiveConversationId: (conversationId) => {
    set({ activeConversationId: conversationId });
    if (conversationId) {
      get().fetchMessages(conversationId);
      get().markAsRead(conversationId);
    }
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c._id === activeConversationId) || null;
  },

  fetchMessages: async (conversationId, loadMore = false) => {
    if (!conversationId) return;

    const currentPagination = get().pagination[conversationId] || {
      nextCursor: null,
      hasMore: true,
      isLoading: false,
    };

    if (loadMore && (!currentPagination.hasMore || currentPagination.isLoading)) {
      return;
    }

    set((state) => ({
      pagination: {
        ...state.pagination,
        [conversationId]: { ...currentPagination, isLoading: true },
      },
    }));

    try {
      const cursor = loadMore ? currentPagination.nextCursor : null;
      const res = await chatService.getMessages(conversationId, cursor);
      const { messages: newMessages, nextCursor, hasMore } = res.data;

      set((state) => {
        const existingMessages = state.messages[conversationId] || [];
        const mergedMessages = loadMore
          ? [...newMessages, ...existingMessages]
          : newMessages;

        return {
          messages: {
            ...state.messages,
            [conversationId]: mergedMessages,
          },
          pagination: {
            ...state.pagination,
            [conversationId]: {
              nextCursor,
              hasMore,
              isLoading: false,
            },
          },
        };
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      set((state) => ({
        pagination: {
          ...state.pagination,
          [conversationId]: { ...currentPagination, isLoading: false },
        },
      }));
    }
  },

  addMessage: (message) => {
    if (!message || !message.conversationId) return;
    const { conversationId } = message;

    set((state) => {
      const existing = state.messages[conversationId] || [];
      // Prevent duplicate messages if ack was already received
      const exists = existing.some((m) => m._id === message._id);
      const updatedMessages = exists ? existing : [...existing, message];

      // Update lastMessage on conversation list
      const updatedConversations = state.conversations.map((c) => {
        if (c._id === conversationId) {
          return {
            ...c,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
          };
        }
        return c;
      });

      // Sort conversations so most recent is at the top
      updatedConversations.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedMessages,
        },
        conversations: updatedConversations,
      };
    });
  },

  markAsRead: async (conversationId) => {
    if (!conversationId) return;

    try {
      await chatService.markAsRead(conversationId);
      set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c._id === conversationId) {
            return {
              ...c,
              unreadCounts: {
                ...c.unreadCounts,
                // set to 0 for self
              },
            };
          }
          return c;
        }),
      }));
    } catch (error) {
      console.warn("Failed to mark messages as read:", error);
    }
  },

  setTyping: (conversationId, user, isTyping) => {
    set((state) => {
      const currentMap = new Map(state.typingStatus[conversationId] || []);
      if (isTyping) {
        currentMap.set(user._id, user.name);
      } else {
        currentMap.delete(user._id);
      }

      return {
        typingStatus: {
          ...state.typingStatus,
          [conversationId]: currentMap,
        },
      };
    });
  },

  addOrUpdateConversation: (conversation) => {
    set((state) => {
      const exists = state.conversations.some((c) => c._id === conversation._id);
      let updated;
      if (exists) {
        updated = state.conversations.map((c) =>
          c._id === conversation._id ? { ...c, ...conversation } : c
        );
      } else {
        updated = [conversation, ...state.conversations];
      }
      return { conversations: updated };
    });
  },
}));
