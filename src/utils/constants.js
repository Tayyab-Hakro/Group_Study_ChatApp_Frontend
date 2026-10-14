export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PRESENCE_UPDATE: "presence:update",
  PRESENCE_INITIAL_LIST: "presence:initial_list",
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stop_typing",
  CHAT_MESSAGE_SEND: "chat:message_send",
  CHAT_MESSAGE_RECEIVE: "chat:message_receive",
  CHAT_READ_RECEIPT: "chat:read_receipt",
  CHAT_READ_RECEIPT_ACK: "chat:read_receipt_ack",
  CHAT_CONVERSATION_UPDATED: "chat:conversation_updated",
  CALL_JOIN_ROOM: "call:join_room",
  CALL_EXISTING_PEERS: "call:existing_peers",
  CALL_USER_JOINED: "call:user_joined",
  CALL_SIGNAL: "call:signal",
  CALL_TOGGLE_MEDIA: "call:toggle_media",
  CALL_PEER_MEDIA_UPDATED: "call:peer_media_updated",
  CALL_USER_LEFT: "call:user_left",
  CALL_LEAVE_ROOM: "call:leave_room",
};
