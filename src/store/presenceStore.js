import { create } from "zustand";

export const usePresenceStore = create((set, get) => ({
  onlineUsers: new Set(),

  setInitialList: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  setUserStatus: (userId, isOnline) => {
    const updated = new Set(get().onlineUsers);
    if (isOnline) {
      updated.add(userId);
    } else {
      updated.delete(userId);
    }
    set({ onlineUsers: updated });
  },

  isOnline: (userId) => {
    if (!userId) return false;
    return get().onlineUsers.has(userId.toString());
  },
}));
