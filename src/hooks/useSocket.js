import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL, SOCKET_EVENTS } from "../utils/constants";
import { useAuthStore } from "../store/authStore";
import { usePresenceStore } from "../store/presenceStore";
import { useChatStore } from "../store/chatStore";

let socketInstance = null;

export const getSocket = () => socketInstance;

export const useSocket = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { setInitialList, setUserStatus } = usePresenceStore();
  const { addMessage, setTyping, markAsRead } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
      setIsConnected(false);
      return;
    }

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
        setIsConnected(true);
      });

      socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
        setIsConnected(false);
      });

      // Presence handlers
      socketInstance.on(SOCKET_EVENTS.PRESENCE_INITIAL_LIST, (list) => {
        setInitialList(list);
      });

      socketInstance.on(SOCKET_EVENTS.PRESENCE_UPDATE, ({ userId, isOnline }) => {
        setUserStatus(userId, isOnline);
      });

      // Chat handlers
      socketInstance.on(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVE, (message) => {
        addMessage(message);
      });

      socketInstance.on(SOCKET_EVENTS.CHAT_TYPING, ({ conversationId, user }) => {
        setTyping(conversationId, user, true);
      });

      socketInstance.on(SOCKET_EVENTS.CHAT_STOP_TYPING, ({ conversationId, userId }) => {
        setTyping(conversationId, { _id: userId }, false);
      });
    }

    return () => {
      // Keep persistent connection for authenticated session
    };
  }, [isAuthenticated, user]);

  const joinConversation = (conversationId) => {
    if (socketInstance && conversationId) {
      socketInstance.emit(SOCKET_EVENTS.CHAT_JOIN, { conversationId });
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketInstance && conversationId) {
      socketInstance.emit(SOCKET_EVENTS.CHAT_LEAVE, { conversationId });
    }
  };

  const emitTyping = (conversationId) => {
    if (socketInstance && conversationId) {
      socketInstance.emit(SOCKET_EVENTS.CHAT_TYPING, { conversationId });
    }
  };

  const emitStopTyping = (conversationId) => {
    if (socketInstance && conversationId) {
      socketInstance.emit(SOCKET_EVENTS.CHAT_STOP_TYPING, { conversationId });
    }
  };

  const sendSocketMessage = (data, callback) => {
    if (socketInstance) {
      socketInstance.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, data, callback);
    }
  };

  return {
    socket: socketInstance,
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitStopTyping,
    sendSocketMessage,
  };
};
