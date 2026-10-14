import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useGroupStore } from "../../store/groupStore";
import { useChatStore } from "../../store/chatStore";
import { Avatar } from "../common/Avatar";
import { Search, Users, BookOpen, UserPlus, Loader2 } from "lucide-react";

export const DiscoverGroupsModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const { discoverableGroups, fetchDiscoverableGroups, addMember, fetchUserGroups } =
    useGroupStore();
  const { fetchConversations, setActiveConversationId } = useChatStore();
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      await fetchDiscoverableGroups(query);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleJoinGroup = async (group) => {
    setIsJoining(true);
    try {
      await joinGroup(group._id);
      await fetchUserGroups();
      await fetchConversations();

      if (group.conversationId) {
        setActiveConversationId(group.conversationId);
      }
      onClose();
    } catch (err) {
      alert(err.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discover Public Study Groups"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search public study circles by subject, topic or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            autoFocus
          />
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {discoverableGroups.length === 0 && !loading ? (
            <div className="col-span-2 text-center py-10 text-slate-400 text-sm">
              No new public study groups found. Why not create one?
            </div>
          ) : (
            discoverableGroups.map((group) => (
              <div
                key={group._id}
                className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <Avatar src={group.avatar} alt={group.name} size="md" />
                    <div>
                      <h5 className="font-semibold text-white text-sm line-clamp-1">
                        {group.name}
                      </h5>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-400">
                        <BookOpen className="w-3 h-3" />
                        {group.subjectOrTopic || "General Study"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {group.description || "Active student collaboration and study group."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{group.members?.length || 1} students</span>
                  </div>

                  <button
                    onClick={() => handleJoinGroup(group)}
                    disabled={isJoining}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Join Group
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
