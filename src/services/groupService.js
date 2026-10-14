import { api } from "./api";

export const groupService = {
  getUserGroups: () => api.get("/groups"),
  getDiscoverableGroups: (query = "") =>
    api.get(`/groups/discover?q=${encodeURIComponent(query)}`),
  getGroupById: (id) => api.get(`/groups/${id}`),
  createGroup: (payload) => api.post("/groups", payload),
  updateGroup: (id, payload) => api.patch(`/groups/${id}`, payload),
  addMember: (id, userId, role = "student") =>
    api.post(`/groups/${id}/members`, { userId, role }),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  updateMemberRole: (id, userId, role) =>
    api.patch(`/groups/${id}/members/${userId}/role`, { role }),
  joinGroup: (id) => api.post(`/groups/${id}/join`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
};
