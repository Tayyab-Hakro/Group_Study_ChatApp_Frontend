import React, { useState, useEffect } from "react";
import { Navbar } from "../components/common/Navbar";
import { ConversationList } from "../components/chat/ConversationList";
import { ChatArea } from "../components/chat/ChatArea";
import { CallOverlay } from "../components/call/CallOverlay";
import { ProfileModal } from "../components/profile/ProfileModal";
import { StudentSearchModal } from "../components/profile/StudentSearchModal";
import { CreateGroupModal } from "../components/group/CreateGroupModal";
import { DiscoverGroupsModal } from "../components/group/DiscoverGroupsModal";
import { GroupDetailsModal } from "../components/group/GroupDetailsModal";

import { useChatStore } from "../store/chatStore";
import { useGroupStore } from "../store/groupStore";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";

import { MessageSquare, Users, Video, Compass, Plus } from "lucide-react";

export const DashboardPage = () => {
  const {
    conversations,
    activeConversationId,
    fetchConversations,
    setActiveConversationId,
    getActiveConversation,
  } = useChatStore();

  const { fetchUserGroups, activeGroup, fetchGroupDetails } = useGroupStore();

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    emitTyping,
    emitStopTyping,
    sendSocketMessage,
  } = useSocket();

  const { joinCall, leaveCall, toggleScreenShare } = useWebRTC();

  // Modal triggers
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchUserGroups();
  }, []);

  // Handle active conversation room subscription
  useEffect(() => {
    if (activeConversationId) {
      joinConversation(activeConversationId);
    }
    return () => {
      if (activeConversationId) {
        leaveConversation(activeConversationId);
      }
    };
  }, [activeConversationId]);

  const activeConversation = getActiveConversation();

  const handleStartCall = (roomId, roomName, isVideo = true) => {
    joinCall(roomId, roomName, isVideo);
  };

  const handleOpenGroupDetails = async () => {
    if (activeConversation?.groupDetails?._id) {
      await fetchGroupDetails(activeConversation.groupDetails._id);
      setIsGroupDetailsOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Navbar */}
      <Navbar
        isConnected={isConnected}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDiscover={() => setIsDiscoverOpen(true)}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversations & Groups */}
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(id) => setActiveConversationId(id)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        />

        {/* Right Area: Chat or Welcome Empty State */}
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            onStartCall={handleStartCall}
            onOpenGroupDetails={handleOpenGroupDetails}
            emitTyping={emitTyping}
            emitStopTyping={emitStopTyping}
            sendSocketMessage={sendSocketMessage}
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 shadow-2xl">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Select a Conversation or Study Circle
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-8">
              Collaborate in real-time with students, share documents & lecture notes, or join group study video calls.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all"
              >
                <Users className="w-4 h-4" />
                Find Students
              </button>
              <button
                onClick={() => setIsDiscoverOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                Discover Groups
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WebRTC Active Call Overlay */}
      <CallOverlay
        onLeaveCall={leaveCall}
        onToggleScreenShare={toggleScreenShare}
      />

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <StudentSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />

      <DiscoverGroupsModal
        isOpen={isDiscoverOpen}
        onClose={() => setIsDiscoverOpen(false)}
      />

      <GroupDetailsModal
        isOpen={isGroupDetailsOpen}
        onClose={() => setIsGroupDetailsOpen(false)}
        group={activeGroup || activeConversation?.groupDetails}
      />
    </div>
  );
};
