import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useGroupStore } from "../../store/groupStore";
import { useChatStore } from "../../store/chatStore";
import { Users, BookOpen, Lock, Globe } from "lucide-react";

export const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useGroupStore();
  const { fetchConversations, setActiveConversationId } = useChatStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjectOrTopic, setSubjectOrTopic] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const group = await createGroup({
        name,
        description,
        subjectOrTopic: subjectOrTopic || "General Study",
        isPrivate,
      });

      // Refresh conversations to show the new group and open it
      await fetchConversations();
      if (group.conversationId) {
        setActiveConversationId(group.conversationId);
      }

      onClose();
      // Reset form
      setName("");
      setDescription("");
      setSubjectOrTopic("");
      setIsPrivate(false);
    } catch (err) {
      setError(err.message || "Failed to create study group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Study Room / Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Group Name *
          </label>
          <div className="relative">
            <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              minLength={3}
              maxLength={60}
              placeholder="e.g. Data Structures Study Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Subject or Topic
          </label>
          <div className="relative">
            <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. CS201 / Algorithms / Calculus"
              value={subjectOrTopic}
              onChange={(e) => setSubjectOrTopic(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Group Description
          </label>
          <textarea
            rows="3"
            maxLength={300}
            placeholder="What will this group collaborate on? (e.g. Exam prep, project discussion)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm resize-none"
          />
        </div>

        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPrivate ? (
              <Lock className="w-5 h-5 text-amber-400" />
            ) : (
              <Globe className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {isPrivate ? "Private Study Group" : "Public Study Group"}
              </p>
              <p className="text-xs text-slate-400">
                {isPrivate
                  ? "Only invited members can join and participate"
                  : "Discoverable by any student looking for study groups"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
