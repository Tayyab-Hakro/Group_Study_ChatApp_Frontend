import { api } from "./api";

export const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query || "")}`),
  getUserProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (payload) => api.patch("/users/profile", payload),
};
