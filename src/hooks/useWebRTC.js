import { useRef, useCallback, useEffect } from "react";
import { getSocket } from "./useSocket";
import { useCallStore } from "../store/callStore";
import { SOCKET_EVENTS } from "../utils/constants";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = () => {
  const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  const {
    isInCall,
    activeRoomId,
    startCall,
    endCall,
    addRemoteStream,
    removeRemoteStream,
    updatePeerMedia,
    setScreenSharing,
    isScreenSharing,
  } = useCallStore();

  const createPeerConnection = useCallback((targetSocketId, targetUser) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current.set(targetSocketId, pc);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket();
        if (socket) {
          socket.emit(SOCKET_EVENTS.CALL_SIGNAL, {
            to: targetSocketId,
            signal: { candidate: event.candidate },
          });
        }
      }
    };

    // Handle remote tracks
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        addRemoteStream(targetSocketId, remoteStream, targetUser);
      }
    };

    return pc;
  }, [addRemoteStream]);

  // Join call study room
  const joinCall = useCallback(async (roomId, roomName, isVideo = true) => {
    const socket = getSocket();
    if (!socket) {
      alert("Real-time connection not ready. Please try again.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
      });

      localStreamRef.current = stream;
      startCall(roomId, roomName, stream);

      socket.emit(SOCKET_EVENTS.CALL_JOIN_ROOM, { roomId });
    } catch (err) {
      console.error("Failed to access media devices:", err);
      alert("Could not access camera or microphone. Please check browser permissions.");
    }
  }, [startCall]);

  // Leave active call
  const leaveCall = useCallback(() => {
    const socket = getSocket();
    if (socket && activeRoomId) {
      socket.emit(SOCKET_EVENTS.CALL_LEAVE_ROOM, { roomId: activeRoomId });
    }

    // Close all peer connections
    peersRef.current.forEach((pc) => {
      pc.close();
    });
    peersRef.current.clear();

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    endCall();
  }, [activeRoomId, endCall]);

  // Screen sharing toggle
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Revert back to camera track
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const camTrack = camStream.getVideoTracks()[0];

        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localStreamRef.current.addTrack(camTrack);
        }

        setScreenSharing(false);
      } catch (err) {
        console.error("Failed to revert to camera:", err);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          toggleScreenShare(); // Handle user clicking native browser 'Stop sharing'
        };

        setScreenSharing(true);
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    }
  }, [isScreenSharing, setScreenSharing]);

  // Set up socket signaling listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isInCall) return;

    // 1. Existing peers already in the room: initiate offer to them
    const handleExistingPeers = async ({ peers }) => {
      for (const peer of peers) {
        const pc = createPeerConnection(peer.socketId, peer.user);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit(SOCKET_EVENTS.CALL_SIGNAL, {
            to: peer.socketId,
            signal: offer,
          });
        } catch (err) {
          console.error("Failed to create offer for peer:", err);
        }
      }
    };

    // 2. Incoming WebRTC signal (offer, answer, or ice candidate)
    const handleSignal = async ({ from, signal }) => {
      let pc = peersRef.current.get(from);

      if (signal.type === "offer") {
        if (!pc) {
          pc = createPeerConnection(from);
        }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit(SOCKET_EVENTS.CALL_SIGNAL, {
            to: from,
            signal: answer,
          });
        } catch (err) {
          console.error("Failed to handle offer:", err);
        }
      } else if (signal.type === "answer") {
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
          } catch (err) {
            console.error("Failed to set remote answer:", err);
          }
        }
      } else if (signal.candidate) {
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error("Failed to add ICE candidate:", err);
          }
        }
      }
    };

    // 3. User left room
    const handleUserLeft = ({ socketId }) => {
      const pc = peersRef.current.get(socketId);
      if (pc) {
        pc.close();
        peersRef.current.delete(socketId);
      }
      removeRemoteStream(socketId);
    };

    // 4. Peer updated audio/video state
    const handlePeerMediaUpdated = ({ socketId, isAudioMuted, isVideoOff }) => {
      updatePeerMedia(socketId, { isAudioMuted, isVideoOff });
    };

    socket.on(SOCKET_EVENTS.CALL_EXISTING_PEERS, handleExistingPeers);
    socket.on(SOCKET_EVENTS.CALL_SIGNAL, handleSignal);
    socket.on(SOCKET_EVENTS.CALL_USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.CALL_PEER_MEDIA_UPDATED, handlePeerMediaUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_EXISTING_PEERS, handleExistingPeers);
      socket.off(SOCKET_EVENTS.CALL_SIGNAL, handleSignal);
      socket.off(SOCKET_EVENTS.CALL_USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.CALL_PEER_MEDIA_UPDATED, handlePeerMediaUpdated);
    };
  }, [isInCall, createPeerConnection, removeRemoteStream, updatePeerMedia]);

  return {
    joinCall,
    leaveCall,
    toggleScreenShare,
  };
};
