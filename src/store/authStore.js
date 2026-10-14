import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.getMe();
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(credentials);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return res.data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return res.data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (updatedUser) => {
    set({ user: { ...get().user, ...updatedUser } });
  },

  clearError: () => set({ error: null }),
}));
