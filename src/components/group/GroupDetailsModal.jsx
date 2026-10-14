import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Avatar } from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import { useGroupStore } from "../../store/groupStore";
import { useAuthStore } from "../../store/authStore";
import { usePresenceStore } from "../../store/presenceStore";
import { authService } from "../../services/authService";
import {
  Users,
  Shield,
  UserMinus,
  UserPlus,
  LogOut,
  Crown,
  Search,
  BookOpen,
} from "lucide-react";

export const GroupDetailsModal = ({ isOpen, onClose, group }) => {
  const { user: currentUser } = useAuthStore();
  const { addMember, removeMember, updateMemberRole, leaveGroup } = useGroupStore();
  const { isOnline } = usePresenceStore();

  const [addMode, setAddMode] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  if (!group) return null;

  const currentMember = group.members?.find(
    (m) => m.user?._id === currentUser?._id || m.user === currentUser?._id
  );
  const isCreator = currentMember?.role === "creator";
  const isModerator = currentMember?.role === "moderator";
  const canModerate = isCreator || isModerator;

  const handleSearchStudents = async (query) => {
    setStudentSearchQuery(query);
    if (!query.trim()) {
      setStudentResults([]);
      return;
    }

    setIsSearchingStudents(true);
    try {
      const res = await authService.searchUsers(query);
      const existingIds = new Set(
        group.members.map((m) => (m.user?._id || m.user).toString())
      );
      // Filter out existing group members
      const nonMembers = (res.data.users || []).filter(
        (u) => !existingIds.has(u._id.toString())
      );
      setStudentResults(nonMembers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingStudents(false);
    }
  };

  const handleAddStudent = async (studentId) => {
    try {
      await addMember(group._id, studentId);
      setAddMode(false);
      setStudentSearchQuery("");
      setStudentResults([]);
    } catch (err) {
      alert(err.message || "Failed to add member");
    }
  };

  const handleRemove = async (userId) => {
    if (confirm("Are you sure you want to remove this student from the group?")) {
      try {
        await removeMember(group._id, userId);
      } catch (err) {
        alert(err.message || "Failed to remove member");
      }
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === "moderator" ? "student" : "moderator";
    try {
      await updateMemberRole(group._id, userId, nextRole);
    } catch (err) {
      alert(err.message || "Failed to update member role");
    }
  };

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this study group?")) {
      try {
        await leaveGroup(group._id);
        onClose();
      } catch (err) {
        alert(err.message || "Failed to leave group");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Study Group Details" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Group Header Info */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <Avatar src={group.avatar} alt={group.name} size="xl" />
          <div>
            <h4 className="text-lg font-bold text-white">{group.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                <BookOpen className="w-3 h-3" />
                {group.subjectOrTopic || "General Study"}
              </span>
              <span className="text-xs text-slate-400">
                {group.members?.length || 0} members
              </span>
            </div>
            {group.description && (
              <p className="text-xs text-slate-400 mt-2">{group.description}</p>
            )}
          </div>
        </div>

        {/* Member Management Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" />
              Members Roster ({group.members?.length || 0})
            </h5>
            {canModerate && (
              <button
                onClick={() => setAddMode(!addMode)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-600/20 hover:bg-brand-600 text-brand-400 hover:text-white border border-brand-500/30 text-xs font-semibold transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {addMode ? "Close Search" : "Add Student"}
              </button>
            )}
          </div>

          {/* Add Member Search Panel */}
          {addMode && (
            <div className="p-3 mb-4 rounded-xl bg-slate-800 border border-slate-700 space-y-3 animate-fadeIn">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students to invite..."
                  value={studentSearchQuery}
                  onChange={(e) => handleSearchStudents(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {studentResults.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {studentResults.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar src={s.avatar} alt={s.name} size="xs" />
                        <div>
                          <p className="font-semibold text-white">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.major || s.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudent(s._id)}
                        className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-md text-xs font-medium"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {group.members?.map((member) => {
              const student = member.user;
              if (!student) return null;
              const online = isOnline(student._id);
              const isSelf = student._id === currentUser?._id;

              return (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.avatar}
                      alt={student.name}
                      size="sm"
                      isOnline={online}
                      showStatus={true}
                    />
                    <div>
                      <p className="font-semibold text-white text-sm flex items-center gap-2">
                        {student.name} {isSelf && <span className="text-slate-500 text-xs">(You)</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <RoleBadge role={member.role} />
                        {student.major && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {student.major}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Creator can promote/demote moderators */}
                    {isCreator && !isSelf && member.role !== "creator" && (
                      <button
                        onClick={() => handleRoleToggle(student._id, member.role)}
                        title={
                          member.role === "moderator"
                            ? "Demote to Student"
                            : "Promote to Moderator"
                        }
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          member.role === "moderator"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30"
                            : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Creator/Moderator can remove member */}
                    {canModerate &&
                      !isSelf &&
                      member.role !== "creator" &&
                      !(isModerator && member.role === "moderator") && (
                        <button
                          onClick={() => handleRemove(student._id)}
                          title="Remove from group"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Leave Group
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
