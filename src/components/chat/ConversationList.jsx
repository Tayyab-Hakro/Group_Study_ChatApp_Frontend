import React, { useState } from "react";
import { Avatar } from "../common/Avatar";
import { useAuthStore } from "../../store/authStore";
import { usePresenceStore } from "../../store/presenceStore";
import {
  MessageSquare,
  Users,
  Search,
  BookOpen,
  Plus,
} from "lucide-react";

export const ConversationList = ({
  conversations = [],
  activeId,
  onSelect,
  onOpenSearch,
  onOpenCreateGroup,
}) => {
  const { user: currentUser } = useAuthStore();
  const { isOnline } = usePresenceStore();
  const [filter, setFilter] = useState("all"); // 'all' | 'direct' | 'group'
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter((c) => {
    if (filter === "direct" && c.type !== "direct") return false;
    if (filter === "group" && c.type !== "group") return false;

    if (!searchQuery.trim()) return true;

    if (c.type === "group") {
      return c.groupDetails?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    } else {
      const peer = c.participants?.find((p) => p._id !== currentUser?._id);
      return peer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full flex-shrink-0">
      {/* Header Search & Filter */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            Chats & Rooms
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
            {conversations.length}
          </span>
        </div>

        {/* Filter Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-800/60 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("direct")}
            className={`py-1.5 rounded-lg transition-all ${
              filter === "direct"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setFilter("group")}
            className={`py-1.5 rounded-lg transition-all ${
              filter === "group"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {searchQuery ? "No matching chats" : "No active chats yet"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Find fellow students or create a study group to start collaborating.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={onOpenSearch}
                className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors"
              >
                Find Students
              </button>
              <button
                onClick={onOpenCreateGroup}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                New Group
              </button>
            </div>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isGroup = conv.type === "group";
            const peer = isGroup
              ? null
              : conv.participants?.find((p) => p._id !== currentUser?._id);

            const title = isGroup ? conv.groupDetails?.name || "Study Group" : peer?.name || "Student";
            const avatar = isGroup ? conv.groupDetails?.avatar : peer?.avatar;
            const online = !isGroup && peer ? isOnline(peer._id) : false;
            const isActive = conv._id === activeId;

            // Unread count for current user
            const unread = conv.unreadCounts?.[currentUser?._id] || 0;

            const lastMsg = conv.lastMessage;
            let snippet = "No messages yet";
            if (lastMsg) {
              if (lastMsg.attachments && lastMsg.attachments.length > 0 && !lastMsg.content) {
                snippet = "📎 Attachment shared";
              } else {
                snippet = lastMsg.content;
              }
            }

            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                  isActive
                    ? "bg-brand-600/15 border-brand-500/40 shadow-sm"
                    : "bg-slate-800/20 hover:bg-slate-800/60 border-transparent"
                }`}
              >
                <Avatar
                  src={avatar}
                  alt={title}
                  size="md"
                  isOnline={online}
                  showStatus={!isGroup}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-brand-300" : "text-white"
                      }`}
                    >
                      {title}
                    </h4>
                    {conv.updatedAt && (
                      <span className="text-[10px] text-slate-500 flex-shrink-0 ml-1">
                        {formatTime(conv.updatedAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 truncate pr-2">
                      {snippet}
                    </p>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
