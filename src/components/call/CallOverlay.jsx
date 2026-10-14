import React, { useEffect, useRef, useState } from "react";
import { useCallStore } from "../../store/callStore";
import { Avatar } from "../common/Avatar";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
  Minimize2,
  Users,
} from "lucide-react";

export const CallOverlay = ({ onLeaveCall, onToggleScreenShare }) => {
  const {
    isInCall,
    activeRoomName,
    localStream,
    remoteStreams,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
  } = useCallStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const localVideoRef = useRef(null);

  // Bind local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  if (!isInCall) return null;

  const remotePeersList = Array.from(remoteStreams.entries());
  const totalParticipants = remotePeersList.length + 1;

  // Compute grid columns based on participant count
  const getGridClass = () => {
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    return "grid-cols-2 md:grid-cols-3";
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isMinimized
          ? "bottom-4 right-4 w-80 h-52 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900"
          : "inset-0 bg-slate-950/95 backdrop-blur-xl flex flex-col"
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="font-bold text-white text-sm">
            Study Call: {activeRoomName || "Active Room"}
          </h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {totalParticipants} participant{totalParticipants > 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title={isMinimized ? "Maximize Video Grid" : "Minimize Window"}
        >
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Video Grid View */}
      <div
        className={`flex-1 p-4 grid gap-4 overflow-y-auto items-center justify-center ${getGridClass()}`}
      >
        {/* Local Participant Tile */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center w-full h-full min-h-[180px] shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isVideoOff ? "hidden" : "block"
            }`}
          />

          {isVideoOff && (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <Avatar size="xl" alt="You" />
              <p className="text-xs font-semibold">Camera is turned off</p>
            </div>
          )}

          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 border border-slate-800">
            <span>You {isScreenSharing && "(Sharing Screen)"}</span>
            {isAudioMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
          </div>
        </div>

        {/* Remote Participants Tiles */}
        {remotePeersList.map(([socketId, peerData]) => {
          return (
            <RemotePeerTile
              key={socketId}
              stream={peerData.stream}
              user={peerData.user}
              isAudioMuted={peerData.isAudioMuted}
              isVideoOff={peerData.isVideoOff}
            />
          );
        })}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 flex items-center justify-center gap-3 sm:gap-4 bg-slate-900/90 border-t border-slate-800 flex-shrink-0">
        {/* Toggle Microphone */}
        <button
          onClick={toggleAudio}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isAudioMuted
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
              : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
          title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Toggle Video Camera */}
        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isVideoOff
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
              : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
          title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3.5 rounded-2xl transition-all shadow-md ${
            isScreenSharing
              ? "bg-brand-600 text-white shadow-brand-500/30"
              : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white"
          }`}
          title={isScreenSharing ? "Stop Screen Share" : "Share Your Screen"}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* Leave / End Call */}
        <button
          onClick={onLeaveCall}
          className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
          title="Leave Study Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">Leave Room</span>
        </button>
      </div>
    </div>
  );
};

// Sub-component for remote peer video
const RemotePeerTile = ({ stream, user, isAudioMuted, isVideoOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center w-full h-full min-h-[180px] shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
      />

      {isVideoOff && (
        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
          <Avatar src={user?.avatar} alt={user?.name || "Peer"} size="xl" />
          <p className="text-xs font-semibold">{user?.name || "Participant"}</p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 border border-slate-800">
        <span>{user?.name || "Student"}</span>
        {isAudioMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
      </div>
    </div>
  );
};
