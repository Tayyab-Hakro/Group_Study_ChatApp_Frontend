import { create } from "zustand";

export const useCallStore = create((set, get) => ({
  isInCall: false,
  activeRoomId: null,
  activeRoomName: null,
  localStream: null,
  remoteStreams: new Map(), // socketId -> { stream, user, isAudioMuted, isVideoOff }
  isAudioMuted: false,
  isVideoOff: false,
  isScreenSharing: false,

  startCall: (roomId, roomName, localStream) => {
    set({
      isInCall: true,
      activeRoomId: roomId,
      activeRoomName: roomName,
      localStream,
      remoteStreams: new Map(),
      isAudioMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
    });
  },

  endCall: () => {
    const { localStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    set({
      isInCall: false,
      activeRoomId: null,
      activeRoomName: null,
      localStream: null,
      remoteStreams: new Map(),
      isAudioMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
    });
  },

  setLocalStream: (stream) => {
    set({ localStream: stream });
  },

  addRemoteStream: (socketId, stream, user) => {
    set((state) => {
      const updated = new Map(state.remoteStreams);
      const existing = updated.get(socketId) || {};
      updated.set(socketId, {
        ...existing,
        stream,
        user: user || existing.user,
      });
      return { remoteStreams: updated };
    });
  },

  removeRemoteStream: (socketId) => {
    set((state) => {
      const updated = new Map(state.remoteStreams);
      updated.delete(socketId);
      return { remoteStreams: updated };
    });
  },

  updatePeerMedia: (socketId, { isAudioMuted, isVideoOff }) => {
    set((state) => {
      const updated = new Map(state.remoteStreams);
      if (updated.has(socketId)) {
        const current = updated.get(socketId);
        updated.set(socketId, {
          ...current,
          ...(typeof isAudioMuted === "boolean" ? { isAudioMuted } : {}),
          ...(typeof isVideoOff === "boolean" ? { isVideoOff } : {}),
        });
      }
      return { remoteStreams: updated };
    });
  },

  toggleAudio: () => {
    const { localStream, isAudioMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted; // toggle
      });
    }
    set({ isAudioMuted: !isAudioMuted });
  },

  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff; // toggle
      });
    }
    set({ isVideoOff: !isVideoOff });
  },

  setScreenSharing: (isSharing) => {
    set({ isScreenSharing: isSharing });
  },
}));
