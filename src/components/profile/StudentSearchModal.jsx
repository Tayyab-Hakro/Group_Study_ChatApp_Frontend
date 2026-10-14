import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { authService } from "../../services/authService";
import { chatService } from "../../services/chatService";
import { useChatStore } from "../../store/chatStore";
import { usePresenceStore } from "../../store/presenceStore";
import { Avatar } from "../common/Avatar";
import { Search, MessageSquare, Loader2 } from "lucide-react";

export const StudentSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { addOrUpdateConversation, setActiveConversationId } = useChatStore();
  const { isOnline } = usePresenceStore();

  useEffect(() => {
    if (!isOpen) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await authService.searchUsers(query);
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleStartChat = async (studentId) => {
    setIsStartingChat(true);
    try {
      const res = await chatService.getOrCreateDirectConversation(studentId);
      const conversation = res.data.conversation;
      addOrUpdateConversation(conversation);
      setActiveConversationId(conversation._id);
      onClose();
    } catch (err) {
      console.error("Failed to start direct conversation:", err);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Find Fellow Students" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, university, or major..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
          )}
        </div>

        {/* Results List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {results.length === 0 && !isSearching ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {query ? "No students found matching your query." : "Type a name or major to search."}
            </div>
          ) : (
            results.map((student) => {
              const online = isOnline(student._id);
              return (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.avatar}
                      alt={student.name}
                      size="md"
                      isOnline={online}
                      showStatus={true}
                    />
                    <div>
                      <p className="font-semibold text-white text-sm flex items-center gap-2">
                        {student.name}
                        {online && (
                          <span className="text-[11px] font-normal text-emerald-400">
                            • Online
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        {student.major || "Student"} {student.institution && `• ${student.institution}`}
                      </p>
                      {student.bio && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {student.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(student._id)}
                    disabled={isStartingChat}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
