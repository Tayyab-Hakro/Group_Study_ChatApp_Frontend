import { create } from "zustand";
import { groupService } from "../services/groupService";

export const useGroupStore = create((set, get) => ({
  myGroups: [],
  discoverableGroups: [],
  activeGroup: null,
  isLoading: false,

  fetchUserGroups: async () => {
    try {
      const res = await groupService.getUserGroups();
      set({ myGroups: res.data.groups || [] });
    } catch (error) {
      console.error("Failed to load user groups:", error);
    }
  },

  fetchDiscoverableGroups: async (query = "") => {
    try {
      const res = await groupService.getDiscoverableGroups(query);
      set({ discoverableGroups: res.data.groups || [] });
    } catch (error) {
      console.error("Failed to load discoverable groups:", error);
    }
  },

  fetchGroupDetails: async (groupId) => {
    set({ isLoading: true });
    try {
      const res = await groupService.getGroupById(groupId);
      set({ activeGroup: res.data.group, isLoading: false });
      return res.data.group;
    } catch (error) {
      console.error("Failed to fetch group details:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  createGroup: async (payload) => {
    const res = await groupService.createGroup(payload);
    const newGroup = res.data.group;
    set((state) => ({ myGroups: [newGroup, ...state.myGroups] }));
    return newGroup;
  },

  updateGroup: async (groupId, payload) => {
    const res = await groupService.updateGroup(groupId, payload);
    const updated = res.data.group;
    set((state) => ({
      activeGroup: state.activeGroup?._id === groupId ? updated : state.activeGroup,
      myGroups: state.myGroups.map((g) => (g._id === groupId ? updated : g)),
    }));
    return updated;
  },

  addMember: async (groupId, userId, role = "student") => {
    const res = await groupService.addMember(groupId, userId, role);
    const updated = res.data.group;
    set((state) => ({
      activeGroup: state.activeGroup?._id === groupId ? updated : state.activeGroup,
      myGroups: state.myGroups.map((g) => (g._id === groupId ? updated : g)),
    }));
    return updated;
  },

  removeMember: async (groupId, userId) => {
    const res = await groupService.removeMember(groupId, userId);
    const updated = res.data.group;
    set((state) => ({
      activeGroup: state.activeGroup?._id === groupId ? updated : state.activeGroup,
      myGroups: state.myGroups.map((g) => (g._id === groupId ? updated : g)),
    }));
    return updated;
  },

  updateMemberRole: async (groupId, userId, role) => {
    const res = await groupService.updateMemberRole(groupId, userId, role);
    const updated = res.data.group;
    set((state) => ({
      activeGroup: state.activeGroup?._id === groupId ? updated : state.activeGroup,
      myGroups: state.myGroups.map((g) => (g._id === groupId ? updated : g)),
    }));
    return updated;
  },

  joinGroup: async (groupId) => {
    const res = await groupService.joinGroup(groupId);
    const updated = res.data.group;
    set((state) => ({
      myGroups: [updated, ...state.myGroups],
      discoverableGroups: state.discoverableGroups.filter((g) => g._id !== groupId),
    }));
    return updated;
  },

  leaveGroup: async (groupId) => {
    await groupService.leaveGroup(groupId);
    set((state) => ({
      myGroups: state.myGroups.filter((g) => g._id !== groupId),
      activeGroup: state.activeGroup?._id === groupId ? null : state.activeGroup,
    }));
  },
}));
